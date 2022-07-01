import * as THREE from  "three";
import Stats from "../build/jsm/libs/stats.module.js";
import GUI from "../libs/util/dat.gui.module.js";
import {TrackballControls} from "../build/jsm/controls/TrackballControls.js";
import {initRenderer,
        initCamera,
        degreesToRadians,
        onWindowResize,
        initDefaultBasicLight,
        createGroundPlaneXZ} from "../libs/util/util.js";

var stats = new Stats(); // To show FPS information
var scene = new THREE.Scene(); // Create main scene
var renderer = initRenderer(); // View function in util/utils
var camera = initCamera(new THREE.Vector3(10, 10, 14)); // Init camera in this position
var trackballControls = new TrackballControls(camera, renderer.domElement);
initDefaultBasicLight(scene);

// Create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// Show world axes
var axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// Base sphere (1)
var sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
var sphereMaterial = new THREE.MeshPhongMaterial({color: "rgb(255, 100, 100)"});
var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
// Set initial position of the sphere
sphere.translateX(-8.0).translateY(1.0).translateZ(-5.0);

// Base sphere (2)
var sphereGeometry2 = new THREE.SphereGeometry(1, 32, 32);
var sphereMaterial2 = new THREE.MeshPhongMaterial({color: "rgb(255, 100, 100)"});
var sphere2 = new THREE.Mesh(sphereGeometry2, sphereMaterial2);
scene.add(sphere2);
// Set initial position of the sphere
sphere2.translateX(-8.0).translateY(1.0).translateZ(5.0);

// Translation speeds
var speedSphere1 = 0.05;
var speedSphere2 = 0.03;

// Controls if animations are on or off
var animationSphere1On = false;
var animationSphere2On = false;
var reset = false;

// Listen window size changes
window.addEventListener("resize", function(){onWindowResize(camera, renderer)}, false);

buildInterface();
render();

function translateSpheres()
{
  // Set translation animation of sphere 1
  if(animationSphere1On) {
    // Execute T1
    sphere.translateX(speedSphere1); // T1
  }

  // Set translation animation of sphere 1
  if(animationSphere2On) {
    // Execute T1
    sphere2.translateX(speedSphere2); // T1
  }

  if(reset) {
    sphere.position.set(-8.0, 1.0, -5.0);
    sphere2.position.set(-8.0, 1.0, 5.0);

    animationSphere1On = false;
    animationSphere2On = false;
    reset = false;
  }
}

function buildInterface()
{
  var controls = new function () {
    this.onChangeAnimationSphere1 = function() {
      animationSphere1On = !animationSphere1On;
    };

    this.onChangeAnimationSphere2 = function() {
      animationSphere2On = !animationSphere2On;
    };

    this.reset  = function() {
      reset = true;
    };
  };

  // GUI interface
  var gui = new GUI();
  gui.add(controls, "onChangeAnimationSphere1", true).name("Shpere 1");
  gui.add(controls, "onChangeAnimationSphere2", true).name("Shpere 2");
  gui.add(controls, "reset", true).name("Reset");
}

function render()
{
  stats.update(); // Update FPS
  trackballControls.update();
  translateSpheres();
  requestAnimationFrame(render);
  renderer.render(scene, camera); // Render scene
}