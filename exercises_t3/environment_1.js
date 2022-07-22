import * as THREE from "three";
import GUI from "../libs/util/dat.gui.module.js";
import {ARjs} from  "../libs/AR/ar.js";
import {GLTFLoader} from "../build/jsm/loaders/GLTFLoader.js";
import {OBJLoader} from "../build/jsm/loaders/OBJLoader.js";
import {PLYLoader} from "../build/jsm/loaders/PLYLoader.js";
import {MTLLoader} from "../build/jsm/loaders/MTLLoader.js";
import {InfoBox,
		SecondaryBox,
		getMaxSize,
		createLightSphere,
		degreesToRadians} from "../libs/util/util.js";

// Init scene
var scene = new THREE.Scene();

// Init ambient light
let ambientLight = new THREE.AmbientLight("rgb(50, 50, 50)");
scene.add(ambientLight);

// Init camera
var camera = new THREE.Camera();
scene.add(camera);

// Init render
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

let markerRootObj = new THREE.Group();
scene.add(markerRootObj);

let markerControlsObj = new ARjs.MarkerControls(arToolkitContext, markerRootObj, {	
	type: "pattern",
	patternUrl: "../libs/AR/data/patt.hiro",
});

let markerRootLight = new THREE.Group();
scene.add(markerRootLight);

let markerControlsLight = new ARjs.MarkerControls(arToolkitContext, markerRootLight, {	
	type: "pattern",
	patternUrl: "../libs/AR/data/patt.kanji",
});

//---------------------------------------------------------
// Setup scene

// Floor

let floorGeometry = new THREE.PlaneGeometry(20, 20);
let floorMaterial = new THREE.ShadowMaterial();
floorMaterial.opacity = 0.3;
let floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
floorMesh.rotation.x = -Math.PI/2;
floorMesh.receiveShadow = true;
markerRootObj.add(floorMesh);

// Load external objects

var objectArray = new Array();
var activeObject = 0;

loadPLYFile("../assets/objects/", "cow", false, 2.0);
loadOBJFile("../assets/objects/", "dolphins", true, 1.5);
loadOBJFile("../assets/objects/", "f16", false, 2.2);
loadOBJFile("../assets/objects/", "flowers", false, 1.5);
loadOBJFile("../assets/objects/", "rose", false, 1.5);
loadOBJFile("../assets/objects/", "soccerball", false, 1.2);
loadGLBFile("../assets/objects/", "toucan", false, 2.0);

function loadPLYFile(modelPath, modelName, visibility, desiredScale)
{
	var loader = new PLYLoader();
  	loader.load(modelPath + modelName + ".ply", function(geometry) {
    	geometry.computeVertexNormals();

    	var material = new THREE.MeshPhongMaterial({color:"rgb(255, 120, 50)"});
    	var obj = new THREE.Mesh(geometry, material);
			obj.name = modelName;
			obj.visible = visibility;
			obj.castShadow = true;

    	var obj = normalizeAndRescale(obj, desiredScale);
    	var obj = fixPosition(obj);

    	markerRootObj.add(obj);
    	objectArray.push(obj);
	}, onProgress, onError);
}

function loadGLBFile(modelPath, modelName, visibility, desiredScale)
{
	var loader = new GLTFLoader();
  	loader.load(modelPath + modelName + ".glb", function(gltf) {
    	var obj = gltf.scene;
    		obj.name = modelName;
    		obj.visible = visibility;

    		obj.traverse(function (child) {
      			if(child) {
          			child.castShadow = true;
      			}
    		});
			
    		obj.traverse(function(node) {
      			if(node.material) node.material.side = THREE.DoubleSide;
    		});

    	var obj = normalizeAndRescale(obj, desiredScale);
    	var obj = fixPosition(obj);

    	markerRootObj.add(obj);
    	objectArray.push(obj);
    }, onProgress, onError);
}

function loadOBJFile(modelPath, modelName, visibility, desiredScale)
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
			
			// Set "castShadow" property for each children of the group
			obj.traverse(function(child) {
				child.castShadow = true;
			});

			obj.traverse(function(node) {
				if(node.material) node.material.side = THREE.DoubleSide;
			});

			var obj = normalizeAndRescale(obj, desiredScale);
			var obj = fixPosition(obj);

			markerRootObj.add(obj);
			objectArray.push(obj);

			// Pick the index of the first visible object
			if(modelName == "dolphins") {
				activeObject = objectArray.length-1;
			}
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

// Spotlight

let spotLightColor = "rgb(255, 255, 255)";
let spotLightPosition = new THREE.Vector3(1.25, 2.5, 0.0);
let spotLight = new THREE.SpotLight(spotLightColor);
let spotLightSphere = createLightSphere(markerRootLight, 0.05, 10, 10, spotLightPosition);
	spotLight.position.copy(spotLightPosition);
	spotLight.angle = degreesToRadians(40);
	spotLight.intensity = 1.0;    
	spotLight.decay = 2.0; // The amount the light dims along the distance of the light.
	spotLight.penumbra = 0.5; // Percent of the spotlight cone that is attenuated due to penumbra. 

	// Shadow settings
	spotLight.castShadow = true;
	spotLight.shadow.mapSize.width = 512;
	spotLight.shadow.mapSize.height = 512;
markerRootLight.add(spotLight);

function updateSpotLight() {
	spotLight.target.updateMatrixWorld();
	spotLightSphere.position.copy(spotLight.position);
	spotLight.shadow.camera.updateProjectionMatrix();
}
  
function makeXYZGUI(gui, vector3, name, onChangeFn) {
	const folder = gui.addFolder(name);
	folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
	folder.add(vector3, 'y', -10, 10).onChange(onChangeFn);
	folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
	folder.open();
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

var spotLightFolder = gui.addFolder("Spotligh Parameters");
spotLightFolder.open();
makeXYZGUI(spotLightFolder, spotLight.position, "position", updateSpotLight);
makeXYZGUI(spotLightFolder, spotLight.target.position, "target", updateSpotLight);

gui.add(controls, "type",
	["Object0", "Object1", "Object2", "Object3",
	"Object4", "Object5", "Object6"])
	.name("Change Object")
	.onChange(function(e) {controls.onChooseObject();});

// Use this to show information onscreen
function showInformation()
{
	controls = new InfoBox();
		controls.add("Put the 'HIRO' and 'KANJI' markers in front of the camera.");
		controls.show();
}

//----------------------------------------------------------------------------
// Render the whole thing on the page

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