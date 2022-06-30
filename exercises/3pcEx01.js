import * as THREE from  "three";
import GUI from "../libs/util/dat.gui.module.js";
import KeyboardState from "../libs/util/KeyboardState.js";
import {initRenderer,
        createGroundPlaneWired,
        InfoBox,
        degreesToRadians} from "../libs/util/util.js";

// Create main scene
var scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight()); // Add light source

var renderer = initRenderer(); // Init a basic renderer

// Plane
var plane = createGroundPlaneWired(150, 150, 50, 50);
scene.add(plane);

// Show axes
var axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// Main camera
var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.lookAt(0, 0, 0);
camera.position.set(0, 0, 1);
camera.up.set(0, 1, 0);

// Camera holder
var cameraHolder = new THREE.Object3D();
cameraHolder.position.set(0, 2, 0);
cameraHolder.add(camera);
scene.add(cameraHolder);

// To use the keyboard
var keyboard = new KeyboardState();

// Initial movements
var movements = [-0.3, 0.6];

function keyboardUpdate() {
  keyboard.update();
  if (keyboard.pressed("space")) cameraHolder.translateZ(movements[0]);
 
  let angle = degreesToRadians(movements[1]);
  if (keyboard.pressed("left")) cameraHolder.rotateY(angle);
  if (keyboard.pressed("right")) cameraHolder.rotateY(-angle);
  if (keyboard.pressed("down")) cameraHolder.rotateX(angle);
  if (keyboard.pressed("up")) cameraHolder.rotateX(-angle);
  if (keyboard.pressed(",")) cameraHolder.rotateZ(angle);
  if (keyboard.pressed(".")) cameraHolder.rotateZ(-angle);
}

buildInterface();

function buildInterface()
{
  var controls = new function() {
    this.speed = -0.3;
    this.rotation = 0.6;

    this.move = function() {
      movements[0] = this.speed;
      movements[1] = this.rotation;
      keyboardUpdate();
    };
  };

  // GUI interface
  var gui = new GUI();
  gui.add(controls, "speed", -2, 0)
    .onChange(function() {controls.move()})
    .name("Speed");
  gui.add(controls, "rotation", 0, 2)
    .onChange(function() {controls.move()})
    .name("Rotation");
} 

// Show text information onscreen
showInformation();

function showInformation()
{
  // Use this to show information onscreen
  var controls = new InfoBox();
    controls.add("Commands");
    controls.addParagraph();
    controls.add("Press 's pace' to move in -Z.");
    controls.add("Use keyboard arrows to rotate in XY.");
    controls.add("Use '<' and '>' to rotate in Z.");
    controls.show();
}

render();

function render()
{
  keyboardUpdate();
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}