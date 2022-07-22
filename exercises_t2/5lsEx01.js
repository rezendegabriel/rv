import * as THREE from  "three";
import GUI from "../libs/util/dat.gui.module.js";
import {OrbitControls} from "../build/jsm/controls/OrbitControls.js";
import {initRenderer,
        onWindowResize, 
        degreesToRadians, 
        createLightSphere} from "../libs/util/util.js";
import {GLTFLoader} from "../build/jsm/loaders/GLTFLoader.js";

let scene, renderer, camera, orbit;

scene = new THREE.Scene(); // Create main scene

// View function in util/utils
renderer = initRenderer(); 
renderer.setClearColor("rgb(30, 30, 42)");

camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.lookAt(0, 0, 0);
camera.position.set(5, 5, 5);
camera.up.set(0, 1, 0);

// Enable mouse rotation, pan, zoom etc.
orbit = new OrbitControls(camera, renderer.domElement);

// Listen window size changes
window.addEventListener("resize", function(){onWindowResize(camera, renderer)}, false);

//---------------------------------------------------------
// Load default scene

let post = loadLightPostScene(scene);

export function loadLightPostScene(scene)
{
  // Light Post
  let obj = null;
  let loader = new GLTFLoader( );
  loader.load("../assets/objects/lightPost.glb", function (gltf) {
    obj = gltf.scene;
    obj.traverse(function (child) {
    if (child) {
      child.castShadow = true;
    }});

    obj.traverse(function (node) {
      if(node.material) node.material.side = THREE.DoubleSide;
    });

    obj.scale.set(1.0, 0.5, 1.0);
    scene.add (obj);
  }, null, null);

  // Ground plane
  let textureLoader = new THREE.TextureLoader();
  let floor = textureLoader.load("../assets/textures/intertravado.jpg");
  let planeGeometry = new THREE.PlaneGeometry(15, 15, 80, 80);
  let planeMaterial = new THREE.MeshLambertMaterial({side:THREE.DoubleSide});
  let groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    groundPlane.receiveShadow = true;
    groundPlane.rotateX(-1.5708);
    groundPlane.material.map = floor;  
    groundPlane.material.map.wrapS = THREE.RepeatWrapping;
    groundPlane.material.map.wrapT = THREE.RepeatWrapping;       
    groundPlane.material.map.repeat.set(6,6); 
    
  scene.add(groundPlane);

  return obj;
}

//---------------------------------------------------------

// Red prism
var rPrismGeometry = new THREE.BoxGeometry(0.5, 1, 0.5, 25);
var rPrismMaterial = new THREE.MeshPhongMaterial({color: "red"});
var rPrism = new THREE.Mesh(rPrismGeometry, rPrismMaterial);
  rPrism.castShadow = true;
  rPrism.position.set(3, 0.5, 0);
scene.add(rPrism);

// Green prism
var rPrismGeometry = new THREE.BoxGeometry(0.5, 1, 0.5, 25);
var rPrismMaterial = new THREE.MeshPhongMaterial({color: "green"});
var rPrism = new THREE.Mesh(rPrismGeometry, rPrismMaterial);
  rPrism.castShadow = true;
  rPrism.position.set(3, 0.5, 2);
scene.add(rPrism);

// Yellow cylinder
var yCylinderGeometry = new THREE.CylinderGeometry(0.25, 0.25, 1.5, 25);
var yCylinderMaterial = new THREE.MeshPhongMaterial({color: "yellow"});
var yClinder = new THREE.Mesh(yCylinderGeometry, yCylinderMaterial);
  yClinder.castShadow = true;
  yClinder.position.set(1.5, 0.75, -1.5);
scene.add(yClinder);

// Pink cylinder
var pCylinderGeometry = new THREE.CylinderGeometry(0.25, 0.25, 1.5, 25);
var pCylinderMaterial = new THREE.MeshPhongMaterial({color: "purple"});
var pClinder = new THREE.Mesh(pCylinderGeometry, pCylinderMaterial);
  pClinder.castShadow = true;
  pClinder.position.set(0.5, 0.75, 3);
scene.add(pClinder);

//---------------------------------------------------------
// Create and set all lights

// Ambient light
let ambientColor = "rgb(50, 50, 50)";
let ambientLight = new THREE.AmbientLight(ambientColor);
scene.add(ambientLight);

// Directional light
let dirPosition = new THREE.Vector3(2, 2, 4);
let dirLight = new THREE.DirectionalLight("white", 0.2);
dirLight.position.copy(dirPosition);
scene.add(dirLight);
dirLight.visible = true; // Only the visibility setting will be modified

// Spotlight
let spotColor = "rgb(255, 255, 255)";
let spotLight = new THREE.SpotLight(spotColor);
let spotPosition = new THREE.Vector3(1.25, 3, 0);
let spotSphere = createLightSphere(scene, 0.05, 10, 10, spotPosition); // Sphere to represent the light
setSpotLight(spotPosition);

// Set Spotlight
function setSpotLight(position)
{
  spotLight.visible = true;
  spotLight.position.copy(position);
  spotLight.angle = degreesToRadians(40);
  spotLight.intensity = 1.0;
  spotLight.decay = 2.0; // The amount the light dims along the distance of the light
  spotLight.penumbra = 0.5; // Percent of the spotlight cone that is attenuated due to penumbra
  
  // Shadow settings
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 512;
  spotLight.shadow.mapSize.height = 512;

  scene.add(spotLight.add());
}

// Update Spotlight
function updateSpotLight()
{
  spotLight.target.updateMatrixWorld();
  spotSphere.position.copy(spotLight.position);
  spotLight.shadow.camera.updateProjectionMatrix();
}

function makeXZGUI(gui, vector3, name, onChangeFn)
{
  const folder = gui.addFolder(name);
  folder.add(vector3, "x", -10, 10).onChange(onChangeFn);
  folder.add(vector3, "z", -10, 10).onChange(onChangeFn);
  folder.open();
}   

//---------------------------------------------------------

buildInterface();
render();

function buildInterface()
{
  let controls = new function() {
    this.ambientLight = true;
    this.dirLight = true;
    this.spotLight = true;

    this.onEnableAmbientLight = function() {
      ambientLight.visible = this.ambientLight;
    };

    this.onEnableDirectionalLight = function() {
      dirLight.visible = this.dirLight;
    };

    this.onEnableSpotlLight = function() {
      spotLight.visible = this.spotLight;
    };
  };

  // GUI interface
  let gui = new GUI();

  let spotFolder = gui.addFolder("SpotLight Parameters");

  //makeXZGUI(spotFolder, spotLight.position, "Position", updateSpotLight);
  makeXZGUI(spotFolder, spotLight.target.position, "Target", updateSpotLight);
  
  gui.add(controls, "ambientLight", true)
    .name("Ambient Light")
    .onChange(function(e) {controls.onEnableAmbientLight()});
  gui.add(controls, "dirLight", true)
    .name("Directional Light")
    .onChange(function(e) {controls.onEnableDirectionalLight()});
    gui.add(controls, "spotLight", true)
    .name("Spotlight")
    .onChange(function(e) {controls.onEnableSpotlLight()});
}

function render()
{
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
