import * as THREE from  '../build/three.module.js';
import Stats from       '../build/jsm/libs/stats.module.js';
import {TrackballControls} from '../build/jsm/controls/TrackballControls.js';
import {initRenderer, 
        initCamera,
        onWindowResize,
        onOrientationChange,
        degreesToRadians} from "../libs/util/util.js";

import {Buttons} from "../libs/other/buttons.js";

var pressedA = false;        
var pressedB = false;        

//var buttons = createButtons();
var buttons = new Buttons(onButtonClick, onButtonUp);
var stats = new Stats();          // To show FPS information
var scene = new THREE.Scene();    // Create main scene
var renderer = initRenderer();    // View function in util/utils
var camera = initCamera(new THREE.Vector3(0, -30, 15)); // Init camera in this position

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls( camera, renderer.domElement );

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper( 12 );
scene.add( axesHelper );

// create the ground plane
var planeGeometry = new THREE.PlaneGeometry(20, 20);
planeGeometry.translate(0.0, 0.0, -0.02); // To avoid conflict with the axeshelper
var planeMaterial = new THREE.MeshBasicMaterial({
    color: "rgba(150, 150, 150)",
    side: THREE.DoubleSide,
});
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
// add the plane to the scene
scene.add(plane);

// create a cube
var cubeGeometry = new THREE.BoxGeometry(4, 4, 4);
var cubeMaterial = new THREE.MeshNormalMaterial();
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// position the cube
cube.position.set(0.0, 0.0, 2.0);
// add the cube to the scene
scene.add(cube);

// Listen window size changes
window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );
window.addEventListener("orientationchange", onOrientationChange );

render();
function render()
{
  stats.update(); // Update FPS
  trackballControls.update(); // Enable mouse movements
  doSomething();
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}

// function createButtons()
// {
//     buttons = document.getElementsByTagName("button");
//     for (let i = 0; i < buttons.length; i++) {
//         buttons[i].addEventListener("mousedown", onButtonClick, false);
//         buttons[i].addEventListener("touchstart", onButtonClick, false);
//         buttons[i].addEventListener("mouseup", onButtonUp, false);      
//         buttons[i].addEventListener("touchend", onButtonUp, false); 
//     };
//     return buttons;
// }

function onButtonClick(event) {
  switch(event.target.id)
  {
    case "A":
      pressedA = true;
     break;
    case "B":
      pressedB = true;
    break;    
    case "full":
      buttons.setFullScreenSettings();
    break;    
  }
}

function onButtonUp(event) {
  pressedA = pressedB = false;
}

function doSomething()
{
  if(pressedA)
  {
    var angle = degreesToRadians(1);
    var rotAxis = new THREE.Vector3(0,0,1); // Set Z axis
    cube.rotateOnAxis(rotAxis,  angle );    
  }
  if(pressedB)
  {
    var angle = degreesToRadians(-1);
    var rotAxis = new THREE.Vector3(0,0,1); // Set Z axis
    cube.rotateOnAxis(rotAxis,  angle );    
  }
}