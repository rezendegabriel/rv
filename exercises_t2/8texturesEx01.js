import * as THREE from  "three";
import {TrackballControls} from "../build/jsm/controls/TrackballControls.js";
import {initRenderer,
        initDefaultBasicLight} from "../libs/util/util.js";

var scene = new THREE.Scene(); // Create main scene
var renderer = initRenderer(); // View function in util/utils
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
   camera.lookAt(0, 0, 0);
   camera.position.set(5, 5, 5);
   camera.up.set(0, 1, 0);
var light = initDefaultBasicLight(scene, true, new THREE.Vector3(20, 20, 20));
var ambientColor = "rgb(25, 25, 25)";
var ambientLight = new THREE.AmbientLight(ambientColor);
scene.add(ambientLight);

// Enable mouse rotation, pan, zoom etc.
var trackballControls = new TrackballControls(camera, renderer.domElement);

// Cube with 5 faces
var planeMaterial = new THREE.MeshLambertMaterial({color:"rgb(255,255,255)", side:THREE.DoubleSide});

var planeGeometry = new THREE.PlaneGeometry(1.0, 1.0);
var plane1 = new THREE.Mesh(planeGeometry, planeMaterial);
var plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
plane2.rotateX(Math.PI/2);
plane2.translateY(-0.5);
plane2.translateZ(-0.5);
var plane3 = new THREE.Mesh(planeGeometry, planeMaterial);
plane3.translateZ(-1);
var plane4 = new THREE.Mesh(planeGeometry, planeMaterial);
plane4.rotateY(Math.PI/2);
plane4.translateX(0.5);
plane4.translateZ(-0.5);
var plane5 = new THREE.Mesh(planeGeometry, planeMaterial);
plane5.rotateY(Math.PI/2);
plane5.translateX(0.5);
plane5.translateZ(0.5);

// Texture
var textureLoader = new THREE.TextureLoader();
var marble = textureLoader.load("../assets/textures/marble.png");

// Apply texture to the "map" property of the planes
plane1.material.map = marble;
plane1.material.map.repeat.set(1, 1);
plane2.material.map = marble;
plane2.material.map.repeat.set(1, 1);
plane3.material.map = marble;
plane3.material.map.repeat.set(1, 1);
plane4.material.map = marble;
plane4.material.map.repeat.set(1, 1);
plane5.material.map = marble;
plane5.material.map.repeat.set(1, 1);

// Create a group to entire cube
var cube5Faces = new THREE.Group();
cube5Faces.add(plane1)
cube5Faces.add(plane2)
cube5Faces.add(plane3)
cube5Faces.add(plane4)
cube5Faces.add(plane5)
scene.add(cube5Faces)

render();

function render() {
  trackballControls.update();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}