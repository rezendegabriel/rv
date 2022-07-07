import * as THREE from  "three";
import GUI from "../libs/util/dat.gui.module.js"
import {OrbitControls} from "../build/jsm/controls/OrbitControls.js";
import {TeapotGeometry} from "../build/jsm/geometries/TeapotGeometry.js";
import {CylinderGeometry, SphereGeometry} from "../build/three.module.js";
import {initRenderer,
        initCamera,
        setDefaultMaterial,
        onWindowResize,
        createGroundPlaneXZ,
        createLightSphere} from "../libs/util/util.js";

let scene, renderer, camera, material, light, orbit; // Initial variables
scene = new THREE.Scene(); // Create main scene
renderer = initRenderer(); // Init a basic renderer
camera = initCamera(new THREE.Vector3(5.0, 8.0, 18.0)); // Init camera in this position
material = setDefaultMaterial(); // Create a basic material
orbit = new OrbitControls(camera, renderer.domElement); // Enable mouse rotation, pan, zoom etc.

// Listen window size changes
window.addEventListener("resize", function(){onWindowResize(camera, renderer)}, false);

// Show axes (parameter is size of each axis)
let axesHelper = new THREE.AxesHelper(12);
scene.add(axesHelper);

// Create the ground plane
let plane = createGroundPlaneXZ(20, 20)
scene.add(plane);

//------------------------------------------------------------
// OBJECTS

// Cone
let coneColor = "lightblue";

let coneGeometry = new CylinderGeometry(0.25, 2.0, 6.0, 20, 20);
let coneMaterial = new THREE.MeshPhongMaterial({color: coneColor, flatShading: true});
  coneMaterial.side = THREE.DoubleSide;
let cone = new THREE.Mesh(coneGeometry, coneMaterial);
  cone.castShadow = true;
  cone.position.set(4.5, 3.0, 3.0);
scene.add(cone);

// Teapot
let teapotColor = "rgb(255, 20, 20)"; // Define the color of the object
let teapotShininess = "100"; // Define the shininess of the object
let teapotspecular = "rgb(255,255,255)"; // Color of the specular component

let teapotGeometry = new TeapotGeometry(1.5);
let teapotMaterial = new THREE.MeshPhongMaterial({color: teapotColor, shininess: teapotShininess, specular: teapotspecular});
  teapotMaterial.side = THREE.DoubleSide;
let teapot = new THREE.Mesh(teapotGeometry, teapotMaterial);
  teapot.castShadow = true;
  teapot.receiveShadow = true;
  teapot.position.set(0.0, 1.5, 0.0);
scene.add(teapot);

// Sphere
let sphereColor = "lightgreen";

let sphereGeometry = new SphereGeometry(1.5, 100, 100);
let shpereMaterial = new THREE.MeshPhongMaterial({color: sphereColor});
  shpereMaterial.side = THREE.DoubleSide;
let sphere = new THREE.Mesh(sphereGeometry, shpereMaterial);
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  sphere.position.set(-4.5, 1.5, -3.0);
scene.add(sphere);

//------------------------------------------------------------
// Light

// Sphere to represent the light
let lightPosition = new THREE.Vector3(7.5, 4.0, 6.0);
let lightSphere = createLightSphere(scene, 0.25, 10, 10, lightPosition);

// Ambient light
let ambientColor = "rgb(75, 75, 75)";

let ambientLight = new THREE.AmbientLight(ambientColor);
scene.add(ambientLight);

// Directional light
let dirColor = "rgb(255, 255, 255)";

let dirLight = new THREE.DirectionalLight(dirColor);
setLighting(lightPosition);

function setLighting(position)
{
  dirLight.position.copy(position);

  // Shadow settings
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 512;
  dirLight.shadow.mapSize.height = 512;

  scene.add(dirLight);
}

buildInterface();
render();

function buildInterface()
{
  let controls = new function() {
    this.ambientLight = true;
    this.dirLight = true;

    this.onEnableAmbientLight = function() {
      ambientLight.visible = this.ambientLight;
    };

    this.onEnableDirectionalLight = function() {
      dirLight.visible = this.dirLight;
    };
  };

  // GUI interface
  let gui = new GUI();

  gui.add(controls, "ambientLight", true)
    .name("Ambient Light")
    .onChange(function(e) {controls.onEnableAmbientLight()});
  gui.add(controls, "dirLight", true)
    .name("Directional Light")
    .onChange(function(e) {controls.onEnableDirectionalLight()});
}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera) // Render scene
}