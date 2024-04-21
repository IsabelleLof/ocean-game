import "./style.css";

import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
//import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

//import the gltf loader to the boat
//import { GLFTLoader } from 'three/addons/loaders';

let camera, scene, renderer;
let controls, water, sun;

const loader = new GLTFLoader();

// get the boat

// loader.load("assets/boat/scene.gltf", function (gltf) {
//   //console.log(gltf);
//   scene.add(gltf.scene);
//   // y x position
//   gltf.scene.position.set(0, 4.5, 50);
//   gltf.scene.scale(3, 3, 3);
//   gltf.scene.rotation.x = 10;
// });

//create a class instead to have methods

class Boat {
  constructor() {
    loader.load("assets/boat/scene.gltf", (gltf) => {
      //console.log(gltf);
      scene.add(gltf.scene);
      // y x position
      gltf.scene.scale.set(3, 3, 3);
      gltf.scene.position.set(5, 13, 50);
      gltf.scene.rotation.y = 1.5;

      this.boat = gltf.scene;
      this.speed = {
        vel: 0,
        rot: 0,
      };
      //this.loaded = true; // Set the flag to true when the model has loaded
    });
  }

  stop() {
    this.speed.vel = 0;
    this.speed.rot = 0;
  }

  update() {
    if (this.boat) {
      this.boat.position.z += 0.03
      this.boat.position.x += 0.09
      this.boat.rotation.y += this.speed.rot;
      this.boat.translateX(this.speed.vel);
      
    }
  }
}

const boat = new Boat();



init();
animate();

function init() {
  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;
  document.body.appendChild(renderer.domElement);

  //

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    1,
    20000
  );
  camera.position.set(30, 30, 100);

  //

  sun = new THREE.Vector3();

  // Water

  const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load(
      "assets/waternormals.jpg",
      function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }
    ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });

  water.rotation.x = -Math.PI / 2;

  scene.add(water);

  // Skybox

  const sky = new Sky();
  sky.scale.setScalar(10000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;

  skyUniforms["turbidity"].value = 10;
  skyUniforms["rayleigh"].value = 2;
  skyUniforms["mieCoefficient"].value = 0.005;
  skyUniforms["mieDirectionalG"].value = 0.8;

  //change the sun

  const parameters = {
    elevation: 2,
    azimuth: 180,
  };

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const sceneEnv = new THREE.Scene();

  let renderTarget;

  function updateSun() {
    const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
    const theta = THREE.MathUtils.degToRad(parameters.azimuth);

    sun.setFromSphericalCoords(1, phi, theta);

    sky.material.uniforms["sunPosition"].value.copy(sun);
    water.material.uniforms["sunDirection"].value.copy(sun).normalize();

    if (renderTarget !== undefined) renderTarget.dispose();

    sceneEnv.add(sky);
    renderTarget = pmremGenerator.fromScene(sceneEnv);
    scene.add(sky);

    scene.environment = renderTarget.texture;
  }

  updateSun();

  //dont need this code

  // const geometry = new THREE.BoxGeometry( 30, 30, 30 );
  // const material = new THREE.MeshStandardMaterial( { roughness: 0 } );

  // mesh = new THREE.Mesh( geometry, material );
  // scene.add( mesh );

  //

  controls = new OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set(0, 10, 0);
  controls.minDistance = 40.0;
  controls.maxDistance = 200.0;
  controls.update();

  //

  // const folderSky = gui.addFolder( 'Sky' );
  // folderSky.add( parameters, 'elevation', 0, 90, 0.1 ).onChange( updateSun );
  // folderSky.add( parameters, 'azimuth', - 180, 180, 0.1 ).onChange( updateSun );
  // folderSky.open();

  const waterUniforms = water.material.uniforms;

  // const folderWater = gui.addFolder( 'Water' );
  // folderWater.add( waterUniforms.distortionScale, 'value', 0, 8, 0.1 ).name( 'distortionScale' );
  // folderWater.add( waterUniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
  // folderWater.open();

  window.addEventListener("resize", onWindowResize);

  window.addEventListener("keydown", function (e) {
    //this.alert(e.key);
    if (e.key == "ArrowUp") {
      boat.speed.vel = 1;
    }
    if (e.key == "ArrowDown") {
      boat.speed.vel = - 1;
    }
    if (e.key == "ArrowRight") {
      boat.speed.rot = -0.1;
    }
    if (e.key == "ArrowLeft") {
      boat.speed.rot = 0.1;
    }
  });
  window.addEventListener("keyup", function (e) {
    boat.stop();
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  //console.log("animate");
  requestAnimationFrame(animate);
  render();
  boat.update();
}

function render() {
  water.material.uniforms["time"].value += 1.0 / 60.0;

  renderer.render(scene, camera);
}
