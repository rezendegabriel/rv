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

// Cylinder object
var cylinderGeometry = new THREE.CylinderGeometry(1, 1, 4, 30, 30, true);
var cylinderMaterial = new THREE.MeshLambertMaterial({color: "rgb(255, 255, 255)", side: THREE.DoubleSide});
var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);

var circleGeometry = new THREE.CircleGeometry(cylinderGeometry.parameters.radiusTop, 30);
var circleMaterial = new THREE.MeshLambertMaterial({color: "rgb(255, 255, 255)", side: THREE.DoubleSide });
var circle1 = new THREE.Mesh(circleGeometry, circleMaterial);
var circle2 = new THREE.Mesh(circleGeometry, circleMaterial);
circle1.rotateX(Math.PI/2)
circle1.position.y = -cylinderGeometry.parameters.height/2;
circle2.rotateX(Math.PI/2)
circle2.position.y = cylinderGeometry.parameters.height/2;

// Texture
var textureLoader = new THREE.TextureLoader();
var woodLateral = textureLoader.load("../assets/textures/wood.png");
var woodTop = textureLoader.load("../assets/textures/woodtop.png");

// Apply texture to the "map" property of the planes
cylinder.material.map = woodLateral;
cylinder.material.map.repeat.set(1, 1);
cylinder.material.map.wrapS = THREE.RepeatWrapping;
cylinder.material.map.wrapT = THREE.RepeatWrapping;
cylinder.material.map.minFilter = THREE.LinearFilter;
cylinder.material.map.magFilter = THREE.LinearFilter;

circle1.material.map = woodTop;
circle1.material.map.repeat.set(1, 1);
circle1.material.map.wrapS = THREE.RepeatWrapping;
circle1.material.map.wrapT = THREE.RepeatWrapping;
circle1.material.map.minFilter = THREE.LinearFilter;
circle1.material.map.magFilter = THREE.LinearFilter;

// Create a group to entire wood
var wood = new THREE.Group();
wood.add(cylinder)
wood.add(circle1)
wood.add(circle2)
scene.add(wood)

render();

function render() {
  trackballControls.update();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}