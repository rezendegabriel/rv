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

function receivedLightPos() {
	const ws = new WebSocket(getWebSocketServer());
		console.log(ws);

	// Establishing connection
	var connection = false;
	try {
		const event_connection = {
			type: "connection",
			sender: "interface"
		}

		ws.onopen = () => ws.send(JSON.stringify(event_connection));
			console.log("[Connecting to the Server...]");
	} catch(error) {
		console.log("[Error: connection to the Server fail]");
	}

	ws.onmessage = function(data) {
		const event_connection = JSON.parse(data);

		if(event_connection.type == "connection") {
			connection = true;
			console.log("[Connected]");
		}
		else {
			console.log("[Connection not allowed]");
		}
	}
	
	if(connection) {
		ws.onmessage = function(data) {
			const event_recv = JSON.parse(data);

			if(event_recv.type == "send") {
				lightPos = event_recv.message
					console.log("[Message received by the Server] ", lightPos);
					console.log("[Disconnected]");
				
				text1Folder.remove(button3);

				var paramsText2 = {showLightPos: lightPos};
				text2 = text1Folder.add(paramsText2, "showLightPos").name("");

				spotLight();
				setupScene();
			}
			else {
				console.log("[Unrecognized type]");
				console.log("[Disconnected]");
			}
		}
	}
}

function sendImg() {
	const ws = new WebSocket(getWebSocketServer());
		console.log(ws);

	// Establishing connection
	var connection = false;
	try {
		const event_connection = {
			type: "connection",
			sender: "interface"
		}

		ws.onopen = () => ws.send(JSON.stringify(event_connection));
			console.log("[Connecting to the Server...]");
	} catch(error) {
		console.log("[Error: connection to the Server fail]");
	}

	ws.onmessage = function(data) {
		const event_connection = JSON.parse(data);

		if(event_connection.type == "connection") {
			connection = true;
			console.log("[Connected]");
		}
		else {
			console.log("[Connection not allowed]");
		}
	}

	// Sending image URL
	if(connection) {
		var send = false;
		try {
			const event_send = {
				type: "send",
				message: imgURL
			}

			ws.onopen = () => ws.send(JSON.stringify(event_send));
				console.log("[Message sent to the Server] ", imgURL);
				console.log("[Disconnected]");
			
			send = true;
		} catch(error) {
			console.log("[Error: message not sent to the Server]");
			console.log("[Disconnected]");
		}
	}

	// Receiving light position
	if(send) {
		text1Folder.remove(button2);

		var paramsButton3 = {onClick: receivedLightPos};
		button3 = text1Folder.add(paramsButton3, "onClick").name("Receive light pos.");
	}
}

//-- Capture button function ---------------------------------------------------------------------

function captureFrame() {
	if(button1Event)
		gui.removeFolder(text1Folder);

	text1Folder = gui.addFolder("Image Data URL " + img_i);
	img_i += 1;

	imgURL = arToolkitContext.arController.canvas.toDataURL("image/jpeg");
	
	var paramsText1 = {showImgURL: imgURL};
	text1 = text1Folder.add(paramsText1, "showImgURL").name("");

	var paramsButton2 = {onClick: sendImg};
	button2 = text1Folder.add(paramsButton2, "onClick").name("Send Image");

	button1Event = true;
}

var imgURL = null;
var img_i = 1;

var lightPos = null

var text1Folder = null;
var text1 = null;
var text2 = null;
var button2 = null;
var button3 = null;

var button1Event = false;

var paramsButton1 = {onClick: captureFrame}

//-- GUI interface -------------------------------------------------------------------------------

var gui = new GUI();
let button1 = gui.add(paramsButton1, "onClick").name("Capture frame");

//------------------------------------------------------------------------------------------------
//------------------------------------------- Render ---------------------------------------------
//------------------------------------------------------------------------------------------------

//-- Spotlight -----------------------------------------------------------------------------------

function spotLight() {
	let vector3 = lightPos.split(" ");

	let spotLightColor = "rgb(255, 255, 255)";
	let spotLightPosition = new THREE.Vector3(parseFloat(vector3[0]),
											  parseFloat(vector3[1]),
											  parseFloat(vector3[2]));
	let spotLight = new THREE.SpotLight(spotLightColor);
	let spotLightSphere = createLightSphere(markerRoot, 0.05, 10, 10, spotLightPosition);
		spotLight.position.copy(spotLightPosition);
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
	let ballGeometry = new THREE.SphereGeometry(0.4, 32, 32);
	let ballTexture = new THREE.MeshLambertMaterial({
		map: new THREE.TextureLoader().load("../assets/textures/basketball-gray.png"),
		color: 0x964B00
	});
	let ballMesh = new THREE.Mesh(ballGeometry, ballTexture);
		ballMesh.position.y = 0.2;
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