import * as THREE from  "three";
import {OrbitControls} from "../build/jsm/controls/OrbitControls.js";
import {initRenderer,
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ } from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene(); // Create main scene
renderer = initRenderer(); // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial("orange"); // Creates basic materials
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

// Create cubes
let dimCube, step, x, z, dx, dz, r, b;
dimCube = 4;
step = 2;
x = z = -step*dimCube; // Initial position
r = 3;
b = 3;
for (var i = 0; i < r; i++) {
  for (var k = 0; k < b; k++) {
    let cubeGeometry = new THREE.BoxGeometry(dimCube, dimCube, dimCube);
    let cube = new THREE.Mesh(cubeGeometry, material);
  
    // Cube position
    dx = i*step*dimCube;
    dz = k*step*dimCube;
    cube.position.set(x+dx, dimCube/2, z+dz); // RGB
    // Add the cube to the scene
    scene.add(cube);
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
function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}