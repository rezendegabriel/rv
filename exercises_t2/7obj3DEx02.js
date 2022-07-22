import * as THREE from  "three";
import Stats from "../build/jsm/libs/stats.module.js";
import {TrackballControls} from "../build/jsm/controls/TrackballControls.js";
import {GLTFLoader} from "../build/jsm/loaders/GLTFLoader.js";
import {initRenderer, 
        SecondaryBox,
        initDefaultBasicLight,
        createGroundPlane,
        onWindowResize, 
        getMaxSize,
        degreesToRadians} from "../libs/util/util.js";

var scene = new THREE.Scene(); // Create main scene
var stats = new Stats(); // To show FPS information
initDefaultBasicLight(scene, true); // Use default light
var renderer = initRenderer();    // View function in util/utils
  renderer.setClearColor("rgb(30, 30, 42)");
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.lookAt(0, 0, 0);
  camera.position.set(2.18, 1.62, 3.31);
  camera.up.set(0, 1, 0);

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls(camera, renderer.domElement);

// Listen window size changes
window.addEventListener("resize", function(){onWindowResize(camera, renderer)}, false);

var groundPlane = createGroundPlane(4.0, 4.0, 80, 80); // width and height
  groundPlane.rotateX(degreesToRadians(-90));
scene.add(groundPlane);

var infoBox = new SecondaryBox("");

//---------------------------------------------------------
// Load external object

loadGLBFile("../assets/objects/", "toon_tank", true, 1.2);
render();

function loadGLBFile(modelPath, modelName, visibility, desiredScale)
{
  var loader = new GLTFLoader();
  loader.load(modelPath + modelName + ".glb", function (gltf) {
    var obj = gltf.scene;
    obj.name = modelName;
    obj.visible = visibility;
    obj.traverse(function (child) {
      if (child) {
        child.castShadow = true;
      }
    });

    obj.traverse(function(node) {
      if(node.material) node.material.side = THREE.DoubleSide;
    });

    var obj = normalizeAndRescale(obj, desiredScale);
    var obj = fixPosition(obj);

    scene.add(obj);
    infoBox.changeMessage(obj.name);
  }, onProgress, onError);
}

function onError() { };

function onProgress (xhr, model)
{
  if (xhr.lengthComputable) {
    var percentComplete = xhr.loaded/xhr.total*100;
    infoBox.changeMessage("Loading... " + Math.round(percentComplete, 2) + "% processed");
  }
}

// Normalize scale and multiple by the newScale
function normalizeAndRescale(obj, newScale)
{
  var scale = getMaxSize(obj); // Available in "utils.js"
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

function render()
{
  stats.update();
  trackballControls.update();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
