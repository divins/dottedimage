import * as dat from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

//import firefliesVertexShader from "../shaders/fireflies/vertex.glsl";

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
    this.camera.position.x = 4;
    this.camera.position.y = 2;
    this.camera.position.z = 6;
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
    const boxGeo = new THREE.BoxGeometry(2, 2, 2);
    const boxMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00
    });
    const boxMesh = new THREE.Mesh(boxGeo, boxMaterial);
    this.scene.add(boxMesh);
  }
}
