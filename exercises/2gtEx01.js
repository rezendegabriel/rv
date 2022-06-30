import * as THREE from  "three";
import {OrbitControls} from "../build/jsm/controls/OrbitControls.js";
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // Create a basic material
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener("resize", function(){onWindowResize(camera, renderer)}, false);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// Create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// Create the table
let dimCube, g;
dimCube = 1;
g = 3;
let cubeGeometry = new THREE.BoxGeometry(dimCube, dimCube, dimCube);
let cube = new THREE.Mesh(cubeGeometry, material);

cube.position.set(0.0, g, 0.0); // Position the cube
cube.scale.set(11, 0.3, 6); // Set scale to create a table
scene.add(cube); // Add the table to the scene

// Creates the supports
let radiusTop, radiusBottom, height, radialSegments, x, z, stepR, stepB, r, b, dx, dz;
radiusTop = 0.2;
radiusBottom = 0.2;
height = 3;
radialSegments = 100;

// Initial positions
x = -(11/2)+2*radiusTop;
z = -(6/2)+2*radiusTop;

stepR = -2*x;
stepB = -2*z;
r = 2;
b = 2;

for (var i = 0; i < r; i++) {
  for (var k = 0; k < b; k++) {
    let cylinderGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    let cylinder = new THREE.Mesh(cylinderGeometry, material);
  
    // Cylinder position
    dx = i*stepR*dimCube;
    dz = k*stepB*dimCube;
    cylinder.position.set(x, height/2, z); // RGB
    cylinder.translateX(dx);
    cylinder.translateZ(dz);
    // Add the cylinder to the scene
    scene.add(cylinder);
  }
}

// Use this to show information onscreen
let controls = new InfoBox();
  controls.add("Basic Scene");
  controls.addParagraph();
  controls.add("Use mouse to interact:");
  controls.add("• Left button to rotate");
  controls.add("• Right button to translate (pan)");
  controls.add("• Scroll to zoom in/out.");
  controls.show();

render();
function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}