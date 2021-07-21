import * as dat from "dat.gui";
import Guify from 'guify';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

import terrainVertexShader from "../shaders/terrain/vertex.glsl";
import terrainFragmentShader from "../shaders/terrain/fragment.glsl";

export default class TerrainScene {
  constructor() {
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

    // TODO
    /* this.firefliesMat.uniforms.uPixelRatio.value = Math.min(
      window.devicePixelRatio,
      2
    ); */
  }

  /**
   * Initializers
   */
  initialize(options) {
    this.threeOptions.clearColor = options.backgroundColor;

    this.initializeScene();
    //this.initializeLoaders();
    this.initializeCamera();
    this.initializeTooling();
    this.initializeRenderer();
  }

  initializeScene() {
    this.loadingElement = document.querySelector(".loading");
    this.loadingElement.classList.remove("ended");

    this.scene = new THREE.Scene();
    this.canvas = document.querySelector("canvas.webgl");

    this.threeOptions.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    window.addEventListener("resize", this.resize.bind(this));
  }

  initializeLoaders() {
    this.loadingManager = new THREE.LoadingManager(
      () => {
        this.loadingElement.classList.add("ended");
      },
      (itemUrl, itemsLoaded, itemsTotal) => {
        //const progressRatio = itemsLoaded / itemsTotal;
        itemUrl, itemsLoaded, itemsTotal;
      },
      () => {
        console.log("error");
      }
    );

    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.gltfLoader = new GLTFLoader(this.loadingManager);
  }

  initializeTooling() {
    this.guify = new Guify({
      title: "Some Title",
      align: "right",
      theme: "dark",
      barMode: "none"
    });
    this.gui = new dat.GUI({
      width: 400
    });
    this.controls = new OrbitControls(this.camera, this.canvas);
    /* this.controls.enableDamping = true;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10; // Infinity;
    this.controls.maxPolarAngle = Math.PI/2;
    this.controls.enablePan = false; */

    this.stats = new Stats();
    let container = document.createElement("div");
    container.setAttribute("id", "stats");
    document.body.appendChild(container);
    container.appendChild(this.stats.dom);
  }

  initializeCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.aspectRatio(), 0.1, 100);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 5;
    this.scene.add(this.camera);
  }

  initializeRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.setSize(
      this.threeOptions.sizes.width,
      this.threeOptions.sizes.height
    );
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.setClearColor(this.threeOptions.clearColor);
    this.gui
      .addColor(this.threeOptions, "clearColor")
      .name("backgroundColor")
      .onChange(() => {
        this.renderer.setClearColor(this.threeOptions.clearColor);
      });
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
    //const elapsedTime = this.clock.getElapsedTime();

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

  startMagic() {
    this.loadScene();

    this.clock = new THREE.Clock();
    this.tick();
  }

  loadScene() {
    this.loadingElement.classList.add("ended");

    /* 
    / TERRAIN
    */
    const terrain = {};

    terrain.texture = {};
    terrain.texture.linesCount = 5;
    terrain.texture.width = 32;
    terrain.texture.height = 128;
    terrain.texture.canvas = document.createElement("canvas");
    terrain.texture.canvas.width = terrain.texture.width;
    terrain.texture.canvas.height = terrain.texture.height;
    terrain.texture.canvas.style.position = "fixed";
    terrain.texture.canvas.style.top = 0;
    terrain.texture.canvas.style.left = 0;
    terrain.texture.canvas.style.zIndex = 1;
    document.body.append(terrain.texture.canvas);

    terrain.texture.context = terrain.texture.canvas.getContext("2d");

    terrain.texture.instance = new THREE.CanvasTexture(terrain.texture.canvas);
    terrain.texture.instance.wrapS = THREE.RepeatWrapping;
    terrain.texture.instance.wrapT = THREE.RepeatWrapping;

    terrain.texture.update = () => {
      terrain.texture.context.clearRect(0, 0, terrain.texture.width, terrain.texture.height);
      terrain.texture.context.fillStyle = "red";
      terrain.texture.context.fillRect(0, Math.round(terrain.texture.width * 0), terrain.texture.width, 4);
      terrain.texture.context.fillStyle = "blue";
      terrain.texture.context.fillRect(0, Math.round(terrain.texture.width * 0.45), terrain.texture.width, 10);
      terrain.texture.context.fillStyle = "green";
      terrain.texture.context.fillRect(0, Math.round(terrain.texture.width * 0.9), terrain.texture.width, 4);  
    };

    terrain.texture.update();


    terrain.geo = new THREE.PlaneGeometry(1, 1, 1000, 1000);
    terrain.geo.rotateX(-Math.PI * 0.5);
    terrain.mat = new THREE.ShaderMaterial({
      vertexShader: terrainVertexShader,
      fragmentShader: terrainFragmentShader,
      transparent: true,
      side: THREE.DoubleSide, //needed?
      blending: THREE.AdditiveBlending,
      uniforms: {
        uElevation: {value: 2},
        uTexture: {value: terrain.texture.instance}
      }
    });
    terrain.mesh = new THREE.Mesh(terrain.geo, terrain.mat);
    terrain.mesh.scale.set(10, 10, 10);
    this.scene.add(terrain.mesh);

    this.guify.Register({
      type: "range",
      object: terrain.mat.uniforms.uElevation,
      property: "value",
      label: "uElevation",
      min: 0,
      max: 5,
      step: 0.001
    })
  }
}
