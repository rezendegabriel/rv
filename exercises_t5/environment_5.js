//-- Imports -------------------------------------------------------------------------------------

import * as THREE from  "three";
import {VRButton} from "../build/jsm/webxr/VRButton.js";
import {degreesToRadians,
		onWindowResize} from "../libs/util/util.js";
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
	//eeecameraHolder.position.set(-30, 72.5, 125);
	cameraHolder.position.set(0, 17, 0);
	cameraHolder.add(camera);

scene.add(cameraHolder);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(120);
scene.add(axesHelper);

//------------------------------------------------------------------------------------------------
//---------------------------------------- CREATING ROOMS ----------------------------------------
//------------------------------------------------------------------------------------------------

const roomGeometry = [
	new THREE.PlaneGeometry(60, 30), // Front
	new THREE.PlaneGeometry(60, 30), // Left
	new THREE.PlaneGeometry(60, 60), // Floor
	new THREE.PlaneGeometry(60, 60), // Roof
	new THREE.PlaneGeometry(60, 30), // Back
	new THREE.PlaneGeometry(60, 30), // Right
	new THREE.PlaneGeometry(20, 30), // Right and Left A
	new THREE.PlaneGeometry(20, 5), // Right and Left B
];

//-- Room A --------------------------------------------------------------------------------------

const roomAMaterials = [
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.BackSide}), // Front
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.BackSide}), // Left
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/darkcement.jpg"), side: THREE.BackSide}), // Floor
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/darkcement.jpg"), side: THREE.BackSide}), // Roof
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.BackSide}), // Back
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.BackSide}), // Right
];

const floorRoomA = new THREE.Mesh(roomGeometry[2], roomAMaterials[2]);
	floorRoomA.rotateX(degreesToRadians(90));
	floorRoomA.material.map.wrapS = THREE.RepeatWrapping;
	floorRoomA.material.map.wrapT = THREE.RepeatWrapping; 
	floorRoomA.material.map.repeat.set(2, 1);

scene.add(floorRoomA);

const roofRoomA = new THREE.Mesh(roomGeometry[3], roomAMaterials[3]);
	roofRoomA.position.set(0, 30, 0);
	roofRoomA.rotateX(degreesToRadians(-90));
	roofRoomA.material.map.wrapS = THREE.RepeatWrapping;
	roofRoomA.material.map.wrapT = THREE.RepeatWrapping; 
	roofRoomA.material.map.repeat.set(2, 1);

scene.add(roofRoomA);

const frontRoomA = new THREE.Mesh(roomGeometry[0], roomAMaterials[0]);
	frontRoomA.position.set(0, 15, -30);
	frontRoomA.rotateY(degreesToRadians(180));
	frontRoomA.material.map.wrapS = THREE.RepeatWrapping;
	frontRoomA.material.map.wrapT = THREE.RepeatWrapping; 
	frontRoomA.material.map.repeat.set(2, 1);

scene.add(frontRoomA);

const leftRoomA = new THREE.Mesh(roomGeometry[1], roomAMaterials[1]);
	leftRoomA.position.set(-30, 15, 0);
	leftRoomA.rotateY(degreesToRadians(-90));
	leftRoomA.material.map.wrapS = THREE.RepeatWrapping;
	leftRoomA.material.map.wrapT = THREE.RepeatWrapping; 
	leftRoomA.material.map.repeat.set(2, 1);

scene.add(leftRoomA);

const backRoomA = new THREE.Mesh(roomGeometry[4], roomAMaterials[4]);
	backRoomA.position.set(0, 15, 30);
	backRoomA.material.map.wrapS = THREE.RepeatWrapping;
	backRoomA.material.map.wrapT = THREE.RepeatWrapping; 
	backRoomA.material.map.repeat.set(2, 1);

scene.add(backRoomA);

