import * as dat from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import Stats from "three/examples/jsm/libs/stats.module.js";

export default class DigiConfScene {
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
    this.firefliesMat.uniforms.uPixelRatio.value = Math.min(
      window.devicePixelRatio,
      2
    );
  }

  /**
   * Initializers
   */
  initialize(options) {
    this.threeOptions.clearColor = options.backgroundColor;

    this.initializeScene();
    this.initializeLoaders();
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
        this.threeOptions.ready = true;
      },
      (itemUrl, itemsLoaded, itemsTotal) => {
          //const progressRatio = itemsLoaded / itemsTotal;
          itemUrl, itemsLoaded, itemsTotal
      },
      (e) => {
          console.log(e);
      }
    );

    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/assets/draco/');
    this.gltfLoader.setDRACOLoader(this.dracoLoader);

  }

  initializeTooling() {
    this.gui = new dat.GUI({
      width: 400
    });
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10; // Infinity;
    this.controls.maxPolarAngle = Math.PI/2;
    this.controls.enablePan = false;

    this.stats = new Stats();
    let container = document.createElement("div");
    container.setAttribute("id", "stats");
    document.body.appendChild(container);
    container.appendChild(this.stats.dom);
  }

  initializeCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.aspectRatio(), 0.1, 100);
    this.camera.position.x = 2;
    this.camera.position.y = 3;
    this.camera.position.z = 1;
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

    if(this.threeOptions.ready){
        // Update uTime mats uniforms
        this.material.uniforms.uTime.value = elapsedTime;
    }

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
    //this.prepareSceneMaterials();
    this.loadModel();
  }

  loadModel() {
    this.gltfLoader.load("/assets/models/city.glb", gltf => {
        const city = gltf.scene.children[0];

        this.threeOptions.city = {};
        this.threeOptions.city.buildingsColor = 0x444444;
        this.threeOptions.city.waveColor = 0xffffff;

        this.material = new THREE.ShaderMaterial({
            wireframe: true,
            uniforms: {
              uTime: { value: 0 },
              uCityColor: { value: new THREE.Color(this.threeOptions.city.buildingsColor) },
              uWaveColor: { value: new THREE.Color(this.threeOptions.city.waveColor) },
              uWaveLive: { value: 3.5 },
              uWaveSpeedMultiplier: { value: 1.5 },
              uWaveSlimMultiplier: { value: 3.0 }
              
            },
            side: THREE.DoubleSide,
            vertexShader: `
                uniform float uTime;

                uniform vec3 uCityColor;
                uniform vec3 uWaveColor;
                uniform float uWaveLive;
                uniform float uWaveSpeedMultiplier;
                uniform float uWaveSlimMultiplier; // The higher the slimest

                varying vec3 vColor;

                void main(){
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    float distanceToCenter = length(modelPosition.xz);
                
                    vec4 viewPosition = viewMatrix * modelPosition;
                    vec4 projectedPosition = projectionMatrix * viewPosition;
                    gl_Position = projectedPosition;

                    // Wave generation
                    float waveStartPosition = mod(uTime * uWaveSpeedMultiplier, uWaveLive);
                    float waveStrength = 1.0 - (waveStartPosition - distanceToCenter) * 10.0/uWaveSlimMultiplier;
                    waveStrength = clamp(waveStrength, 0.0, 1.0);
                    if(distanceToCenter > waveStartPosition){ waveStrength = 0.0; }

                    // Color assignment
                    vec3 cityColor = vec3(1.0, 1.0, 1.0);
                    vColor = mix(uCityColor, uWaveColor, waveStrength);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;

                void main(){  
                    gl_FragColor = vec4(vColor, 1.0);
                }
            `
          })
        city.material = this.material;
        
        this.scene.add(city);

        this.gui.add(this.material, "wireframe")
        this.gui.addColor(this.threeOptions.city, 'buildingsColor')
            .onChange(() => {
                this.material.uniforms.uCityColor.value.set(
                    this.threeOptions.city.buildingsColor
                );
            });
        this.gui.addColor(this.threeOptions.city, 'waveColor')
            .onChange(() => {
                this.material.uniforms.uWaveColor.value.set(
                    this.threeOptions.city.waveColor
                );
            });
        this.gui.add(this.material.uniforms.uWaveLive, "value")
            .min(0.5).max(10.0).step(0.1)
            .name("Wave Live Span")
        this.gui.add(this.material.uniforms.uWaveSpeedMultiplier, "value")
            .min(0.5).max(10.0).step(0.1)
            .name("Wave Speed")
        this.gui.add(this.material.uniforms.uWaveSlimMultiplier, "value")
            .min(1.0).max(25.0).step(1.0)
            .name("Wave Area")
    });
  }
}
