import * as THREE from  "three";
import Stats from "../build/jsm/libs/stats.module.js";
import GUI from "../libs/util/dat.gui.module.js";
import {TrackballControls} from "../build/jsm/controls/TrackballControls.js";
import {initRenderer,
        initCamera,
        degreesToRadians,
        onWindowResize,
        initDefaultBasicLight} from "../libs/util/util.js";

var stats = new Stats(); // To show FPS information
var scene = new THREE.Scene(); // Create main scene
var renderer = initRenderer(); // View function in util/utils
var camera = initCamera(new THREE.Vector3(5, 5, 7)); // Init camera in this position
var trackballControls = new TrackballControls(camera, renderer.domElement);
initDefaultBasicLight(scene);

// Set angles of rotation
var angle = 0;
var angle2 = 0;
var speed = 0.05;
var animationOn = true; // Control if animation is on or of

// Show world axes
var axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// Base sphere
var sphereGeometry = new THREE.SphereGeometry(0.2, 32, 32);
var sphereMaterial = new THREE.MeshPhongMaterial({color: "lightgray"});
var sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
// Set initial position of the sphere
sphere.translateX(1.0).translateY(1.0).translateZ(1.0);

// Fixed cylinder
var cylinderGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.0, 25);
var cylinderMaterial = new THREE.MeshPhongMaterial({color: "lightgreen"});
var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
sphere.add(cylinder);

// Rede cylinder (1)
var cylinderGeometry2 = new THREE.CylinderGeometry(0.07, 0.07, 1.0, 25);
var cylinderMaterial2 = new THREE.MeshPhongMaterial({color: "rgb(255, 100, 100)"});
var cylinder2 = new THREE.Mesh(cylinderGeometry2, cylinderMaterial2);
cylinder.add(cylinder2);

// Rede cylinder (2)
var cylinderGeometry3 = new THREE.CylinderGeometry(0.07, 0.07, 1.0, 25);
var cylinderMaterial3 = new THREE.MeshPhongMaterial({color: "rgb(255, 255, 100)"});
var cylinder3 = new THREE.Mesh(cylinderGeometry3, cylinderMaterial3);
cylinder2.add(cylinder3);

// Rede cylinder (3)
var cylinderGeometry4 = new THREE.CylinderGeometry(0.07, 0.07, 1.0, 25);
var cylinderMaterial4 = new THREE.MeshPhongMaterial({color: "rgb(255, 255, 100)"});
var cylinder4 = new THREE.Mesh(cylinderGeometry4, cylinderMaterial4);
cylinder2.add(cylinder4);

// Listen window size changes
window.addEventListener("resize", function(){onWindowResize(camera, renderer)}, false);

buildInterface();
render();

function rotateCylinder()
{
  // More info:
  // https://threejs.org/docs/#manual/en/introduction/Matrix-transformations
  cylinder.matrixAutoUpdate = false;
  cylinder2.matrixAutoUpdate = false;
  cylinder3.matrixAutoUpdate = false;
  cylinder4.matrixAutoUpdate = false;

  // Set angle's animation speed
  if(animationOn)
  {
    angle+=speed;
    angle2+=speed*2;
    
    var mat4 = new THREE.Matrix4();

    // Reset matrices
    cylinder.matrix.identity();  
    cylinder2.matrix.identity();
    cylinder3.matrix.identity();
    cylinder4.matrix.identity();

    // Will execute T1 and then R1
    cylinder.matrix.multiply(mat4.makeRotationZ(angle)); // R1
    cylinder.matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0)); // T1

    // Will execute R3, T1 and R2 in this order
    cylinder2.matrix.multiply(mat4.makeRotationY(angle2)); // R2
    cylinder2.matrix.multiply(mat4.makeTranslation(0.0, 1.0, 0.0)); // T1
    cylinder2.matrix.multiply(mat4.makeRotationX(degreesToRadians(90))); // R3

    // Will execute R3, T2 and R2 in this order
    cylinder3.matrix.multiply(mat4.makeRotationY(angle2)); // R2
    cylinder3.matrix.multiply(mat4.makeTranslation(0.0, 0.5, 0.0)); // T2
    cylinder3.matrix.multiply(mat4.makeRotationX(degreesToRadians(90))); // R3

    // Will execute R3, T3 and R4 in this order
    cylinder4.matrix.multiply(mat4.makeRotationY(-angle2)); // R4
    cylinder4.matrix.multiply(mat4.makeTranslation(0.0, -0.5, 0.0)); // T3
    cylinder4.matrix.multiply(mat4.makeRotationX(degreesToRadians(90))); // R3
  }
}

function buildInterface()
{
  var controls = new function () {
    this.onChangeAnimation = function() {
      animationOn = !animationOn;
    };
    this.speed = 0.05;

    this.changeSpeed = function() {
      speed = this.speed;
    };
  };

  // GUI interface
  var gui = new GUI();
  gui.add(controls, "onChangeAnimation", true).name("Animation On/Off");
  gui.add(controls, "speed", 0.05, 0.5)
    .onChange(function(e) {controls.changeSpeed()})
    .name("Change Speed");
}

function render()
{
  stats.update(); // Update FPS
  trackballControls.update();
  rotateCylinder();
  requestAnimationFrame(render);
  renderer.render(scene, camera); // Render scene
}
