<template>
  <canvas class="webgl"></canvas>
  <div class="loading-bar"></div>
  <div class="point point-0">
    <div class="label">1</div>
    <div class="description">Front and top screen with HUD aggregating terrain and battle informations.</div>
  </div>
  <div class="point point-1">
    <div class="label">2</div>
    <div class="description">Ventilation with air purifier and detection of environment toxicity.</div>
  </div>
  <div class="point point-2">
    <div class="label">3</div>
    <div class="description">Cameras supporting night vision and heat vision with automatic adjustment.</div>
  </div>

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
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { Raycaster } from "three";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { PixelShader } from 'three/examples/jsm/shaders/PixelShader.js';

let scene = null;
let camera = null;
let renderer = null;
let controls = null;
let effectComposer = null;
let renderPass = null;
let dotScreenPass = null;

let requestAnimationFrameId = null;

const raycaster = new Raycaster();

let sceneReady = false;

const stats = new Stats();
let points = [];
const setPoints = () => {
    points = [
      {
        position: new THREE.Vector3(1.55, 0.3, -0.6),
        element: document.querySelector('.point-0')
    },
    {
        //position: new THREE.Vector3(0.5, 0.8, -1.6),
        position: new THREE.Vector3(-1.6, 0.4, 2.4),
        element: document.querySelector('.point-1')
    },
    {
        position: new THREE.Vector3(1.6, -1.3, -0.7),
        element: document.querySelector('.point-2')
    }
    ]
}

