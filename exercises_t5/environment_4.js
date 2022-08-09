//-- Imports -------------------------------------------------------------------------------------

import * as THREE from  "three";
import {VRButton} from "../build/jsm/webxr/VRButton.js";
import {createGroundPlane,
		degreesToRadians,
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
	renderer.setClearColor(new THREE.Color("rgb(70, 150, 240)"));
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.xr.enabled = true;
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;

//-- Setting scene and camera -------------------------------------------------------------------

let scene = new THREE.Scene();
let clock = new THREE.Clock();

let camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.1, 1000);
let moveCamera; // Move when a button is pressed 

// To be used outside a VR environment (Desktop, for example)
let flyCamera = setFlyNonVRBehavior(camera, renderer, "On desktop, use mouse and WASD-QE to navigate.");

// 'Camera Holder' to help moving the camera
let cameraHolder = new THREE.Object3D();
	cameraHolder.position.set(0.0, -4.0, 0.0);
	cameraHolder.add(camera);

scene.add(cameraHolder);

//-- Creating the cube map -----------------------------------------------------------------------

const path = "../assets/textures/cube/Meadow/";
const format = ".jpg";
const urls = [
	path + "posx" + format, path + "negx" + format,
	path + "posy" + format, path + "negy" + format,
	path + "posz" + format, path + "negz" + format
];

// Setting the two cube maps, one for refraction and one for reflection
let cubeMapTexture = new THREE.CubeTextureLoader().load(urls);

// Create the main scene and Set its background as a cubemap (using a CubeTexture)
scene.background = cubeMapTexture;

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
		light.position.set(0, 100, 0);
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
	var groundPlaneTexture = textureLoader.load("../assets/textures/grass.jpg");
	var trunkTexture = textureLoader.load("../assets/textures/wood.png");

	// Create Ground Plane
	var groundPlane = createGroundPlane(500, 500, 50, 50, "rgb(200, 200, 150)");
		groundPlane.rotateX(degreesToRadians(-90));
		groundPlane.translateZ(-5);
		groundPlane.material.map = groundPlaneTexture;
		groundPlane.material.map.wrapS = THREE.RepeatWrapping;
		groundPlane.material.map.wrapT = THREE.RepeatWrapping;
		groundPlane.material.map.repeat.set(50, 50);
	
	scene.add(groundPlane);

	// Create trees
	for(let i = 0; i < 50; i++) {
		createTree(trunkTexture);
	}		
}

function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
  }

function createTree(trunkTexture)
{
	var trunkHeight = getRandomArbitrary(2, 4);
	var trunkHeightRadiusRate = getRandomArbitrary(10, 20);
	var trunkGeometry =  new THREE.CylinderGeometry(trunkHeight/trunkHeightRadiusRate,
												    trunkHeight/trunkHeightRadiusRate,
													trunkHeight,
													64);
	var trunkMaterial = new THREE.MeshLambertMaterial();
	var trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
		trunk.position.set(getRandomArbitrary(-250, 250), -5+trunkHeight/2, getRandomArbitrary(-250, 250));
		trunk.material.map = trunkTexture;
		trunk.castShadow = true;
		trunk.receiveShadow = true;
	
	scene.add(trunk);

	var leafageTrunkRadiusRate = getRandomArbitrary(5, 10);
	var leafageTrunkHeightRate = getRandomArbitrary(2.5, 5);
	
	for(let i = 1; i < 2; i+=0.25) {
		var leafageGeometry = new THREE.ConeGeometry(leafageTrunkRadiusRate*(trunkHeight/trunkHeightRadiusRate)*((i+1.25)/i),
													 trunkHeight*leafageTrunkHeightRate/i,
													 64);
		var leafageMaterial = new THREE.MeshLambertMaterial({color: 0x3A6332});
		var leafage = new THREE.Mesh(leafageGeometry, leafageMaterial);
			leafage.castShadow = true;
			leafage.receiveShadow = true;

		trunk.add(leafage);

		leafage.translateY(((trunkHeight*leafageTrunkHeightRate*i)+trunkHeight)/2);
	}
}