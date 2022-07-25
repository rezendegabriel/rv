import * as THREE from "three";
import GUI from "../libs/util/dat.gui.module.js";
import {ARjs} from  "../libs/AR/ar.js";
import {GLTFLoader} from "../build/jsm/loaders/GLTFLoader.js";
import {InfoBox,
		SecondaryBox,
		getMaxSize,
		degreesToRadians} from "../libs/util/util.js";

// Init scene
var scene = new THREE.Scene();

// Init ambient light
let ambientLight = new THREE.AmbientLight("rgb(50, 50, 50)");
scene.add(ambientLight);

// Init camera
var camera = new THREE.Camera();
scene.add(camera);

let pointLight = new THREE.PointLight(0xffffff, 1, 50);
camera.add(pointLight);

// Init render
var renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
	renderer.setClearColor(new THREE.Color("lightgrey"), 0)
	renderer.setSize(640, 480); // Change here to render in low resolution (for example 640 x 480)
	renderer.domElement.style.position = "absolute";
	renderer.domElement.style.top = "0px";
	renderer.domElement.style.left = "0px";
	document.body.appendChild(renderer.domElement);

var clock = new THREE.Clock();
var deltaTime = 0;
var totalTime = 0;

// Show text information onscreen
showInformation();
var infoBox = new SecondaryBox("");

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

let letters = ["a", "b", "c", "d", "g", "f"];

var markerLetters = new Array();

for(let i = 0; i < 6; i++) {
	let markerLetter = new THREE.Group();
	markerLetters.push(markerLetter);
	scene.add(markerLetter);
	let markerControlsObj = new ARjs.MarkerControls(arToolkitContext, markerLetter, {	
		type: "pattern",
		patternUrl: "../libs/AR/data/multi-abcdef/patt." + letters[i],
	});
}

//---------------------------------------------------------
// Setup scene

// Load external objects

var objectArray = new Array()
var activeObject = 0;

// Animation parameters
var walkingMan = null;
var playAction = true;
var time = 0;
var mixer = new Array();

loadGLBFileAnimation("../assets/objects/", "dog", true, 2.5, true);
loadGLBFileAnimation("../assets/objects/", "windmill", false, 2.5, true);
loadGLBFileAnimation("../assets/objects/", "walkingMan", false, 2.5, false);
loadGLBFile("../assets/objects/", "toucan", false, 2.5);
loadGLBFile("../assets/objects/", "toon_tank", false, 2.5);
loadGLBFile("../assets/objects/", "woodenGoose", false, 2.5);

function loadGLBFile(modelPath, modelName, visibility, desiredScale) {
	var loader = new GLTFLoader();
  	loader.load(modelPath + modelName + ".glb", function(gltf) {
    	var obj = gltf.scene;
    		obj.name = modelName;
    		obj.visible = visibility;

    		obj.traverse(function(node) {
      			if(node.material) node.material.side = THREE.DoubleSide;
    		});

    	var obj = normalizeAndRescale(obj, desiredScale);
    	var obj = fixPosition(obj);

		objectArray.push(obj);
    }, onProgress, onError);
}

function loadGLBFileAnimation(modelPath, modelName, visibility, desiredScale, centerObject) {
	var loader = new GLTFLoader();
  	loader.load(modelPath + modelName + ".glb", function(gltf) {
    	var obj = gltf.scene;
    		obj.name = modelName;
    		obj.visible = visibility;

    		obj.traverse(function(node) {
      			if(node.material) node.material.side = THREE.DoubleSide;
    		});

    	// Only fix the position of the centered object
		// The man around will have a different geometric transformation
		if(centerObject) {
			obj = normalizeAndRescale(obj, desiredScale);
			obj = fixPosition(obj);
		}
		else
			walkingMan = obj;

		objectArray.push(obj);

		// Pick the index of the first visible object
		if(modelName == "dog")
			activeObject = objectArray.length-1;

		// Create animationMixer and push it in the array of mixers
		var mixerLocal = new THREE.AnimationMixer(obj);
		mixerLocal.clipAction(gltf.animations[0]).play();
		mixer.push(mixerLocal);
    }, onProgress, onError);
}

function onError() { };

function onProgress(xhr, model)
{
    if (xhr.lengthComputable) {
    	var percentComplete = xhr.loaded/xhr.total*100;
      	infoBox.changeMessage("Loading... " + Math.round(percentComplete, 2) + "% processed");
    }
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

// Function to rotate the man around the center object
//function rotateWalkingMan(delta)
//{
	//if(walkingMan) {
	//	time+=delta*25;

    //	var mat4 = new THREE.Matrix4();
    //	walkingMan.matrixAutoUpdate = false;
    //	walkingMan.matrix.identity(); // Reset matrix
    //	walkingMan.matrix.multiply(mat4.makeRotationY(degreesToRadians(-time)));
    //	walkingMan.matrix.multiply(mat4.makeTranslation(1.0, 0.0, 0.0));
	//	walkingMan.rotationY()
  	//}
//}

//---------------------------------------------------------
// Interface

var controls = new function() {
	this.type = "";

	this.onPlayAnimation = function(){
		playAction = !playAction;
	};

	this.onChooseObject = function() {
		objectArray[activeObject].visible = false;

		// Get number of the object by parsing the string
		activeObject = this.type[6];
		objectArray[activeObject].visible = true;
		infoBox.changeMessage(objectArray[activeObject].name);
	};
	
};

// GUI interface
var gui = new GUI();
gui.add(controls, "onPlayAnimation").name("Play/Stop Animation");
gui.add(controls, "type",
	["Object0", "Object1", "Object2", "Object3", "Object4", "Object5"])
	//["Object0", "Object1", "Object2", "Object3", "Object4"])
	.name("Change Object")
	.onChange(function(e) {controls.onChooseObject();});

// Use this to show information onscreen
function showInformation()
{
	controls = new InfoBox();
		controls.add("Put the 'ABCDGF' letters in front of the camera.");
		controls.show();
}

//----------------------------------------------------------------------------
// Render the whole thing on the page

var changeScale = false;

// Update artoolkit on every frame
function update()
{
	if(arToolkitSource.ready !== false) arToolkitContext.update(arToolkitSource.domElement);

	let currentObj = objectArray[activeObject];
	currentObj.visible = true; // Only current object visible

	for(let i = 0; i < 6; i++) {
		let object = objectArray[i];

		if(i != activeObject)
			object.visible = false;

		markerLetters[i].clear();
	}

	for(let i = 0; i < 6; i++) {
		if(markerLetters[i].visible) {
			markerLetters[i].add(currentObj);

			// Centralize object
			let relativePosition = markerLetters[i].worldToLocal(markerLetters[4].position.clone());
			currentObj.position.copy(relativePosition);
			let relativeVector = markerLetters[2].worldToLocal(markerLetters[4].position.clone());
			currentObj.translateZ(-relativeVector.getComponent(2)/2);

			break;
		}
	}
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

	// Animation control
	if(playAction) {
		for(var i = 0; i < mixer.length; i++)
			mixer[i].update(deltaTime);

		//rotateWalkingMan(deltaTime);
	}
}