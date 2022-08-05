//-- Imports -------------------------------------------------------------------------------------

import * as THREE from  "three";
import {VRButton} from "../build/jsm/webxr/VRButton.js";
import {setLookNonVRBehavior} from "../libs/util/utilVR.js";
import {OBJLoader} from "../build/jsm/loaders/OBJLoader.js";
import {MTLLoader} from "../build/jsm/loaders/MTLLoader.js";
import {onWindowResize,
		getMaxSize,
		degreesToRadians} from "../libs/util/util.js";

//------------------------------------------------------------------------------------------------
//------------------------------------------ MAIN SCRIPT -----------------------------------------
//------------------------------------------------------------------------------------------------

//-- General globals -----------------------------------------------------------------------------

let raycaster = new THREE.Raycaster(); // Raycaster to enable selection and dragging

let objectsGroup = new THREE.Group(); // Objects of the scene will be added in this group
let slideBarsGroup = new THREE.Group(); // Slide bars of the scene will be added in this group

const intersected = []; // Will be used to help controlling the intersected objects
window.addEventListener("resize", onWindowResize);

//-- Renderer and html settings ------------------------------------------------------------------

let renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setClearColor(new THREE.Color("rgb(70, 150, 240)"));
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;
	renderer.xr.enabled = true;

//-- Setting scene and camera --------------------------------------------------------------------

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 30);
let clock = new THREE.Clock();

//-- Create VR button and settings ---------------------------------------------------------------

document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// To be used outside a VR environment (desktop, for example)
let lookCamera = setLookNonVRBehavior(camera, renderer, "On desktop, press 'Q' or 'E' to change orientation.",
														"Dragging functions are available only in VR mode.");

// Controllers
let controller1 = renderer.xr.getController(0);
	controller1.addEventListener("selectstart", onSelectStart);
	controller1.addEventListener("selectend", onSelectEnd);

scene.add(controller1);

// VR Camera Rectile 
var ringGeo = new THREE.RingGeometry(0.02, 0.04, 32);
var ringMat = new THREE.MeshBasicMaterial({
	color: "rgb(255, 255, 0)",
	opacity: 0.9, 
	transparent: true});
var rectile = new THREE.Mesh(ringGeo, ringMat);
 	rectile.position.set(0, 0, -2);

controller1.add(rectile);

//-- Slide bars ----------------------------------------------------------------------------------

var scaleBarGeo = new THREE.PlaneGeometry(0.075, 1.5);
var scaleBarMat = new THREE.MeshBasicMaterial({
	color: "rgb(255, 0, 0)",
	opacity: 0.9,
	transparent: true});
var scaleBar = new THREE.Mesh(scaleBarGeo, scaleBarMat);
	scaleBar.position.set(-1.25, 1, -2);

scene.add(scaleBar);

var rotateBarGeo = new THREE.PlaneGeometry(1.5, 0.075);
var rotateBarMat = new THREE.MeshBasicMaterial({
	color: "rgb(255, 0, 0)",
	opacity: 0.9,
	transparent: true});
var rotateBar = new THREE.Mesh(rotateBarGeo, rotateBarMat);
	rotateBar.position.set(0, -0.25, -2);

scene.add(rotateBar);

//-- Creating Scene and calling the main loop ----------------------------------------------------

createScene();
animate();

//------------------------------------------------------------------------------------------------
//------------------------------------------- FUNCTIONS ------------------------------------------
//------------------------------------------------------------------------------------------------

function loadOBJFile(modelPath, modelName, desiredScale, angle, visibility)
{
	var mtlLoader = new MTLLoader();
  		mtlLoader.setPath(modelPath);
  		mtlLoader.load(modelName + ".mtl", function(materials) {
      	materials.preload();

      	var objLoader = new OBJLoader();
      		objLoader.setMaterials(materials);
      		objLoader.setPath(modelPath);
      		objLoader.load(modelName + ".obj", function(obj) {
				obj.visible = visibility;
				obj.name = modelName;

				// Set "castShadow" and "receiveShadow" property for each children of the group
				obj.traverse(function(child) {
					child.castShadow = true;
					child.receiveShadow = true;
				});

				obj.traverse(function(node) {
					if(node.material) node.material.side = THREE.DoubleSide;
				});

				obj = normalizeAndRescale(obj, desiredScale);
				obj.rotateY(degreesToRadians(-angle-angle/2));
				obj = fixPosition(obj);

				objectsGroup.add(obj);
      		});
  	});
}