const tick = function() {
      controls.update();

      if (sceneReady) {
        for (const point of points) {
          const screenPosition = point.position.clone();
          screenPosition.project(camera);
          
          raycaster.setFromCamera(screenPosition, camera);
          const intersects = raycaster.intersectObjects(scene.children, true); // true for recursive
          if (intersects.length === 0) {
            point.element.classList.add("visible");
          } else {
            const intersectionDistance = intersects[0].distance;
            const pointDistance = point.position.distanceTo(camera.position);
            if (intersectionDistance < pointDistance) {
              point.element.classList.remove("visible");
            } else {
              point.element.classList.add("visible");
            }
          }
  
          //console.log(screenPosition)
          const translateX = screenPosition.x * sizes.width * 0.5;
          const translateY = -screenPosition.y * sizes.height * 0.5;
  
          //point.element.style.transform = `translateX(${translateX}px) translateY(${translateY}px)`;
          point.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
        }
      }

      // Render
      //renderer.render(scene, camera)
      effectComposer.render();
      requestAnimationFrameId = requestAnimationFrame(tick);

      stats.update();
    }

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

  // Update composer
  effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  effectComposer.setSize(sizes.width, sizes.height);
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
        //stats: new Stats(),
        webglCanvas: null,
        loadingBarElement: null,
        overlay: {
          geo: null,
          mat: null
        }
      },
      sceneInfo: {
        ready: false
      },
      points: []
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
              sceneReady = true;
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
      const textureLoader = new THREE.TextureLoader();
      raycaster
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
         "/assets/models/DamagedHelmet/glTF/DamagedHelmet.gltf",
        (gltf) => {
          //gltf.scene.scale.set(10, 10, 10);
          //gltf.scene.position.set(0, -4, 0);
          gltf.scene.scale.set(2, 2, 2);
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

      /**
       * Post processing
       */
      effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      effectComposer.setSize(sizes.width, sizes.height);

      // Passes
      renderPass = new RenderPass(scene, camera);
      effectComposer.addPass(renderPass);

      dotScreenPass = new DotScreenPass();
      dotScreenPass.enabled = false;
      effectComposer.addPass(dotScreenPass);
      this.elements.gui.add(dotScreenPass, 'enabled').name('Dotted Screen')

      const glitchPass = new GlitchPass();
      //glitchPass.goWild = true;
      glitchPass.enabled = false;
      effectComposer.addPass(glitchPass);
      this.elements.gui.add(glitchPass, 'enabled').name('Glitch');

      const rgbShiftPass = new ShaderPass(RGBShiftShader);
      rgbShiftPass.enabled = false;
      effectComposer.addPass(rgbShiftPass);
      this.elements.gui.add(rgbShiftPass, 'enabled').name('RGB Shift');

      const unrealBloomPass = new UnrealBloomPass();
      unrealBloomPass.enabled = false;
      effectComposer.addPass(unrealBloomPass);
      unrealBloomPass.strength = 0.3;
      unrealBloomPass.radius = 1;
      unrealBloomPass.threshold = 0.6;
      const unrealBloomFolder = this.elements.gui.addFolder("Unreal Bloom");
      unrealBloomFolder.add(unrealBloomPass, 'enabled').name('Unreal Bloom');
      unrealBloomFolder.add(unrealBloomPass, 'strength').min(0).max(2).step(0.001);
      unrealBloomFolder.add(unrealBloomPass, 'radius').min(0).max(2).step(0.001);
      unrealBloomFolder.add(unrealBloomPass, 'threshold').min(0).max(1).step(0.001);

      // Tint pass
      const TintShader = {
        uniforms: {
          tDiffuse: { value: null },
          uTint: { value: null }
        },
        vertexShader: `
          varying vec2 vUv;
          void main()
          {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUv = uv;
          }
        `,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          uniform vec3 uTint;
          varying vec2 vUv;
          void main()
          {
            vec4 color = texture2D(tDiffuse, vUv);
            color.rgb += uTint;
            gl_FragColor = color;
          }
        `
      };
      const tintPass = new ShaderPass(TintShader);
      //tintPass.material.uniforms.uTint.value = new THREE.Color(0x00000)
      tintPass.material.uniforms.uTint.value = new THREE.Vector3();
      effectComposer.addPass(tintPass);

      const tintFolder = this.elements.gui.addFolder("Tint");
      tintFolder.add(tintPass, 'enabled').name('Tint Change');
      tintFolder.add(tintPass.material.uniforms.uTint.value, 'x')
        .min(- 1).max(1).step(0.001)
        .name('red');
      tintFolder.add(tintPass.material.uniforms.uTint.value, 'y')
        .min(- 1).max(1).step(0.001)
        .name('green');
      tintFolder.add(tintPass.material.uniforms.uTint.value, 'z')
        .min(- 1).max(1).step(0.001)
        .name('blue');

      // Displacement pass
      const DisplacementShader = {
        uniforms: {
          tDiffuse: { value: null },
          uTime: { value: 0.0 }
        },
        vertexShader: `
          varying vec2 vUv;
          void main()
          {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUv = uv;
          }
        `,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          uniform float uTime;
          varying vec2 vUv;
          void main()
          {
            vec2 newUv = vec2(
              vUv.x,
              vUv.y + sin(vUv.x * 10.0 + uTime) * 0.1
            );
            vec4 color = texture2D(tDiffuse, newUv);
            gl_FragColor = color;
          }
        `
      };
      const displacementPass = new ShaderPass(DisplacementShader);
      displacementPass.enabled = false;
      effectComposer.addPass(displacementPass);
      this.elements.gui.add(displacementPass, 'enabled').name('Displacement');

      // Futuristic pass
      const FuturisticShader = {
        uniforms: {
          tDiffuse: { value: null },
          uNormalMap: { value: null }
        },
        vertexShader: `
          varying vec2 vUv;
          void main()
          {
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
              vUv = uv;
          }
        `,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          uniform sampler2D uNormalMap;
          varying vec2 vUv;
          void main()
          {
              /* vec4 normalMapColor = texture2D(uNormalMap, vUv);
              gl_FragColor = normalMapColor; */
              vec3 normalColor = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
              vec2 newUv = vUv + normalColor.xy * 0.1;
              vec4 color = texture2D(tDiffuse, newUv);
              vec3 lightDirection = normalize(vec3(-1.0, 1.0, 0.0));
              float lightness = dot(normalColor, lightDirection);
              //gl_FragColor = vec4(vec3(lightness), 1.0);
              lightness = clamp(lightness, 0.0, 1.0);
              color.rgb += lightness * 2.0;
              gl_FragColor = color;
          }
        `
      };
      const futuristicPass = new ShaderPass(FuturisticShader);
      futuristicPass.enabled = false;
      futuristicPass.material.uniforms.uNormalMap.value = textureLoader.load(require("@/assets/textures/interfaceNormalMap.png"));
      effectComposer.addPass(futuristicPass);
      this.elements.gui.add(futuristicPass, 'enabled').name('Futuristic Frame')

      const pixelPass = new ShaderPass( PixelShader );
      pixelPass.uniforms[ "resolution" ].value = new THREE.Vector2( window.innerWidth, window.innerHeight );
      pixelPass.uniforms[ "resolution" ].value.multiplyScalar( window.devicePixelRatio );
      pixelPass.uniforms.pixelSize.value = 8;
      pixelPass.enabled = false;
      effectComposer.addPass( pixelPass );

      const pixelFolder = this.elements.gui.addFolder("Pixelator");
      pixelFolder.add(pixelPass, 'enabled').name('pixelPass')
      pixelFolder.add( pixelPass.uniforms.pixelSize, 'value' )
        .min( 1 ).max( 32 ).step( 1 )
        .name('pixelSize');

      // CRT pass
      const CRTShader = {
          uniforms: {
              tDiffuse: { value: null },
              uCurvature: { value: new THREE.Vector2(3.5, 3.0) },
              //screenResolution: { value: new THREE.Vector2(sizes.width, sizes.height) },
              screenResolution: { value: new THREE.Vector2(320, 240) },
              scanLineOpacity: { value: new THREE.Vector2(0.5, 0.5) },
              vignetteOpacity: { value: 0.5 },
              brightness: { value: 2.1 }
          },
          vertexShader: `
              varying vec2 vUv;
              void main()
              {
                  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  vUv = uv;
              }
          `,
          fragmentShader: `
              #define PI 3.1415926535897932384626433832795
              uniform sampler2D tDiffuse;
              uniform vec2 uCurvature;
              uniform vec2 screenResolution;
              uniform vec2 scanLineOpacity;
              uniform float vignetteOpacity;
              uniform float brightness;
              varying vec2 vUv;
              vec2 curveRemapUV(vec2 uv)
              {
                  // as we near the edge of our screen apply greater distortion using a cubic function
                  vec2 newUV = uv.xy * 2.0 - 1.0;
                  vec2 offset = abs(newUV.yx) / vec2(uCurvature.x, uCurvature.y);
                  newUV += newUV * offset * offset;
                  newUV = newUV * 0.5 + 0.5;
                  return newUV;
              }
              vec4 scanLineIntensity(float uv, float resolution, float opacity)
              {
                  float intensity = sin(uv * resolution * PI * 2.0);
                  intensity = ((0.5 * intensity) + 0.5) * 0.9 + 0.1;
                  return vec4(vec3(pow(intensity, opacity)), 1.0);
              }
              vec4 vignetteIntensity(vec2 uv, vec2 resolution, float opacity)
              {
                  float intensity = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
                  return vec4(vec3(clamp(pow((resolution.x / 4.0) * intensity, opacity), 0.0, 1.0)), 1.0);
              }
              void main()
              {
                  vec2 remappedUV = curveRemapUV(vUv);
                  vec4 baseColor = texture2D(tDiffuse, remappedUV);
                  baseColor *= vignetteIntensity(remappedUV, screenResolution, vignetteOpacity);
                  baseColor *= scanLineIntensity(remappedUV.x, screenResolution.y, scanLineOpacity.x);
                  baseColor *= scanLineIntensity(remappedUV.y, screenResolution.x, scanLineOpacity.y);
                  
                  baseColor *= vec4(vec3(brightness), 1.0);
                  if (remappedUV.x < 0.0 || remappedUV.y < 0.0 || remappedUV.x > 1.0 || remappedUV.y > 1.0){
                      gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
                  } else {
                      gl_FragColor = baseColor;
                  }
              }
          `
      };
      const crtPass = new ShaderPass(CRTShader);
      crtPass.enabled = false;
      effectComposer.addPass(crtPass);

      const crtFolder = this.elements.gui.addFolder("Old TV (CRT)");
      crtFolder.add(crtPass, 'enabled').name('crtPass');
      crtFolder.add(crtPass.material.uniforms.uCurvature.value, 'x')
        .min(-1).max(10).step(0.1)
        .name('CurvatureX');
      crtFolder.add(crtPass.material.uniforms.uCurvature.value, 'y')
        .min(-1).max(10).step(0.1)
        .name('CurvatureY');
      crtFolder.add(crtPass.material.uniforms.scanLineOpacity.value, 'x')
        .min(-1).max(10).step(0.1)
        .name('scanLineOpacityX');
      crtFolder.add(crtPass.material.uniforms.scanLineOpacity.value, 'y')
        .min(-1).max(10).step(0.1)
        .name('scanLineOpacityY');
      crtFolder.add(crtPass.material.uniforms.vignetteOpacity, 'value')
        .min(-1).max(1).step(0.01)
        .name('vignetteOpacity');
      crtFolder.add(crtPass.material.uniforms.brightness, 'value')
        .min(-1).max(5).step(0.01)
        .name('brightness');

      // Remember that passes have an order, we want to apply antialsing the last
      if (renderer.getPixelRatio() === 1 && !renderer.capabilities.isWebGL2) {
        const smaaPass = new SMAAPass();
        effectComposer.addPass(smaaPass);
      }

      
      console.log(document.querySelector('.point-0'))
      setPoints();
      tick();
    },
    initCanvas: function() {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      this.elements.webglCanvas = document.querySelector("canvas.webgl");
      scene = new THREE.Scene();

      // Base camera
      camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
      camera.position.set(4, 1, -4);
      scene.add(camera);

      // Controls
      controls = new OrbitControls(camera, this.elements.webglCanvas);
      controls.enableDamping = true;

         /** 
       * Points
       */
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
      renderer.toneMappingExposure = 1.5;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      let container = document.createElement("div");
      container.setAttribute("id", "stats");
      document.body.appendChild(container);
      container.appendChild(stats.dom);

      this.elements.gui = new dat.GUI({ width: 300 });

      // Render target
      let RenderTargetClass = null;

      if(renderer.getPixelRatio() === 1 && renderer.capabilities.isWebGL2)
      {
          RenderTargetClass = THREE.WebGLMultisampleRenderTarget
          console.log('Using WebGLMultisampleRenderTarget')
      }
      else
      {
          RenderTargetClass = THREE.WebGLRenderTarget
          console.log('Using WebGLRenderTarget')
      }

      const renderTarget = new RenderTargetClass(
          800,
          600,
          {
              minFilter: THREE.LinearFilter,
              magFilter: THREE.LinearFilter,
              format: THREE.RGBAFormat,
              encoding: THREE.sRGBEncoding
          }
      );
      // Composer
      effectComposer = new EffectComposer(renderer, renderTarget);
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

.point {
  position: absolute;
  top: 50%;
  left: 50%;
}

.point:hover .description {
  opacity: 1;
}

.point.visible .label {
  transform: scale(1, 1);
}

.point .label {
  position: absolute;
  width: 40px;
  height: 40px;
  top: -20px;
  left: -20px;
  border-radius: 50%;
  background: #00000077;
  color: #fff;
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  line-height: 40px;
  font-weight: 100;
  font-size: 14px;
  cursor: help;
  transform: scale(0, 0); /* Sometimes you need to put: 0.001 */
  transition: transform 0.3s;
}

.point .description {
  position: absolute;
  top: 30px;
  left: -120px;
  width: 200px;
  padding: 20px;
  border-radius: 4px;
  background: #00000077;
  color: #fff;
  font-family: Arial, Helvetica, sans-serif;
  text-align: center;
  line-height: 1.3em;
  font-weight: 100;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
</style>
