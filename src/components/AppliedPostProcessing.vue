<template>
  <canvas class="webgl"></canvas>
  <div class="loading-bar"></div>
  <a class="demo repo"
    :title="links.repo.title"
    :href="links.repo.href"
    target="_blank">
    {{ links.repo.label }}
  </a>
  <p class="disclaimer">
    This demo has been created following a <a :href="links.brunos.href" :title="links.brunos.title" target="_blank">{{ links.brunos.label }}</a> tutorial. 
    Give it a <a :href="links.tutorial.href" :title="links.tutorial.title" target="_blank">try</a>!
  </p>
</template>

<script>
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
//import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module.js";

let scene = null;
let camera = null;
let renderer = null;
let controls = null;
const clock = new THREE.Clock();

let requestAnimationFrameId = null;

/**
 * Base
 */
// Debug
const debugObject = {};

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

export default {
  name: "Galaxy",
  props: {
    msg: String
  },
  data() {
    return {
      links: {
        repo: {
          title: "View source code for Post Processing",
          label: "< >",
          href: "https://github.com/divins/dottedimage/blob/master/src/components/AppliedPostProcessing.vue"
        },
        tutorial: {
          title: "See followed tutorial",
          label: "¿?",
          href: "https://threejs-journey.xyz"
        },
        brunos: {
          title: "Bruno Simon website",
          label: "Bruno Simon",
          href: "https://bruno-simon.com/"
        }
      },
      parameters: {
        // nothing
      },
      elements: {
        gui: null,
        stats: new Stats(),
        webglCanvas: null,
        loadingBarElement: null,
        overlay: {
          geo: null,
          mat: null
        }
      }
    };
  },
  methods: {
    updateAllMaterials: () => {
      scene.traverse( (child) =>
      {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          // child.material.envMap = environmentMap
          child.material.envMapIntensity = debugObject.envMapIntensity;
          child.material.needsUpdate = true;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      })
    },
    initScene: function() {
      this.elements.loadingBarElement = document.querySelector(".loading-bar");

      /**
       * Loaders
       */
      const loadingManager = new THREE.LoadingManager(
        () => {
          console.log("loaded");
          // Native JS
          /* window.setTimeout(
              () => {
                  gsap.to(overlayMat.uniforms.uOpacity, { duration: 3.0, delay: 1.0, value: 0.0 });
                  loadingBarElement.classList.add("ended");
                  loadingBarElement.style.transform = "";
              },
              500
          ); */
          // With GSAP
          gsap.delayedCall(
            0.5,
            () => {
              gsap.to(
                this.elements.overlay.mat.uniforms.uOpacity,
                { duration: 3.0, delay: 1.0, value: 0.0 }
              );
              this.elements.loadingBarElement.classList.add("ended");
              this.elements.loadingBarElement.style.transform = "";
            }
          );
        },
        (itemUrl, itemsLoaded, itemsTotal) => {
          //const progressRatio = itemsLoaded / itemsTotal;
          this.elements.loadingBarElement.style.transform = `scaleX(${itemsLoaded / itemsTotal})`;
        },
        () => {
          console.log("error");
        }
      );
      const gltfLoader = new GLTFLoader(loadingManager);
      const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);


      /**
       * Overlay
       */
      this.elements.overlay.geo = new THREE.PlaneBufferGeometry(2, 2, 1, 1);
      this.elements.overlay.mat = new THREE.ShaderMaterial({
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

      const overlay = new THREE.Mesh(this.elements.overlay.geo, this.elements.overlay.mat);
      scene.add(overlay);

      /**
       * Environment map
       */
      const environmentMap = cubeTextureLoader.load([
        require("@/assets/textures/environmentMaps/0/px.jpg"),
        require("@/assets/textures/environmentMaps/0/nx.jpg"),
        require("@/assets/textures/environmentMaps/0/py.jpg"),
        require("@/assets/textures/environmentMaps/0/ny.jpg"),
        require("@/assets/textures/environmentMaps/0/pz.jpg"),
        require("@/assets/textures/environmentMaps/0/nz.jpg")
      ]);

      environmentMap.encoding = THREE.sRGBEncoding;

      scene.background = environmentMap;
      scene.environment = environmentMap;

      debugObject.envMapIntensity = 5;

      /**
       * Models
       */
      gltfLoader.load(
         "/assets/models/FlightHelmet/glTF/FlightHelmet.gltf",
        (gltf) => {
          gltf.scene.scale.set(10, 10, 10);
          gltf.scene.position.set(0, -4, 0);
          gltf.scene.rotation.y = Math.PI * 0.5;
          scene.add(gltf.scene);

          this.updateAllMaterials();
        }
      );

      /**
       * Lights
       */
      const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
      directionalLight.castShadow = true;
      directionalLight.shadow.camera.far = 15;
      directionalLight.shadow.mapSize.set(1024, 1024);
      directionalLight.shadow.normalBias = 0.05;
      directionalLight.position.set(0.25, 3, - 2.25);
      scene.add(directionalLight);

    },
    initCanvas: function() {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      this.elements.webglCanvas = document.querySelector("canvas.webgl");
      scene = new THREE.Scene();

      // Base camera
      camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
      camera.position.set(4, 1, - 4);
      scene.add(camera);

      // Controls
      controls = new OrbitControls(camera, this.elements.webglCanvas);
      controls.enableDamping = true;

      /**
       * Renderer
       */
      renderer = new THREE.WebGLRenderer({
        canvas: this.elements.webglCanvas,
        antialias: true
      });

      renderer.physicallyCorrectLights = true;
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ReinhardToneMapping;
      renderer.toneMappingExposure = 3;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      let container = document.createElement("div");
      container.setAttribute("id", "stats");
      document.body.appendChild(container);
      container.appendChild(this.elements.stats.dom);
    },
    tick: function() {
      const elapsedTime = clock.getElapsedTime();
      elapsedTime;

      this.elements.stats.update();
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrameId = requestAnimationFrame(this.tick);
    },
    cleanAll: function() {
      /*if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
      }*/

      this.elements.gui.destroy();
      var statsElement = document.getElementById("stats");
      statsElement.parentNode.removeChild(statsElement);
      cancelAnimationFrame(requestAnimationFrameId);
    },
  },
  created() {
    console.log("Created");
    //this.setGuiControls();
  },
  mounted() {
    console.log("Mounted");
    this.initCanvas();
    this.initScene();
    this.tick();
  },
  beforeUnmount() {
    console.log("Before unmount");
    this.cleanAll();
  }
};
</script>

<style scoped>
.webgl {
  position: fixed;
  top: 0;
  left: 0;
  outline: none;
}
p.disclaimer {
  color: #eee;
}
.loading-bar {
    position: absolute;
    top: 50%;
    width: 100%;
    height: 2px;
    background-color: white;
    transform: scaleX(0);
    transform-origin: top left;
    transition: transform 0.5s;
    will-change: transform;
}

.loading-bar.ended {
    transform: scaleX(0);
    transform-origin: top right;
    transition: transform 1.5s ease-in-out;
}
</style>
