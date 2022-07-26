import * as THREE from "three";
import {ARjs} from  "../libs/AR/ar.js";
import {InfoBox} from "../libs/util/util.js";

// Init scene
var scene = new THREE.Scene();

// Init camera
var camera = new THREE.Camera();
scene.add(camera);

// Init render
var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.setClearColor(new THREE.Color("lightgrey"), 0);
	renderer.setSize(640, 480); // Change here to render in low resolution (for example 640 x 480)
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.domElement.style.position = "absolute";
	renderer.domElement.style.top = "0px";
	renderer.domElement.style.left = "0px";
	document.body.appendChild(renderer.domElement);

var clock = new THREE.Clock();
var deltaTime = 0;
var totalTime = 0;

// Show text information onscreen
showInformation();

//----------------------------------------------------------------------------
// Handle arToolkitSource

var arToolkitSource = new ARjs.Source({
	sourceType : "webcam",
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

// Handle resize
window.addEventListener("resize", function() {
	onResize()
});

//----------------------------------------------------------------------------
// Initialize and create arToolkitContext

var arToolkitContext = new ARjs.Context({
	cameraParametersUrl: "../libs/AR/data/camera_para.dat",
	detectionMode: "mono",
});

// Initialize it
arToolkitContext.init(function onCompleted() {
	// Copy projection matrix to camera
	camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
});

//----------------------------------------------------------------------------
// Setup markerRoots

var markerHiro = new THREE.Group();
scene.add(markerHiro);
let markerControlHiro = new ARjs.MarkerControls(arToolkitContext, markerHiro, {	
	type: "pattern",
	patternUrl: "../libs/AR/data/patt.hiro",
});

var markerKanji = new THREE.Group();
scene.add(markerKanji);
let markerControlKanji = new ARjs.MarkerControls(arToolkitContext, markerKanji, {	
	type: "pattern",
	patternUrl: "../libs/AR/data/patt.kanji",
});

let sceneGroup = new THREE.Group();
markerHiro.add(sceneGroup);

//---------------------------------------------------------
// Setup scene

// Floor plane
let floorGeometry = new THREE.PlaneGeometry(20, 20);
let floorMaterial = new THREE.ShadowMaterial();
floorMaterial.opacity = 0.3;
let floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
floorMesh.rotation.x = -Math.PI/2;
floorMesh.receiveShadow = true;
//markerHiro.add(floorMesh);
sceneGroup.add(floorMesh);
//scene.add(floorMesh);

// Ball
let ballGeometry = new THREE.SphereGeometry(0.25, 32, 32);
let loaderTexture = new THREE.TextureLoader();
let ballTexture = new THREE.MeshLambertMaterial({
	map: loaderTexture.load("../assets/textures/basketball-gray.png"),
	color: 0xff8800
});
let ballMesh = new THREE.Mesh(ballGeometry, ballTexture);
ballMesh.castShadow = true;
scene.add(ballMesh);
//markerHiro.add(ballMesh);
//sceneGroup.add(ballMesh);

// Init light
let pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(0, 4, 0);
pointLight.castShadow = true;

let ambientLight = new THREE.AmbientLight("rgb(50, 50, 50)");

sceneGroup.add(pointLight);
sceneGroup.add(ambientLight);
//scene.add(pointLight);
//scene.add(ambientLight);
//markerHiro.add(pointLight);
//markerHiro.add(ambientLight);

// Default normal of plane is 0, 0, 1
// Aplly mesh rotation to it
let clipPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0));
renderer.clippingPlanes = [clipPlane];

//---------------------------------------------------------
// Interface

// Use this to show information onscreen
function showInformation()
{
	var controls = new InfoBox();
		controls.add("Put the 'HIRO' and 'KANJI' markers in front of the camera.");
		controls.show();
}

//----------------------------------------------------------------------------
// Render the whole thing on the page

// Update artoolkit on every frame
function update()
{
	if(arToolkitSource.ready !== false) arToolkitContext.update(arToolkitSource.domElement);

	if(markerHiro.visible && markerKanji.visible) {
		// Aling clipping planes to scene
		renderer.clippingPlanes[0].setFromNormalAndCoplanarPoint(
			new THREE.Vector3(0, 1, 0).applyQuaternion(sceneGroup.getWorldQuaternion()),
			sceneGroup.getWorldPosition()
		);
		//renderer.clippingPlanes[0].setFromNormalAndCoplanarPoint(
			//new THREE.Vector3(0, 1, 0).applyQuaternion(markerHiro.getWorldQuaternion()),
			//markerHiro.getWorldPosition()
		//);

		let p = parabolicPath(markerHiro.getWorldPosition(), markerKanji.getWorldPosition(), (totalTime/1) % 4 - 1);
		//let p = linearPath(markerHiro.getWorldPosition(), markerKanji.getWorldPosition(), (totalTime/1) % 4 - 1);

		ballMesh.position.copy(p);
		ballMesh.rotation.z -= 0.05;
	}
}

function parabolaEvaluate(p0, p1, p2, t)
{
	return (0.5*(p0 - 2*p1 + p2))*t*t + (-0.5*(3*p0 - 4*p1 + p2))*t + (p0);
}

function parabolicPath(pointStart, pointEnd, time)
{
	let pointMiddle = new THREE.Vector3().addVectors(pointStart, pointEnd).multiplyScalar(0.5).add(new THREE.Vector3(0, 2, 0));

	return new THREE.Vector3(
		parabolaEvaluate(pointStart.x, pointMiddle.x, pointEnd.x, time),
		parabolaEvaluate(pointStart.y, pointMiddle.y, pointEnd.y, time),
		parabolaEvaluate(pointStart.z, pointMiddle.z, pointEnd.z, time)
	);
}

function linearEvaluate(p0, p1, t)
{
	return (-0.5(3*p0 - 4*p1))*t + (p0);
}

function linearPath(pointStart, pointEnd, time) {
	return new THREE.Vector3(
		linearEvaluate(pointStart.x, pointEnd.x, time),
		linearEvaluate(pointStart.y, pointEnd.y, time),
		linearEvaluate(pointStart.z, pointEnd.z, time)
	);
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