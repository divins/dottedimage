import * as dat from "dat.gui";
import Guify from 'guify';
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

import terrainVertexShader from "../shaders/terrain/vertex.glsl";
import terrainFragmentShader from "../shaders/terrain/fragment.glsl";

import PostProcessingComposer from './PostProcessingComposer';

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

     // Update composer
     this.postProcessingComposer.resize(
      this.threeOptions.sizes.width,
      this.threeOptions.sizes.height
     );
     // TODO: We still need to update bokeh sizes!
     // bokehPass.renderTargetDepth.width = sizes.width * sizes.pixelRatio
     // bokehPass.renderTargetDepth.height = sizes.height * sizes.pixelRatio

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
    const elapsedTime = this.clock.getElapsedTime();

    // Update uTime mats uniforms
    this.terrain.mat.uniforms.uTime.value = elapsedTime;

    // Update tools
    this.stats.update();
    this.controls.update();

    // Render
    //this.renderer.render(this.scene, this.camera);
    this.postProcessingComposer.effectComposer.render();

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
    this.prepareEffectComposer();
    this.addPasses();

    this.clock = new THREE.Clock();
    this.tick();
  }

  loadScene() {
    this.loadingElement.classList.add("ended");

    /* 
    / TERRAIN
    */
    this.terrain = {};

    // Texture
    this.terrain.texture = {};
    this.terrain.texture.linesCount = 5;
    this.terrain.texture.bigLineWidth = 0.04;
    this.terrain.texture.smallLineWidth = 0.01;
    this.terrain.texture.smallLineAlpha = 0.5;
    this.terrain.texture.width = 32;
    this.terrain.texture.height = 128;
    this.terrain.texture.canvas = document.createElement("canvas");
    this.terrain.texture.canvas.width = this.terrain.texture.width;
    this.terrain.texture.canvas.height = this.terrain.texture.height;
    this.terrain.texture.canvas.style.position = "fixed";
    this.terrain.texture.canvas.style.top = 0;
    this.terrain.texture.canvas.style.left = 0;
    this.terrain.texture.canvas.style.zIndex = 1;
    document.body.append(this.terrain.texture.canvas);

    this.terrain.texture.context = this.terrain.texture.canvas.getContext("2d");

    this.terrain.texture.instance = new THREE.CanvasTexture(this.terrain.texture.canvas);
    this.terrain.texture.instance.wrapS = THREE.RepeatWrapping;
    this.terrain.texture.instance.wrapT = THREE.RepeatWrapping;
    //terrain.texture.instance.magFilter = THREE.NearestFilter; // TODO: Don't like it...

    this.terrain.texture.update = () => {
      this.terrain.texture.context.clearRect(0, 0, this.terrain.texture.width, this.terrain.texture.height);
      this.terrain.texture.context.fillStyle = "#ffffff";

      // Thicker first line
      this.terrain.texture.context.globalAlpha = 1;
      const actualBigLineWidth = Math.round(this.terrain.texture.height * this.terrain.texture.bigLineWidth);
      this.terrain.texture.context.fillRect(
        0,
        0,
        this.terrain.texture.width,
        actualBigLineWidth
      );

      // Thiner lines
      const actualSmallLineWidth = Math.round(this.terrain.texture.height * this.terrain.texture.smallLineWidth);
      const smallLinesCount = this.terrain.texture.linesCount - 1;
      for (let i = 0; i < smallLinesCount; i++) {
        this.terrain.texture.context.globalAlpha = this.terrain.texture.smallLineAlpha;
        this.terrain.texture.context.fillRect(
          0,
          actualBigLineWidth + Math.round((this.terrain.texture.height - actualBigLineWidth) / this.terrain.texture.linesCount * (i + 1)),
          this.terrain.texture.width,
          actualSmallLineWidth
        );
      }

      // Update texture instance
      this.terrain.texture.instance.needsUpdate = true;
    };

    this.terrain.texture.update();

    this.guify.Register({
      type: "range", label: "Lines Count",
      object: this.terrain.texture,
      property: "linesCount",
      min: 1, max: 10, step: 1,
      onChange: this.terrain.texture.update
    });
    this.guify.Register({
      type: "range", label: "Big Line Width",
      object: this.terrain.texture,
      property: "bigLineWidth",
      min: 0.01, max: 0.4, step: 0.01,
      onChange: this.terrain.texture.update
    });
    this.guify.Register({
      type: "range", label: "Small Line Width",
      object: this.terrain.texture,
      property: "smallLineWidth",
      min: 0.01, max: 0.1, step: 0.01,
      onChange: this.terrain.texture.update
    });
    this.guify.Register({
      type: "range", label: "Small Line Alpha",
      object: this.terrain.texture,
      property: "smallLineAlpha",
      min: 0.05, max: 1, step: 0.01,
      onChange: this.terrain.texture.update
    });

    // Preparing mesh
    this.terrain.geo = new THREE.PlaneGeometry(1, 1, 1000, 1000);
    this.terrain.geo.rotateX(-Math.PI * 0.5);
    this.terrain.mat = new THREE.ShaderMaterial({
      vertexShader: terrainVertexShader,
      fragmentShader: terrainFragmentShader,
      transparent: true,
      side: THREE.DoubleSide, //needed?
      blending: THREE.AdditiveBlending,
      uniforms: {
        uElevation: {value: 2},
        uTexture: {value: this.terrain.texture.instance},
        uTextureMultiplier: {value: 10},
        uTime: {value: 0}
      }
    });
    this.terrain.mesh = new THREE.Mesh(this.terrain.geo, this.terrain.mat);
    this.terrain.mesh.scale.set(10, 10, 10);
    this.scene.add(this.terrain.mesh);

    this.guify.Register({
      type: "range", label: "uElevation",
      object: this.terrain.mat.uniforms.uElevation,
      property: "value",
      min: 0, max: 5, step: 0.001
    });
    this.guify.Register({
      type: "range", label: "uTextureMultiplier",
      object: this.terrain.mat.uniforms.uTextureMultiplier,
      property: "value",
      min: 0, max: 50, step: 1
    });
  }

  prepareEffectComposer() {
    this.postProcessingComposer = new PostProcessingComposer({
      scene: this.scene,
      renderer: this.renderer,
      sizes: this.threeOptions.sizes,
      camera: this.camera
    });
  }

  addPasses() {
    this.postProcessingComposer.addBokehPass(this.gui, true);

    this.postProcessingComposer.addSMAAPass(this.renderer);
  }

}