const rightA1RoomA = new THREE.Mesh(roomGeometry[6], roomAMaterials[5]);
	rightA1RoomA.position.set(30, 15, -20);
	rightA1RoomA.rotateY(degreesToRadians(90));
	rightA1RoomA.material.map.wrapS = THREE.RepeatWrapping;
	rightA1RoomA.material.map.wrapT = THREE.RepeatWrapping; 
	rightA1RoomA.material.map.repeat.set(1, 1);

scene.add(rightA1RoomA);

const rightA2RoomA = new THREE.Mesh(roomGeometry[6], roomAMaterials[5]);
	rightA2RoomA.position.set(30, 15, 20);
	rightA2RoomA.rotateY(degreesToRadians(90));
	rightA2RoomA.material.map.wrapS = THREE.RepeatWrapping;
	rightA2RoomA.material.map.wrapT = THREE.RepeatWrapping; 
	rightA2RoomA.material.map.repeat.set(1, 1);

scene.add(rightA2RoomA);

const rightBRoomA = new THREE.Mesh(roomGeometry[7], roomAMaterials[5]);
	rightBRoomA.position.set(30, 27.5, 0);
	rightBRoomA.rotateY(degreesToRadians(90));
	rightBRoomA.material.map.wrapS = THREE.RepeatWrapping;
	rightBRoomA.material.map.wrapT = THREE.RepeatWrapping; 
	rightBRoomA.material.map.repeat.set(4, 1);

scene.add(rightBRoomA);

//-- Room B --------------------------------------------------------------------------------------

const roomBMaterials = [
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.BackSide}), // Front
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.BackSide}), // Left
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/darkcement.jpg"), side: THREE.BackSide}), // Floor
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/darkcement.jpg"), side: THREE.BackSide}), // Roof
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.BackSide}), // Back
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.BackSide}), // Right
];

const floorRoomB = new THREE.Mesh(roomGeometry[2], roomBMaterials[2]);
	floorRoomB.position.set(60+1.5, 0, 0);
	floorRoomB.rotateX(degreesToRadians(90));
	floorRoomB.material.map.wrapS = THREE.RepeatWrapping;
	floorRoomB.material.map.wrapT = THREE.RepeatWrapping; 
	floorRoomB.material.map.repeat.set(2, 1);

scene.add(floorRoomB);

const roofRoomB = new THREE.Mesh(roomGeometry[3], roomBMaterials[3]);
	roofRoomB.position.set(60+1.5, 30, 0);
	roofRoomB.rotateX(degreesToRadians(-90));
	roofRoomB.material.map.wrapS = THREE.RepeatWrapping;
	roofRoomB.material.map.wrapT = THREE.RepeatWrapping; 
	roofRoomB.material.map.repeat.set(2, 1);

scene.add(roofRoomB);

const frontRoomB = new THREE.Mesh(roomGeometry[0], roomBMaterials[0]);
	frontRoomB.position.set(60+1.5, 15, -30);
	frontRoomB.rotateY(degreesToRadians(180));
	frontRoomB.material.map.wrapS = THREE.RepeatWrapping;
	frontRoomB.material.map.wrapT = THREE.RepeatWrapping; 
	frontRoomB.material.map.repeat.set(2, 1);

scene.add(frontRoomB);

const backRoomB = new THREE.Mesh(roomGeometry[4], roomBMaterials[4]);
	backRoomB.position.set(60+1.5, 15, 30);
	backRoomB.material.map.wrapS = THREE.RepeatWrapping;
	backRoomB.material.map.wrapT = THREE.RepeatWrapping; 
	backRoomB.material.map.repeat.set(2, 1);

scene.add(backRoomB);

const rightRoomB = new THREE.Mesh(roomGeometry[5], roomBMaterials[5]);
	rightRoomB.position.set(30+60+1.5, 15, 0);
	rightRoomB.rotateY(degreesToRadians(90));
	rightRoomB.material.map.wrapS = THREE.RepeatWrapping;
	rightRoomB.material.map.wrapT = THREE.RepeatWrapping; 
	rightRoomB.material.map.repeat.set(2, 1);

