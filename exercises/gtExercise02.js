import * as THREE from  'three';
import {OrbitControls} from '../build/jsm/controls/OrbitControls.js';
import {initRenderer, 
        initCamera,
        initDefaultBasicLight,
        setDefaultMaterial,
        InfoBox,
        onWindowResize,
        degreesToRadians,
        createGroundPlaneXZ} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene();    // Create main scene
renderer = initRenderer();    // Init a basic renderer
camera = initCamera(new THREE.Vector3(0, 15, 30)); // Init camera in this position
material = setDefaultMaterial(); // Create a basic material
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

// Creates the spheres
let radius, widthSegments, heightSegments, yStepAngle, x, z, numSpheres;
radius = 0.5;
widthSegments = 100;
heightSegments = 100;

yStepAngle = degreesToRadians(30);
x = 8;
z = 0;
numSpheres = 12;

for (var i = 0; i < numSpheres; i++) {
  var sphere = createSphere(radius, widthSegments, heightSegments, material);

  // Add the cylinder to the scene
  scene.add(sphere);

  sphere.matrixAutoUpdate = false;
  sphere.matrix.identity(); // Resetting matrice

  var mat4 = new THREE.Matrix4(); // Auxiliar matrix

  // Translation and Rotation
  sphere.matrix.multiply(mat4.makeRotationY(yStepAngle*i));
  sphere.matrix.multiply(mat4.makeTranslation(x, radius, z));
}

function createSphere(radius, widthSegments, heightSegments, material)
{
  var sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  var sphere = new THREE.Mesh(sphereGeometry, material);

  return sphere;
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