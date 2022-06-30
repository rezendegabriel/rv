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

// Create a cube (A)
let dimCubeA = 4;
let cubeAGeometry = new THREE.BoxGeometry(dimCubeA, dimCubeA, dimCubeA);
let cubeA = new THREE.Mesh(cubeAGeometry, material);
// Position the cube (A)
cubeA.position.set(0.0, dimCubeA/2, 0); // RGB
// Add the cube (A) to the scene
scene.add(cubeA);

// Create a cube (B)
let dimCubeB = 1;
let cubeBGeometry = new THREE.BoxGeometry(dimCubeB, dimCubeB, dimCubeB);
let cubeB = new THREE.Mesh(cubeBGeometry, material);
// Position the cube (B)
cubeB.position.set(8*dimCubeB, dimCubeB/2, 0.0); // RGB
// Add the cube (B) to the scene
scene.add(cubeB);

// Create a cube (C)
let dimCubeC = 2;
let cubeCGeometry = new THREE.BoxGeometry(dimCubeC, dimCubeC, dimCubeC);
let cubeC = new THREE.Mesh(cubeCGeometry, material);
// Position the cube (C)
cubeC.position.set(-2*dimCubeC, dimCubeC/2, 2*dimCubeC); // RGB
// Add the cube (C) to the scene
scene.add(cubeC);

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