// Normalize scale and multiple by the newScale
function normalizeAndRescale(obj, newScale)
{
	var scale = getMaxSize(obj); // Available in 'utils.js'
  		obj.scale.set(newScale*(1.0/scale),
                  	  newScale*(1.0/scale),
                  	  newScale*(1.0/scale));
	
	return obj;
}

function fixPosition(obj)
{
  	// Fix position of the object over the ground plane
  	var box = new THREE.Box3().setFromObject(obj);
  
  	if(box.min.y > 0)
  		obj.translateY(-box.min.y);
  	else
  		obj.translateY(-1*box.min.y);

	return obj;
}

function onSelectStart(event)
{
	const controller = event.target;

	const intersections = getIntersections(controller);

	if(intersections.length > 0) {
		const intersection = intersections[0];
		const object = intersection.object;
			object.material.emissive.b = 1;

		controller.attach(object);
		controller.userData.selected = object;
	}
}

function onSelectEnd(event)
{
	const controller = event.target;

	if(controller.userData.selected !== undefined) {
		const object = controller.userData.selected;
			object.material.emissive.b = 0;

		slideBarsGroup.attach(object);

		controller.userData.selected = undefined;
	}
}

function getIntersections(controller)
{
	const tempMatrix = new THREE.Matrix4();	
		tempMatrix.identity().extractRotation(controller.matrixWorld);

	raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
	raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
	
	return raycaster.intersectObjects(slideBarsGroup.children);
}

function intersectObjects(controller)
{
	if(controller.userData.selected !== undefined) return;

	const intersections = getIntersections(controller);

	if(intersections.length > 0) {
		const intersection = intersections[0];
		const object = intersection.object;
			object.material.emissive.r = 1;

		intersected.push(object);
	}
}

function cleanIntersected()
{
	while(intersected.length) {
		const object = intersected.pop();
			object.material.emissive.r = 0;
	}
}

function animate()
{
	renderer.setAnimationLoop(render);
}

function render()
{
	lookCamera.update(clock.getDelta()); 
    
	cleanIntersected();
    intersectObjects(controller1);   
	
	renderer.render(scene, camera);
}

//-- Auxiliary Scene Creation function -----------------------------------------------------------

function createScene()
{
	const light = new THREE.DirectionalLight("rgb(255, 255, 255)");
		light.position.set(-3, 3, 3);
		light.castShadow = true;
		light.shadow.mapSize.width = 4096; // Default
		light.shadow.mapSize.height = 4096; // Default

	scene.add(light);

	scene.add(new THREE.HemisphereLight("rgb(80, 80, 80)"));

	const baseGeometry = new THREE.CylinderGeometry(2, 2, 0.2, 32);
	const baseMaterial = new THREE.MeshLambertMaterial({color: "rgb(80, 80, 80)"});
	const base = new THREE.Mesh(baseGeometry, baseMaterial);
		base.rotation.y = -Math.PI/2;
		base.position.y = -2
		base.position.z = -7
		base.receiveShadow = true;

	scene.add(base);

	const floorGeometry = new THREE.PlaneGeometry(1000, 1000);
	const floorMaterial = new THREE.MeshLambertMaterial({color: "rgb(255, 255, 255)"});
	const floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.rotation.x = -Math.PI/2;
		floor.position.y = -2
		floor.position.z = -6
		floor.receiveShadow = true;

	scene.add(floor);

	loadOBJFile("../assets/objects/", "littleCow", 3, 90, true);

	base.add(objectsGroup);
}