//-- Imports -------------------------------------------------------------------------------------

import * as THREE from  "three";
import {VRButton} from "../build/jsm/webxr/VRButton.js";
import {degreesToRadians,
		onWindowResize
		} from "../libs/util/util.js";
import {setFlyNonVRBehavior} from "../libs/util/utilVR.js";

//------------------------------------------------------------------------------------------------
//------------------------------------------ MAIN SCRIPT -----------------------------------------
//------------------------------------------------------------------------------------------------

//-- General globals -----------------------------------------------------------------------------

window.addEventListener("resize", onWindowResize);

//-- Renderer settings ---------------------------------------------------------------------------

let renderer = new THREE.WebGLRenderer();
	renderer.setClearColor(new THREE.Color("rgb(80, 80, 80)"));
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.xr.enabled = true;
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;

//-- Setting scene and camera -------------------------------------------------------------------

let scene = new THREE.Scene();
let clock = new THREE.Clock();

let camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 500);
let moveCamera; // Move when a button is pressed 

// To be used outside a VR environment (Desktop, for example)
let flyCamera = setFlyNonVRBehavior(camera, renderer, "On desktop, use mouse and WASD-QE to navigate.");

// 'Camera Holder' to help moving the camera
let cameraHolder = new THREE.Object3D();
	//cameraHolder.position.set(0, 72.5, 125);
	cameraHolder.position.set(0, 0, 30);
	cameraHolder.add(camera);

scene.add(cameraHolder);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(120);
scene.add(axesHelper);

//-- Creating rooms -----------------------------------------------------------------------

const roomAGeometry = new THREE.BoxGeometry(60, 30, 60);
const roomAMaterials = [
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/darkcement.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/darkcement.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.DoubleSide}),
];
const roomA = new THREE.Mesh(roomAGeometry, roomAMaterials);
	for(let i = 0; i < roomAMaterials.length; i++) {
		roomA.material[i].map.wrapS = THREE.RepeatWrapping;
		roomA.material[i].map.wrapT = THREE.RepeatWrapping; 
		roomA.material[i].map.repeat.set(2, 1);
	}

scene.add(roomA);

const roomBGeometry = new THREE.BoxGeometry(60, 30, 60);
const roomBMaterials = [
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/darkcement.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/darkcement.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.DoubleSide}),
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.DoubleSide}),
];
const roomB = new THREE.Mesh(roomBGeometry, roomBMaterials);
	for(let i = 0; i < roomBMaterials.length; i++) {
		roomB.material[i].map.wrapS = THREE.RepeatWrapping;
		roomB.material[i].map.wrapT = THREE.RepeatWrapping; 
		roomB.material[i].map.repeat.set(2, 1);
	}
	roomB.position.set(60+1.5, 0, 0);

scene.add(roomB);

//-- Create VR button and settings ---------------------------------------------------------------

document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Controllers
var controller1 = renderer.xr.getController(0);
	controller1.addEventListener("selectstart", onSelectStart);
	controller1.addEventListener("selectend", onSelectEnd);
camera.add(controller1);

//-- Creating Scene and calling the main loop ----------------------------------------------------

createScene();
animate();

//------------------------------------------------------------------------------------------------
//------------------------------------------- FUNCTIONS ------------------------------------------
//------------------------------------------------------------------------------------------------

function move()
{
	if(moveCamera) {
		// Get Camera Rotation
		let quaternion = new THREE.Quaternion();
		quaternion = camera.quaternion;

		// Get direction to translate from quaternion
		var moveTo = new THREE.Vector3(0, 0, -0.1);
		moveTo.applyQuaternion(quaternion);

		// Move the camera Holder to the computed direction
		cameraHolder.translateX(moveTo.x);
		cameraHolder.translateY(moveTo.y);
		cameraHolder.translateZ(moveTo.z);
	}
}

function onSelectStart() 
{
	moveCamera = true;
}

function onSelectEnd() 
{
	moveCamera = false;
}

//-- Main loop -----------------------------------------------------------------------------------

function animate() 
{
	renderer.setAnimationLoop(render);
}

function render() 
{
	// Controls if VR Mode is ON
	if(renderer.xr.isPresenting)
		move();
   	else
      flyCamera.update(clock.getDelta());  
	
	renderer.render( scene, camera );
}

//------------------------------------------------------------------------------------------------
//--------------------------------- SCENE AND AUXILIARY FUNCTIONS --------------------------------
//------------------------------------------------------------------------------------------------

//-- Create Scene --------------------------------------------------------------------------------

function createScene()
{
	// Light stuff 
	const light = new THREE.PointLight(0xaaaaaa);
		light.position.set(0, 30, 0);
		light.castShadow = true;
		light.distance = 0;
		light.decay = 2;
		light.shadow.mapSize.width = 2048;
		light.shadow.mapSize.height = 2048;
	
	scene.add(light);

	var ambientLight = new THREE.AmbientLight(0x121212);
	
	scene.add(ambientLight);

	// Load textures 
	var textureLoader = new THREE.TextureLoader();
}