scene.add(rightRoomB);

const leftA1RoomB = new THREE.Mesh(roomGeometry[6], roomAMaterials[5]);
	leftA1RoomB.position.set(30+1.5, 15, -20);
	leftA1RoomB.rotateY(degreesToRadians(-90));
	leftA1RoomB.material.map.wrapS = THREE.RepeatWrapping;
	leftA1RoomB.material.map.wrapT = THREE.RepeatWrapping; 
	leftA1RoomB.material.map.repeat.set(1, 1);

scene.add(leftA1RoomB);

const leftA2RoomB = new THREE.Mesh(roomGeometry[6], roomAMaterials[5]);
	leftA2RoomB.position.set(30+1.5, 15, 20);
	leftA2RoomB.rotateY(degreesToRadians(-90));
	leftA2RoomB.material.map.wrapS = THREE.RepeatWrapping;
	leftA2RoomB.material.map.wrapT = THREE.RepeatWrapping; 
	leftA2RoomB.material.map.repeat.set(1, 1);

scene.add(leftA2RoomB);

const leftBRoomB = new THREE.Mesh(roomGeometry[7], roomAMaterials[5]);
	leftBRoomB.position.set(30+1.5, 27.5, 0);
	leftBRoomB.rotateY(degreesToRadians(-90));
	leftBRoomB.material.map.wrapS = THREE.RepeatWrapping;
	leftBRoomB.material.map.wrapT = THREE.RepeatWrapping; 
	leftBRoomB.material.map.repeat.set(4, 1);

scene.add(leftBRoomB);

//-- Door --------------------------------------------------------------------------------------

const doorGeometry = [
	new THREE.PlaneGeometry(1.5, 25), // Front
	new THREE.PlaneGeometry(1.5, 20), // Floor
	new THREE.PlaneGeometry(1.5, 20), // Roof
	new THREE.PlaneGeometry(1.5, 25), // Back
];

const doorMaterials = [
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.DoubleSide}), // Front
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/darkcement.jpg"), side: THREE.DoubleSide}), // Floor
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/darkcement.jpg"), side: THREE.DoubleSide}), // Roof
	new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("../assets/textures/cement.jpg"), side: THREE.DoubleSide}), // Back
];

const floorDoor = new THREE.Mesh(doorGeometry[1], doorMaterials[1]);
	floorDoor.position.set(30+0.75, 0, 0);
	floorDoor.rotateX(degreesToRadians(90));
	floorDoor.material.map.wrapS = THREE.RepeatWrapping;
	floorDoor.material.map.wrapT = THREE.RepeatWrapping; 
	floorDoor.material.map.repeat.set(2, 1);

scene.add(floorDoor);

const roofDoor = new THREE.Mesh(doorGeometry[2], doorMaterials[2]);
	roofDoor.position.set(30+0.75, 25, 0);
	roofDoor.rotateX(degreesToRadians(-90));
	roofDoor.material.map.wrapS = THREE.RepeatWrapping;
	roofDoor.material.map.wrapT = THREE.RepeatWrapping; 
	roofDoor.material.map.repeat.set(2, 1);

scene.add(roofDoor);

const frontDoor = new THREE.Mesh(doorGeometry[0], doorMaterials[0]);
	frontDoor.position.set(30+0.75, 12.5, -10);
	frontDoor.rotateY(degreesToRadians(180));
	frontDoor.material.map.wrapS = THREE.RepeatWrapping;
	frontDoor.material.map.wrapT = THREE.RepeatWrapping; 
	frontDoor.material.map.repeat.set(2, 1);

scene.add(frontDoor);

const backDoor = new THREE.Mesh(doorGeometry[3], doorMaterials[3]);
	backDoor.position.set(30+0.75, 12.5, 10);
	backDoor.material.map.wrapS = THREE.RepeatWrapping;
	backDoor.material.map.wrapT = THREE.RepeatWrapping; 
	backDoor.material.map.repeat.set(2, 1);

scene.add(backDoor);

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