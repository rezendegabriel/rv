//-- Imports -------------------------------------------------------------------------------------

import * as THREE from  "three";
import {VRButton} from "../build/jsm/webxr/VRButton.js";
import {onWindowResize} from "../libs/util/util.js";
import {FontLoader} from "../build/jsm/loaders/FontLoader.js";
import {setLookNonVRBehavior} from "../libs/util/utilVR.js";

//------------------------------------------------------------------------------------------------
//------------------------------------------ MAIN SCRIPT -----------------------------------------
//------------------------------------------------------------------------------------------------

//-- General globals -----------------------------------------------------------------------------

let raycaster = new THREE.Raycaster(); // Raycaster to enable selection and dragging

// Objects of the scene will be added in this group
let groupProducts = new THREE.Group();
let shelfGroup = new THREE.Group();

const intersected = []; // Will be used to help controlling the intersected objects
window.addEventListener("resize", onWindowResize);

//-- Renderer and html settings ------------------------------------------------------------------

let renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(new THREE.Color("rgb(70, 150, 240)"));
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;
	renderer.xr.enabled = true;

//-- Setting scene and camera --------------------------------------------------------------------

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 1000);
let clock = new THREE.Clock();

//-- Skybox --------------------------------------------------------------------------------------

const skyboxGeometry = new THREE.BoxGeometry(800, 250, 800);
const skyBoxMaterials = [
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/displacement/Wall_Stone_020_ambientOcclusion.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/displacement/Wall_Stone_020_ambientOcclusion.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/grid.png"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/intertravado.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/displacement/Wall_Stone_020_ambientOcclusion.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/displacement/Wall_Stone_020_ambientOcclusion.jpg"), side: THREE.DoubleSide}),
];
const skybox = new THREE.Mesh(skyboxGeometry, skyBoxMaterials);
	skybox.material[0].map.wrapS = THREE.RepeatWrapping;
	skybox.material[0].map.wrapT = THREE.RepeatWrapping; 
	skybox.material[0].map.repeat.set(2, 1);
	skybox.material[1].map.wrapS = THREE.RepeatWrapping;
	skybox.material[1].map.wrapT = THREE.RepeatWrapping; 
	skybox.material[1].map.repeat.set(2, 1);
	skybox.material[2].map.wrapS = THREE.RepeatWrapping;
	skybox.material[2].map.wrapT = THREE.RepeatWrapping; 
	skybox.material[2].map.repeat.set(8, 8);
	skybox.material[3].map.wrapS = THREE.RepeatWrapping;
	skybox.material[3].map.wrapT = THREE.RepeatWrapping; 
	skybox.material[3].map.repeat.set(2, 2);
	skybox.material[4].map.wrapS = THREE.RepeatWrapping;
	skybox.material[4].map.wrapT = THREE.RepeatWrapping; 
	skybox.material[4].map.repeat.set(2, 1);
	skybox.material[5].map.wrapS = THREE.RepeatWrapping;
	skybox.material[5].map.wrapT = THREE.RepeatWrapping; 
	skybox.material[5].map.repeat.set(2, 1);
	//skybox.receiveShadow = true;

scene.add(skybox);

//-- Font loader ---------------------------------------------------------------------------------

const fontLoader = new FontLoader();
let fontGeometry = null;

//-- Create VR button and settings ---------------------------------------------------------------

document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// To be used outside a VR environment (desktop, for example)
let lookCamera = setLookNonVRBehavior(camera, renderer, "On desktop, press 'Q' or 'E' to change orientation.",
														"Labelling functions are available only in VR mode.");

// Controllers
let controller1 = renderer.xr.getController(0);
	controller1.addEventListener("selectstart", onSelectStart);
	controller1.addEventListener("selectend", onSelectEnd);

scene.add(controller1);

// VR Camera Rectile 
var ringGeo = new THREE.RingGeometry(2, 4, 32);
var ringMat = new THREE.MeshBasicMaterial({
	color: "rgb(255, 255, 0)",
	opacity: 0.9, 
	transparent: true});
var rectile = new THREE.Mesh(ringGeo, ringMat);
 	rectile.position.set(0, 0, -195);

controller1.add(rectile);

//-- Creating Scene and calling the main loop ----------------------------------------------------

createScene();
animate();

//------------------------------------------------------------------------------------------------
//------------------------------------------- FUNCTIONS ------------------------------------------
//------------------------------------------------------------------------------------------------

function onSelectStart(event)
{
	const controller = event.target;
	const intersections = getIntersections(controller);

	if(intersections.length > 0) {
		const intersection = intersections[0];
		const object = intersection.object;
			object.material.emissive.b = 1;

		changeFont(object.name + ": $ 0.00"); // This function add text on a specific position in the VR environment
		
		controller.userData.selected = object;
		controller.attach(object);
	}
}

