import * as dat from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { gsap } from "gsap";
import { Raycaster } from "three";

import PostProcessingComposer from './PostProcessingComposer';

export default class PortalScene {
  constructor() {
    this.threeOptions = {};
    this.threeState = {};
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

  updateAllMaterials() {
    this.scene.traverse(child => {
      if (
        child instanceof THREE.Mesh &&
        child.material instanceof THREE.MeshStandardMaterial
      ) {
        // child.material.envMap = environmentMap
        child.material.envMapIntensity = this.threeOptions.envMapIntensity;
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
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
    this.postProcessingComposer.effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.postProcessingComposer.effectComposer.setSize(
      this.threeOptions.sizes.width,
      this.threeOptions.sizes.height
    );
  }

  /**
   * Initializers
   */
  initialize() {
    this.initializeScene();
    this.initializeOverlay();
    this.initializeLoaders();
    this.initializeCamera();
    this.initializeTooling();
    this.initializeRenderer();
    this.initializeListeners();
  }

  initializeScene() {  
    this.scene = new THREE.Scene();
    this.canvas = document.querySelector("canvas.webgl");
    this.loadingBarElement = document.querySelector(".loading-bar");

    this.threeOptions.sizes = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
  
  initializeListeners() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  initializeOverlay() {
    this.threeObjects.overlay = {};
    this.threeObjects.overlay.geo = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
    this.threeObjects.overlay.mat = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        uOpacity: { value: 1.0 }
      },
      vertexShader: `
        void main(){
            // Here we are using the camera position, and everything else, but
            // we want to just draw a plane in the middle of the screen!
            /* vec4 modelPosition = modelMatrix * vec4(position, 1.0);
            vec4 viewPosition = viewMatrix * modelPosition;
            vec4 projectedPosition = projectionMatrix * viewPosition;
            gl_Position = projectedPosition; */
            gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uOpacity;
        void main() {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uOpacity);
        }
      `
    });

    const overlay = new THREE.Mesh(
      this.threeObjects.overlay.geo,
      this.threeObjects.overlay.mat
    );
    this.scene.add(overlay);      
  }

  initializeLoaders() {
    this.loadingManager = new THREE.LoadingManager(
        () => {
            console.log("loaded");
            // With GSAP
            gsap.delayedCall(0.5, () => {
              gsap.to(this.threeObjects.overlay.mat.uniforms.uOpacity, {
                  duration: 3.0,
                  delay: 1.0,
                  value: 0.0,
                  onComplete: () => {
                    this.threeState.ready = true;
                  }
              });
              this.loadingBarElement.classList.add("ended");
              this.loadingBarElement.style.transform = "";
            });
        },
        (itemUrl, itemsLoaded, itemsTotal) => {
            //const progressRatio = itemsLoaded / itemsTotal;
            this.loadingBarElement.style.transform = `scaleX(${itemsLoaded /
            itemsTotal})`;
        },
        () => {
            console.log("error");
        }
    );
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager);
    this.textureLoader = new THREE.TextureLoader();
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

    this.raycaster = new Raycaster();
  }

  initializeCamera() {
    this.camera = new THREE.PerspectiveCamera(45, this.aspectRatio(), 0.1, 100);
    this.camera.position.set(4, 1, -4);
    this.scene.add(this.camera);
  }

  initializeRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.physicallyCorrectLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1.5;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
    // this.firefliesMat.uniforms.uTime.value = elapsedTime;

    // Update tools
    this.stats.update();
    this.controls.update();

    this.updatePointsPositions();

    // Render
    //renderer.render(scene, camera)
    //this.effectComposer.render();
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
    console.log("Let de magic happen!");
    this.loadEnvironmentMap();
    this.loadModel();
    this.setLights();
    this.addPoints();
    this.prepareEffectComposer();
    this.addPasses();

    this.clock = new THREE.Clock();
    this.tick();
  }

  loadEnvironmentMap() {
    const environmentMap = this.cubeTextureLoader.load([
        require("@/assets/textures/environmentMaps/0/px.jpg"),
        require("@/assets/textures/environmentMaps/0/nx.jpg"),
        require("@/assets/textures/environmentMaps/0/py.jpg"),
        require("@/assets/textures/environmentMaps/0/ny.jpg"),
        require("@/assets/textures/environmentMaps/0/pz.jpg"),
        require("@/assets/textures/environmentMaps/0/nz.jpg")
    ]);

    environmentMap.encoding = THREE.sRGBEncoding;

    this.scene.background = environmentMap;
    this.scene.environment = environmentMap;

    this.threeOptions.envMapIntensity = 5;      
  }

  loadModel() {
    this.gltfLoader.load(
        "/assets/models/DamagedHelmet/glTF/DamagedHelmet.gltf",
        gltf => {
            gltf.scene.scale.set(2, 2, 2);
            gltf.scene.rotation.y = Math.PI * 0.5;
            this.scene.add(gltf.scene);

            this.updateAllMaterials();
        }
    );
  }

  setLights() {
    const directionalLight = new THREE.DirectionalLight("#ffffff", 3);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.far = 15;
    directionalLight.shadow.mapSize.set(1024, 1024);
    directionalLight.shadow.normalBias = 0.05;
    directionalLight.position.set(0.25, 3, -2.25);
    this.scene.add(directionalLight);
  }

  addPoints() {
    this.points = [];
    this.points.push({
      position: new THREE.Vector3(1.55, 0.3, -0.6),
      element: document.querySelector(".point-0")
    });
    this.points.push({
      //position: new THREE.Vector3(0.5, 0.8, -1.6),
      position: new THREE.Vector3(-1.6, 0.4, 2.4),
      element: document.querySelector(".point-1")
    });
    this.points.push({
      position: new THREE.Vector3(1.6, -1.3, -0.7),
      element: document.querySelector(".point-2")
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
    this.postProcessingComposer.addDotScreenPass(this.gui);
    this.postProcessingComposer.addGlitchPass(this.gui);
    this.postProcessingComposer.addDisplacementPass(this.gui);
    this.postProcessingComposer.addFuturisticPass(this.gui, this.textureLoader);
    this.postProcessingComposer.addRGBShiftPass(this.gui);
    this.postProcessingComposer.addUnrealBloomPass(this.gui);
    this.postProcessingComposer.addTintPass(this.gui);
    this.postProcessingComposer.addPixelPass(this.gui);
    this.postProcessingComposer.addCRTPass(this.gui);

    this.postProcessingComposer.addSMAAPass(this.renderer);
  }

  updatePointsPositions() {
    if (this.threeState.ready) {
      for (const point of this.points) {
        const screenPosition = point.position.clone();
        screenPosition.project(this.camera);

        this.raycaster.setFromCamera(screenPosition, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true); // true for recursive
        intersects;
        if (intersects.length === 0) {
          point.element.classList.add("visible");
        } else {
          const intersectionDistance = intersects[0].distance;
          const pointDistance = point.position.distanceTo(this.camera.position);
          if (intersectionDistance < pointDistance) {
            point.element.classList.remove("visible");
          } else {
            point.element.classList.add("visible");
          }
        }

        //console.log(screenPosition)
        const translateX = screenPosition.x * this.threeOptions.sizes.width * 0.5;
        const translateY = -screenPosition.y * this.threeOptions.sizes.height * 0.5;

        //point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
        point.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
      }
    }
  }
}