import * as THREE from  'three';
import {OrbitControls} from '../build/jsm/controls/OrbitControls.js';
import {initRenderer,
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        createGroundPlaneXZ } from "../libs/util/util.js";

let scene, renderer, camera, materialCube, materialSphere, materialCylinder, light, orbit; // Initial variables
scene = new THREE.Scene(); // Create main scene
renderer = initRenderer(); // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
// Creates basic materials
materialCube = setDefaultMaterial("lightgreen");
materialSphere = setDefaultMaterial("lightblue"); 
materialCylinder = setDefaultMaterial(); 
light = initDefaultBasicLight(scene); // Create a basic light to illuminate the scene
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener('resize', function(){onWindowResize(camera, renderer)}, false);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// Create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

// Create a cube
let dimCube = 4;
let cubeGeometry = new THREE.BoxGeometry(dimCube, dimCube, dimCube);
let cube = new THREE.Mesh(cubeGeometry, materialCube);
// Position the cube
cube.position.set(0.0, dimCube/2, 0); // RGB
// Add the cube to the scene
scene.add(cube);

// Create a sphere
let radius, widthSegments, heightSegments;
radius = 2;
widthSegments = 100;
heightSegments = 100;
let sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
let sphere = new THREE.Mesh(sphereGeometry, materialSphere);
// Position the sphere
sphere.position.set(3*radius, radius, 0.0);  // RGB
// Add the sphere to the scene
scene.add(sphere);

// Create a cylinder
let radiusTop, radiusBottom, height, radialSegments;
radiusTop = 3;
radiusBottom = 3;
height = 8;
radialSegments = 100;
let cylinderGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
let cylinder = new THREE.Mesh(cylinderGeometry, materialCylinder);
// Position the cylinder
cylinder.position.set(-2*radiusTop, height/2, 0.0);  // RGB
// Add the cylinder to the scene
scene.add(cylinder);

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