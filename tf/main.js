//-- Imports -------------------------------------------------------------------------------------

import * as THREE from "three";
import GUI from "../libs/util/dat.gui.module.js";
import {ARjs} from  "../libs/AR/ar.js";
import {createLightSphere} from "../libs/util/util.js";

//------------------------------------------------------------------------------------------------
//------------------------------------------ MAIN SCRIPT -----------------------------------------
//------------------------------------------------------------------------------------------------

//-- Setting scene and camera --------------------------------------------------------------------

var scene = new THREE.Scene();

let ambientLight = new THREE.AmbientLight("rgb(50, 50, 50)");
scene.add(ambientLight);

var camera = new THREE.Camera();
scene.add(camera);

//-- Renderer settings ---------------------------------------------------------------------------

var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.setClearColor(new THREE.Color("lightgrey"), 0)
	renderer.setSize(1280, 960); // Change here to render in low resolution (for example 640 x 480)
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.domElement.style.position = "absolute";
	renderer.domElement.style.top = "0px";
	renderer.domElement.style.left = "0px";
	document.body.appendChild(renderer.domElement);

var clock = new THREE.Clock();
var deltaTime = 0;
var totalTime = 0;

//------------------------------------------------------------------------------------------------
//--------------------------------------------- AR.js --------------------------------------------
//------------------------------------------------------------------------------------------------

//-- Handle arToolkitSource ----------------------------------------------------------------------

var arToolkitSource = new ARjs.Source({
	sourceType: "webcam",
});

function onResize() {
	arToolkitSource.onResizeElement();
	arToolkitSource.copyElementSizeTo(renderer.domElement);

	if(arToolkitContext.arController !== null) {
		arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas);
	}
}

arToolkitSource.init(function onReady() {
	setTimeout(() => {
		onResize()
	}, 2000);
});

//-- Handle resize -----------------------------------------------------------------------------------

window.addEventListener("resize", function() {
	onResize()
});

//-- Initialize and create arToolkitContext ----------------------------------------------------------

var arToolkitContext = new ARjs.Context({
	cameraParametersUrl: "../libs/AR/data/camera_para.dat",
	detectionMode: "mono",
});

// Initialize it
arToolkitContext.init(function onCompleted() {
	// Copy projection matrix to camera
	camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
});

//-- Setup markerRoots -------------------------------------------------------------------------------

let markerRoot = new THREE.Group();
scene.add(markerRoot);

let markerControlsObj = new ARjs.MarkerControls(arToolkitContext, markerRoot, {	
	type: "pattern",
	patternUrl: "../libs/AR/data/patt.hiro",
});

//------------------------------------------------------------------------------------------------
//------------------------------------------ Interface -------------------------------------------
//------------------------------------------------------------------------------------------------

//-- Send button function ------------------------------------------------------------------------

function getWebSocketServer() {
	if (window.location.host === "rezendegabriel.github.io")
		return "wss://websockets-rv.herokuapp.com/";
	else if (window.location.host === "127.0.0.1:5500")
	  return "ws://127.0.0.1:8080/";
	else
	  throw new Error(`Unsupported host: ${window.location.host}`);
  }

function sendImg() {
	const ws = new WebSocket(getWebSocketServer());
		console.log(ws);

	ws.onmessage = function(message) {
		strPosLight = message.data;
		console.log("[Msg received from the web server] ", strPosLight);

		var paramsText2 = {showStrPosLight: strPosLight};
		text2 = text1Folder.add(paramsText2, "showStrPosLight").name("");

		spotLight();
		setupScene();
	};

	try {
		ws.onopen = () => ws.send(imgDataURL); // Communication established with the web server
			console.log("[Connected from the web server]");
			console.log("[Msg sent to the web server] ", imgDataURL);
	} catch (error) {
		console.log("[Not Connected to the web server] ", error);
	}
}

//-- Capture button function ---------------------------------------------------------------------

function captureFrame() {
	if(button1Event)
		gui.removeFolder(text1Folder);

	text1Folder = gui.addFolder("Image Data URL " + img_i);
	img_i += 1;

	imgDataURL = arToolkitContext.arController.canvas.toDataURL("image/jpeg");
	
	var paramsText1 = {showImgDataURL: imgDataURL};
	text1 = text1Folder.add(paramsText1, "showImgDataURL").name("");

	var paramsButton2 = {onClick: sendImg};
	button2 = text1Folder.add(paramsButton2, "onClick").name("Send Image");

	button1Event = true;
}

var imgDataURL = null;
var img_i = 1;

var text1Folder = null;
var text1 = null;
var text2 = null;
var button2 = null;

var button1Event = false;

var paramsButton1 = {onClick: captureFrame}

var strPosLight = null

//-- GUI interface -------------------------------------------------------------------------------

var gui = new GUI();
let button1 = gui.add(paramsButton1, "onClick").name("Capture frame");

//------------------------------------------------------------------------------------------------
//------------------------------------------- Render ---------------------------------------------
//------------------------------------------------------------------------------------------------

//-- Spotlight -----------------------------------------------------------------------------------

function spotLight() {
	let vector3 = strPosLight.split(" ");

	let spotLightColor = "rgb(255, 255, 255)";
	let spotLightPosition = new THREE.Vector3(parseFloat(vector3[0]),
											  parseFloat(vector3[1]),
											  parseFloat(vector3[2]));
	let spotLight = new THREE.SpotLight(spotLightColor);
	let spotLightSphere = createLightSphere(markerRoot, 0.05, 10, 10, spotLightPosition);
		spotLight.position.copy(spotLightPosition);
		spotLight.angle = degreesToRadians(40);
		spotLight.intensity = 1.0;    
		spotLight.decay = 2.0; // The amount the light dims along the distance of the light.
		spotLight.penumbra = 0.5; // Percent of the spotlight cone that is attenuated due to penumbra. 

		// Shadow settings
		spotLight.castShadow = true;
		spotLight.shadow.mapSize.width = 512;
		spotLight.shadow.mapSize.height = 512;

	markerRoot.add(spotLight);

	let spotLightTarget = createLightSphere(markerRoot, 0.025, 10, 10, spotLight.target.position);
	spotLight.target = spotLightTarget;

	markerRoot.add(spotLightTarget);
}

//-- Setup scene ---------------------------------------------------------------------------------

function setupScene() {
	// Floor
	let floorGeometry = new THREE.PlaneGeometry(20, 20);
	let floorMaterial = new THREE.ShadowMaterial();
		floorMaterial.opacity = 0.3;
	let floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
		floorMesh.rotation.x = -Math.PI/2;
		floorMesh.receiveShadow = true;

	markerRoot.add(floorMesh);

	// Basketball
	let ballGeometry = new THREE.SphereGeometry(5, 32, 32);
	let ballTexture = new THREE.MeshLambertMaterial({
		map: new THREE.TextureLoader().load("../assets/textures/basketball-gray.png"),
		color: 0x964B00
	});
	let ballMesh = new THREE.Mesh(ballGeometry, ballTexture);
		ballMesh.receiveShadow = true;
		ballMesh.castShadow = true;

	markerRoot.add(ballMesh);
}

// Update artoolkit on every frame
function update()
{
	if(arToolkitSource.ready !== false) arToolkitContext.update(arToolkitSource.domElement);
}

// Render the scene
function render()
{
	renderer.render(scene, camera);
}

animate();

function animate()
{
	requestAnimationFrame(animate);
	deltaTime = clock.getDelta();
	totalTime+=deltaTime;
	update();
	render();
}