function onSelectEnd(event)
{
	const controller = event.target;

	if(controller.userData.selected !== undefined) {
		const object = controller.userData.selected;
			object.material.emissive.b = 0;

		groupProducts.attach(object);

		controller.userData.selected = undefined;

		if(fontGeometry) {
			// Deleting fontGeometry and removing from the scene
			fontGeometry.geometry.dispose();
			fontGeometry.material.dispose();

			scene.remove(fontGeometry);
		}
	}
}

function getIntersections(controller)
{
	const tempMatrix = new THREE.Matrix4();	
		tempMatrix.identity().extractRotation(controller.matrixWorld);

	raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
	raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
	
	return raycaster.intersectObjects(groupProducts.children);
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
	// Controls if VR Mode is ON
	if(renderer.xr.isPresenting) {
    	cleanIntersected();
    	intersectObjects(controller1);   
	}
	else
    	lookCamera.update(clock.getDelta());    
	
	renderer.render(scene, camera);
}

//-- Auxiliary Scene Creation function -----------------------------------------------------------

function createScene()
{
	const light = new THREE.PointLight("rgb(255, 255, 255)");
		light.position.set(0, 250, 0);
		light.castShadow = true;
		light.shadow.mapSize.width = 1024; // Default
		light.shadow.mapSize.height = 1024; // Default

	scene.add(light);

	scene.add(new THREE.HemisphereLight("rgb(80, 80, 80)"));

	const shelf = [
		new THREE.BoxGeometry(200, 200, 5),
		new THREE.BoxGeometry(200, 5, 50),
		new THREE.BoxGeometry(200, 5, 50),
		new THREE.BoxGeometry(200, 5, 50),
		new THREE.BoxGeometry(200, 5, 50),
		new THREE.BoxGeometry(200, 5, 50),
		new THREE.BoxGeometry(200, 5, 50),
	]

	for(let i = 0; i < 7; i ++) {
		const shelf_i = shelf[i];
		const material = new THREE.MeshPhongMaterial({color: 0xADBAC0});

		if(i == 0) {
			const object = new THREE.Mesh(shelf_i, material);
				object.position.y = -25
				object.position.z = -225;
				object.castShadow = true;
				object.receiveShadow = true;

			shelfGroup.add(object);
		}

		if(i > 0) {
			const object = new THREE.Mesh(shelf_i, material);
				object.position.y = -120+(i-1)*32.5;
				object.position.z = -205;
				object.castShadow = true;
				object.receiveShadow = true;
		
			shelfGroup.add(object);
		}
	}

	scene.add(shelfGroup);

	const productTexture = new THREE.TextureLoader().load("../assets/textures/crate.jpg");

	const products = [
		new THREE.BoxGeometry(15, 20, 10),
		new THREE.BoxGeometry(10, 20, 5),
		new THREE.BoxGeometry(7.5, 20, 10),
		new THREE.BoxGeometry(10, 20, 7.5),
		new THREE.BoxGeometry(17.5, 20, 10),
		new THREE.BoxGeometry(10, 20, 10),
	];

	for (let i = 0; i < 6; i ++) {
		const product = products[i];
		const material = new THREE.MeshPhongMaterial({color: 0x383837});
	
		let id = i+1;
		const object = new THREE.Mesh(product, material);
			object.name = "Box " + id;
			object.position.x = -75+30*i;
			object.position.y = (-10-3*32.5)+32.5*(i);
			object.position.z = -195;
			object.material.map = productTexture;
			object.castShadow = true;
			object.receiveShadow = true;
	
		groupProducts.add(object);
	}

	scene.add(groupProducts);
}

//-- Function to create and render the text in the VR environment --------------------------------
function changeFont(message)
{
	if(fontGeometry) scene.remove(fontGeometry);

	fontLoader.load( "../assets/fonts/helvetiker_regular.typeface.json", function (font) {
		const matLite = new THREE.MeshBasicMaterial({ color: "rgb(0, 0, 255)"});
		const shapes = font.generateShapes(message, 0.1);

		const geometry = new THREE.ShapeGeometry(shapes);
		geometry.computeBoundingBox(); // Compute bounding box to help centralize the text
		const xMid = -0.5*(geometry.boundingBox.max.x - geometry.boundingBox.min.x);
		geometry.translate(xMid, 2, 0);

		fontGeometry = new THREE.Mesh(geometry, matLite);
		fontGeometry.position.set(0, -1, -2);
		scene.add(fontGeometry);
	});	
}