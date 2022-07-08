import * as THREE from  "three";
import Stats from "../build/jsm/libs/stats.module.js";
import {TrackballControls} from "../build/jsm/controls/TrackballControls.js";
import {ConvexGeometry} from "../build/jsm/geometries/ConvexGeometry.js";
import {initRenderer, 
        initDefaultSpotlight,
        createGroundPlaneXZ,
        onWindowResize} from "../libs/util/util.js";

let scene = new THREE.Scene(); // Create main scene
let stats = new Stats(); // To show FPS information
let light = initDefaultSpotlight(scene, new THREE.Vector3(25, 30, 20)); // Use default light
light.position.set(25, 40, 25);
let renderer = initRenderer(); // View function in util/utils
  renderer.setClearColor("rgb(30, 30, 30)");
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.lookAt(0, 0, 0);
  camera.position.set(5, 15, 40);
  camera.up.set(0, 1, 0);

// Enable mouse rotation, pan, zoom etc.
let trackballControls = new TrackballControls(camera, renderer.domElement);

// Listen window size changes
window.addEventListener("resize", function(){onWindowResize(camera, renderer)}, false);

// Create the ground plane
let groundPlane = createGroundPlaneXZ(20, 20);
scene.add(groundPlane);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// Object Material
let objectColor = "rgb(0, 255, 0)";
let objectMaterial = new THREE.MeshPhongMaterial({color: objectColor});

//----------------------------------
// Create convex object

convexObject();
render();

function generatePoints()
{
  let points = [];
  points.push(new THREE.Vector3(0.0, 0.0, 0.0));
  points.push(new THREE.Vector3(2.0, 0.0, 0.0));
  points.push(new THREE.Vector3(2.0, 0.0, 1.0));
  points.push(new THREE.Vector3(0.0, 0.0, 1.0));
  points.push(new THREE.Vector3(0.0, 1.0, 0.0));
  points.push(new THREE.Vector3(1.0, 1.0, 0.0));
  points.push(new THREE.Vector3(1.0, 1.0, 1.0));
  points.push(new THREE.Vector3(0.0, 1.0, 1.0));

  let sphereMaterial = new THREE.MeshPhongMaterial({color:"rgb(255, 255, 0)"});
  let pointCloud = new THREE.Object3D();
  points.forEach(function (point) {
    let sphereGeom = new THREE.SphereGeometry(0.1);
    let sphereMesh = new THREE.Mesh(sphereGeom, sphereMaterial);
    sphereMesh.position.set(point.x, point.y, point.z);
    pointCloud.add(sphereMesh);
  });

  scene.add(pointCloud);

  return points;
}

function convexObject()
{
  // First, create the point vector to be used by the convex hull algorithm
  let localPoints = generatePoints();

  // Then, build the convex geometry with the generated points
  let convexGeometry = new ConvexGeometry(localPoints);

  let object = new THREE.Mesh(convexGeometry, objectMaterial);
    object.castShadow = true;
    object.receiveShadow = true;
  scene.add(object);
}

function render()
{
  stats.update();
  trackballControls.update();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}