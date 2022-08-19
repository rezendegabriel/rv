//-- Imports -------------------------------------------------------------------------------------

import * as THREE from "three";
import GUI from "../libs/util/dat.gui.module.js";
import {ARjs} from  "../libs/AR/ar.js";

//------------------------------------------------------------------------------------------------
//------------------------------------------ MAIN SCRIPT -----------------------------------------
//------------------------------------------------------------------------------------------------

//-- Setting scene and camera --------------------------------------------------------------------

var scene = new THREE.Scene();

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
		return "wss://rezendegabriel.github.io/rva/:8080";
	else if (window.location.host === "127.0.0.1:5500")
		return "ws://localhost:8080/";
	else
		throw new Error(`Unsupported host: ${window.location.host}`);
}

function sendImg() {
	const ws = new WebSocket(getWebSocketServer());
		console.log(ws);

	var message = imgDataURL;
	
	ws.onmessage = function(event) {
		console.log("[Msg received from server]", event.data)
	};

	try {
		ws.onopen = () => ws.send(message);
			console.log("[Msg sent]", message);
	} catch (error) {
		console.log("[Msg not sent]", error);
	}	
}

//-- Capture button function ---------------------------------------------------------------------

function captureFrame() {
	if(button1Event)
		gui.removeFolder(text1Folder);

	text1Folder = gui.addFolder("Image Data URL " + img_i);
	img_i += 1;

	imgDataURL = arToolkitContext.arController.canvas.toDataURL("image/jpeg");
		//console.image(imgDataURL);
	
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
var button2 = null;

var button1Event = false;

var paramsButton1 = {onClick: captureFrame}

//-- GUI interface -------------------------------------------------------------------------------

var gui = new GUI();
let button1 = gui.add(paramsButton1, "onClick").name("Capture frame");

//------------------------------------------------------------------------------------------------
//------------------------------------------- Render ---------------------------------------------
//------------------------------------------------------------------------------------------------

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