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

let group = new THREE.Group(); // Objects of the scene will be added in this group
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
let camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 3000);
let clock = new THREE.Clock();

//-- Skybox --------------------------------------------------------------------------------------

const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
const skyBoxMaterials = [
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cube/Bridge/posx.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cube/Bridge/negx.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cube/Bridge/posy.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cube/Bridge/negy.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cube/Bridge/posz.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cube/Bridge/negz.jpg"), side: THREE.DoubleSide}),
];
const skybox = new THREE.Mesh(skyboxGeometry, skyBoxMaterials);
	//skybox.receiveShadow = true;

scene.add(skybox);

//-- Create VR button and settings ---------------------------------------------------------------

document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// To be used outside a VR environment (desktop, for example)
let lookCamera = setLookNonVRBehavior(camera, renderer, "On desktop, press 'Q' or 'E' to change orientation.",
														"Labelling functions are available only in VR mode.");

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

				var obj = normalizeAndRescale(obj, desiredScale);
				//var obj = fixPosition(obj);
				obj.position.x = -15;
				obj.position.y = -45;
				obj.position.z = 90;
				obj.rotateY(degreesToRadians(angle));

				group.add (obj); 
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

function animate()
{
	renderer.setAnimationLoop(render);
}

function render()
{
    lookCamera.update(clock.getDelta());
	renderer.render(scene, camera);
}

//-- Auxiliary Scene Creation function -----------------------------------------------------------

function createScene()
{
	const light = new THREE.PointLight("rgb(255, 255, 255)");
		light.position.set(0, 10, 3);
		light.castShadow = true;
		light.shadow.mapSize.width = 1024; // Default
		light.shadow.mapSize.height = 1024; // Default

	scene.add(light);

	scene.add(new THREE.HemisphereLight("rgb(80, 80, 80)"));

	//const textureLoader = new THREE.TextureLoader();
	//const floorTexture = textureLoader.load("../assets/textures/cube/Bridge/negy.jpg");
	//const floorGeometry = new THREE.PlaneGeometry(100, 100);
	//const floorMaterial = new THREE.MeshLambertMaterial({side: THREE.DoubleSide});
	//const floor = new THREE.Mesh(floorGeometry, floorMaterial);
	//floor.rotation.x = -Math.PI/2;
	//floor.position.y -= 50;
	//floor.material.map = floorTexture;  	
	//floor.receiveShadow = true;

	//scene.add(floor);

	const ballGeometry = new THREE.SphereGeometry(5, 32, 32);
	let ballTexture = new THREE.MeshLambertMaterial({
		map: new THREE.TextureLoader().load("../assets/textures/basketball-gray.png"),
		color: 0x964B00
	});
	let ballMesh = new THREE.Mesh(ballGeometry, ballTexture);
		ballMesh.position.y = -45;
		ballMesh.position.z = -90;
		ballMesh.receiveShadow = true;
		ballMesh.castShadow = true;

	group.add(ballMesh);

	loadOBJFile("../assets/objects/", "L200", 100, -120, true);

	scene.add(group);
}