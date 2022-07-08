import * as THREE from  "three";
import Stats from "../build/jsm/libs/stats.module.js";
import GUI from "../libs/util/dat.gui.module.js"
import {TrackballControls} from "../build/jsm/controls/TrackballControls.js";
import {initRenderer,
        initCamera, 
        initDefaultBasicLight,
        createGroundPlaneXZ,
        onWindowResize,
        degreesToRadians} from "../libs/util/util.js";
import {CSG} from "../libs/other/CSGMesh.js";

var scene = new THREE.Scene(); // Create main scene
var stats = new Stats(); // To show FPS information
var renderer = initRenderer(); // View function in util/utils
renderer.setClearColor("rgb(30, 30, 40)");
var camera = initCamera(new THREE.Vector3(1.0, 2.5, 4.5)); // Init camera in this position
window.addEventListener("resize", function(){onWindowResize(camera, renderer)}, false);
initDefaultBasicLight(scene, true, new THREE.Vector3(5, 5, 25), 28, 1024);	

var groundPlane = createGroundPlaneXZ(20, 20); // width and height (x, y)
scene.add(groundPlane);

// Show axes (parameter is size of each axis)
var axesHelper = new THREE.AxesHelper(12);
scene.add( axesHelper );

var trackballControls = new TrackballControls(camera, renderer.domElement);

// To be used in the interface
let mesh;

buildInterface();
buildObjects();
render();

function buildObjects()
{
   let auxMat = new THREE.Matrix4();

   // Base objects
   let exCylinderMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.5, 20));
   let intCylinderMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.5, 20));
   let torusMesh = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.1, 30, 30));

   // CSG holders
   let csgObj, exCylinderCSG, intCylinderCSG, torusCSG;

   // Cup
   // Objetc - (Cylinder UNION Torus) SUBTRACT Cylinder
   exCylinderMesh.position.set(0.0, 0.75, 0.0);
   updateObject(exCylinderMesh);
   exCylinderCSG = CSG.fromMesh(exCylinderMesh);

   torusMesh.rotateX(degreesToRadians(0));
   torusMesh.position.set(0.5, 0.75, 0.0);
   updateObject(torusMesh);
   torusCSG = CSG.fromMesh(torusMesh);

   intCylinderMesh.position.set(0.0, 0.80, 0.0);
   updateObject(intCylinderMesh);
   intCylinderCSG = CSG.fromMesh(intCylinderMesh);

   csgObj = exCylinderCSG.union(torusCSG); // Execute union
   csgObj = csgObj.subtract(intCylinderCSG); // Execute subtraction

   mesh = CSG.toMesh(csgObj, auxMat);

   let cupColor = "lightblue"; // Define the color of the object
   let cupShininess = "100"; // Define the shininess of the object
   let cupSpecular = "rgb(255, 255, 255)"; // Color of the specular component
   mesh.material = new THREE.MeshPhongMaterial({color: cupColor, shininess: cupShininess, specular: cupSpecular});
      mesh.castShadow = true;   
      mesh.position.set(0.0, 0.0, 0.0);
   scene.add(mesh);
}

function updateObject(mesh)
{
   mesh.matrixAutoUpdate = false;
   mesh.updateMatrix();
}

function buildInterface()
{
  var controls = new function ()
  {
    this.wire = false;
    
    this.onWireframeMode = function(){
       mesh.material.wireframe = this.wire;       
    };
  };

  // GUI interface
  var gui = new GUI();
  gui.add(controls, "wire", false)
    .name("Wireframe")
    .onChange(function(e) {controls.onWireframeMode()});
}

function render()
{
  stats.update(); // Update FPS
  trackballControls.update();
  requestAnimationFrame(render); // Show events
  renderer.render(scene, camera) // Render scene
}
