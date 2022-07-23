import * as THREE from "three";
import GUI from "../libs/util/dat.gui.module.js";
import {ARjs} from  "../libs/AR/ar.js";
import {GLTFLoader} from "../build/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "../build/jsm/loaders/OBJLoader.js";
import {PLYLoader} from "../build/jsm/loaders/PLYLoader.js";
import {MTLLoader} from "../build/jsm/loaders/MTLLoader.js";
import {InfoBox,
		SecondaryBox,
		getMaxSize,} from "../libs/util/util.js";

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

let markerHiro = new THREE.Group();
scene.add(markerHiro);
let markerControlsLetters = new ARjs.MarkerControls(arToolkitContext, markerHiro, {	
	type: "pattern",
	patternUrl: "../libs/AR/data/patt.hiro",
});

let markerKanji = new THREE.Group();
scene.add(markerKanji);
let markerControlsCenterLetters = new ARjs.MarkerControls(arToolkitContext, markerKanji, {	
	type: "pattern",
	patternUrl: "../libs/AR/data/patt.kanji",
});

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

loadPLYFile("../assets/objects/", "cow", false, 2.0, markerLetters[0]);
loadOBJFile("../assets/objects/", "dolphins", true, 1.5, markerLetters[1]);
loadOBJFile("../assets/objects/", "f16", false, 2.2, markerLetters[2]);
loadOBJFile("../assets/objects/", "flowers", false, 1.5, markerLetters[3]);
loadOBJFile("../assets/objects/", "soccerball", false, 1.2, markerLetters[4]);
loadGLBFile("../assets/objects/", "toucan", false, 2.0, markerLetters[5]);

function loadPLYFile(modelPath, modelName, visibility, desiredScale, markerLetter)
{
	var loader = new PLYLoader();
  	loader.load(modelPath + modelName + ".ply", function(geometry) {
    	geometry.computeVertexNormals();

    	var material = new THREE.MeshPhongMaterial({color:"rgb(255, 120, 50)"});
    	var obj = new THREE.Mesh(geometry, material);
			obj.name = modelName;
			obj.visible = visibility;

    	var obj = normalizeAndRescale(obj, desiredScale);
    	var obj = fixPosition(obj);

		objectArray.push(obj);
		markerLetter.add(obj);
	}, onProgress, onError);
}

function loadGLBFile(modelPath, modelName, visibility, desiredScale, markerLetter, marker)
{
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
		markerLetter.add(obj);
    }, onProgress, onError);
}

function loadOBJFile(modelPath, modelName, visibility, desiredScale, markerLetter, marker)
{
	var manager = new THREE.LoadingManager();

  	var mtlLoader = new MTLLoader(manager);
	mtlLoader.setPath(modelPath);
	mtlLoader.load(modelName + ".mtl", function(materials) {
		materials.preload();

		var objLoader = new OBJLoader(manager);
		objLoader.setMaterials(materials);
		objLoader.setPath(modelPath);
		objLoader.load(modelName + ".obj", function (obj) {
			obj.name = modelName;
			obj.visible = visibility;
			
			obj.traverse(function(node) {
				if(node.material) node.material.side = THREE.DoubleSide;
			});

			var obj = normalizeAndRescale(obj, desiredScale);
			var obj = fixPosition(obj);

			objectArray.push(obj);
			markerLetter.add(obj);

			// Pick the index of the first visible object
			if(modelName == "dolphins")
				activeObject = objectArray.length-1;
		}, onProgress, onError );
	});
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

//---------------------------------------------------------
// Interface

var controls = new function() {
	this.type = "";

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
gui.add(controls, "type",
	["Object0", "Object1", "Object2", "Object3",
	"Object4", "Object5"])
	.name("Change Object")
	.onChange(function(e) {controls.onChooseObject();});

// Use this to show information onscreen
function showInformation()
{
	controls = new InfoBox();
		controls.add("Put the 'HIRO' or 'KANJI' markers with ABCDGF letters in front of the camera.");
		controls.show();
}

//----------------------------------------------------------------------------
// Render the whole thing on the page

var changeScale = false;

// Update artoolkit on every frame
function update()
{
	if(arToolkitSource.ready !== false) arToolkitContext.update(arToolkitSource.domElement);

	// Each object in a respective marker
	if(markerHiro.visible) {
		for(let i = 0; i < 6; i++) {
			let object = objectArray[i];

			markerLetters[i].add(object); // After Kanji

			object.visible = true; // All objects visible

			// Reposition objects after Kanji
			let relativePosition = markerLetters[i].worldToLocal(markerLetters[i].position.clone());
			object.position.copy(relativePosition);
		}

		changeScale = false;
	}
	else {
		// A centralized object
		if(markerKanji.visible) {
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
					let relativeZ = markerLetters[2].worldToLocal(markerLetters[4].position.clone());
					currentObj.translateZ(-relativeZ.getComponent(2)/2);
					
					break;
				}
			}
		}
		else {
			for(let i = 0; i < 6; i++)
				objectArray[i].visible = false;
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
}