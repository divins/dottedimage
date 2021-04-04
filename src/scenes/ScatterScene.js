import gsap from 'gsap/gsap-core';
import * as dat from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

import ScatterModel from './ScatterModel';
import ScatterText from './ScatterText';

export default class ScatterScene {
  constructor(options) {
    options;
    this.threeOptions = {};
    this.threeObjects = {
      geos: [],
      mats: [],
      meshes: []
    };
  }

  /**
   * Tools
   */
  aspectRatio() {
    return this.threeOptions.sizes.width / this.threeOptions.sizes.height;
  }

  resize() {
    // Update sizes
    this.threeOptions.sizes.width = window.innerWidth;
    this.threeOptions.sizes.height = window.innerHeight;

    // Update camera
    this.camera.aspect = this.aspectRatio();
    this.camera.updateProjectionMatrix();

    // Update renderer
    this.renderer.setSize(
      this.threeOptions.sizes.width,
      this.threeOptions.sizes.height
    );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    console.log("resize");
  }

  /**
   * Initializers
   */
  initialize() {
    this.initializeScene();
    this.initializeLoaders();
    this.initializeCamera();
    this.initializeTooling();
    this.initializeListeners();
    this.initializeRenderer();
  }

  initializeScene() {
    this.scene = new THREE.Scene();
    this.canvas = document.querySelector("canvas.webgl");

    this.threeOptions.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  initializeLoaders() {
    this.textureLoader = new THREE.TextureLoader();
    this.gltfLoader = new GLTFLoader();
  }

  initializeCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.aspectRatio(), 0.1, 100);
    this.camera.position.y = 1;
    this.camera.position.z = 5;
    this.scene.add(this.camera);
  }

  initializeTooling() {
    this.gui = new dat.GUI({
      width: 400
    });
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;

    this.stats = new Stats();
    let container = document.createElement("div");
    container.setAttribute("id", "stats");
    document.body.appendChild(container);
    container.appendChild(this.stats.dom);
  }

  initializeListeners() {
    window.addEventListener("resize", this.resize.bind(this));
    //window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }


  initializeRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setSize(
      this.threeOptions.sizes.width,
      this.threeOptions.sizes.height
    );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /**
   * It's a wrap!
   */
  cleanUp() {
    this.threeObjects.geos.forEach(geo => {
      geo.dispose();
    });
    this.threeObjects.mats.forEach(mat => {
      mat.dispose();
    });
    this.threeObjects.meshes.forEach(mesh => {
      this.scene.remove(mesh);
    });

    this.gui.destroy();
    var statsElement = document.getElementById("stats");
    statsElement.parentNode.removeChild(statsElement);
    cancelAnimationFrame(this.requestAnimationFrameId);
  }

  /**
   * Update
   */
  tick() {
    const elapsedTime = this.clock.getElapsedTime();
    elapsedTime;
    // Update uTime mats uniforms
    //this.firefliesMat.uniforms.uTime.value = elapsedTime;

    // Update tools
    this.stats.update();
    this.controls.update();

    // Render
    this.renderer.render(this.scene, this.camera);

    // Call tick again on the next frame
    this.requestAnimationFrameId = window.requestAnimationFrame(
      this.tick.bind(this)
    );
  }

  /**
   * Time to make things happen
   */

   onMouseMove(event){
     console.log("moving")
    const x = event.clientX;
    const y = event.clientY;
  
    gsap.to(this.scene.rotation, {
      y: gsap.utils.mapRange(0, window.innerWidth, 0.8, -0.8, x),
      x: gsap.utils.mapRange(0, window.innerHeight, -0.1, -0.4, y)
    })
    console.log(this.scene.rotation)
  }

  startMagic() {
    console.log("Let de magic happen!");
    //this.loadingElement = document.querySelector(".loading");

    this.prepareModels();
    this.setButtons();

    this.clock = new THREE.Clock();
    this.tick();
  }

    prepareModels() {
      this.skull = new ScatterModel({
        name: 'skull',
        file: '/assets/models/skull.glb',
        scene: this.scene,
        color1: 0xff0000,
        color2: 0xffff00,
        background: '#47001b',
        placeOnLoad: true,
      });

      this.horse = new ScatterModel({
        name: 'horse',
        file: '/assets/models/horse.glb',
        color1: 0x00ff00,
        color2: 0x00ffff,
        background: '#110047',
        scene: this.scene
      });

      this.text = new ScatterText({
        name: 'text',
        text: 'Some text!',
        color1: 0x41A317,
        color2: 0xBCE954,
        background: '#254117',
        scene: this.scene
      });     
    }

    setButtons() {
      const buttons = document.querySelectorAll('.button');
      buttons[0].addEventListener('click', () => {
        if(!this.skull.inTransition 
            && !this.horse.inTransition 
            && !this.text.inTransition) {
          this.skull.add();
          this.horse.remove();
          this.text.remove();
        }
      });
      buttons[1].addEventListener('click', () => {
        if(!this.skull.inTransition
            && !this.horse.inTransition
            && !this.text.inTransition) {
          this.skull.remove();
          this.horse.add();
          this.text.remove();
        }
      });
      buttons[2].addEventListener('click', () => {
        if(!this.skull.inTransition
            && !this.horse.inTransition
            && !this.text.inTransition) {
          this.skull.remove();
          this.horse.remove();
          this.text.add();
        }
      });
    }
}