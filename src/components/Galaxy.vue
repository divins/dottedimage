<template>
  <canvas class="webgl"></canvas>
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
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module.js";
import galaxyShaderVertexXZ from '../shaders/galaxy/vertexXZ.glsl';
import galaxyShaderVertexXY from '../shaders/galaxy/vertexXY.glsl';
import galaxyShaderVertexYZ from '../shaders/galaxy/vertexYZ.glsl';
import galaxyShaderVertexXZNoDistance from '../shaders/galaxy/vertexXZNoDistance.glsl';
import galaxyShaderVertexXYNoDistance from '../shaders/galaxy/vertexXYNoDistance.glsl';
import galaxyShaderVertexYZNoDistance from '../shaders/galaxy/vertexYZNoDistance.glsl';
import galaxyShaderFragment from '../shaders/galaxy/fragment.glsl';

let scene = null;
let camera = null;
let renderer = null;
let controls = null;
const clock = new THREE.Clock();

let geometry = null;
let material = null;
let points = null;

let requestAnimationFrameId = null;

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
          title: "View source code for Galaxy",
          label: "< >",
          href: "https://github.com/divins/dottedimage/blob/master/src/components/Galaxy.vue"
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
        affectedAxes: "XZ",
        selectedVertex: galaxyShaderVertexXZ,
        distanceHasImpact: true,
        particleCount: 200000,
        particleSize: 15,
        radius: 5,
        branches: 3,
        spinVelocity: 0.2,
        randomness: 0.5,
        randomnessPower: 3,
        insideColor: 0xff6030,
        outsideColor: 0x1b3984
      },
      elements: {
        gui: null,
        stats: new Stats(),
        webglCanvas: null,
        pauseButton: null
      },
      animation: {
        animate: true,
        pauseStartTime: 0.0,
        pauseTotalTime: 0.0,
        resetTime: 0.0
      }
    };
  },
  methods: {
    randomPosition(radius) {
      return Math.pow(Math.random(), this.parameters.randomnessPower) *
        (Math.random() < 0.5 ? 1 : -1) *
        this.parameters.randomness *
        radius;
    },
    generateGalaxy: function() {
      if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
      }
      /**
       * Geometry
       */
      geometry = new THREE.BufferGeometry();

      console.log(this.parameters.affectedAxes);

      const positions = new Float32Array(this.parameters.particleCount * 3);
      const colors = new Float32Array(this.parameters.particleCount * 3);
      const scale = new Float32Array(this.parameters.particleCount * 1);
      const randomness = new Float32Array(this.parameters.particleCount * 3);

      const insideColor = new THREE.Color(this.parameters.insideColor);
      const outsideColor = new THREE.Color(this.parameters.outsideColor);

      for (let i = 0; i < this.parameters.particleCount; i++) {
        const i3 = i * 3;

        // Position
        const radius = Math.random() * this.parameters.radius;

        const branchAngle = (i % this.parameters.branches) / this.parameters.branches * Math.PI * 2;

        // Randomness
        const randomX = this.randomPosition(radius);
        const randomY = this.randomPosition(radius);
        const randomZ = this.randomPosition(radius);
        randomness[i3] = randomX;
        randomness[i3 + 1] = randomY;
        randomness[i3 + 2] = randomZ;

        // Original position with randomness
        positions[i3] = Math.cos(branchAngle) * radius;
        positions[i3 + 1] = 0;
        positions[i3 + 2] = Math.sin(branchAngle) * radius;

        // Color
        const mixedColor = insideColor.clone();
        mixedColor.lerp(outsideColor, radius / this.parameters.radius);

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = mixedColor.g;
        colors[i3 + 2] = mixedColor.b;

        // Scale
        scale[i] = Math.random() + 0.3;
      }

      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute("aScale", new THREE.BufferAttribute(scale, 1));
      geometry.setAttribute("aRandomness", new THREE.BufferAttribute(randomness, 3));

      /**
       * Material
       */
      material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: this.parameters.selectedVertex,
        fragmentShader: galaxyShaderFragment,
        uniforms: {
          uSize: { value: this.parameters.particleSize * renderer.getPixelRatio() },
          uTime: { value: 0.0 },
          uSpinVelocity: { value: this.parameters.spinVelocity }
        }
      });

      /**
       * Points
       */
      points = new THREE.Points(geometry, material);
      scene.add(points);
      renderer.render(scene, camera);
    },
    setGuiControls: function() {
      this.elements.gui = new dat.GUI();
      // Particles params
      const particlesFolder = this.elements.gui.addFolder("Particles");
      particlesFolder.add(this.parameters, "particleCount")
        .min(100).max(1000000).step(100)
        .onFinishChange(this.generateGalaxy);
      particlesFolder.add(this.parameters, "particleSize")
        .min(1).max(50).step(1)
        .onFinishChange(this.generateGalaxy);
      // Galaxy params
      const galaxyFolder = this.elements.gui.addFolder("Galaxy");
      galaxyFolder.add(this.parameters, "affectedAxes", ["XZ", "XY", "YZ"])
        .onFinishChange(this.updateSelectedVertex);
      galaxyFolder.add(this.parameters, "distanceHasImpact")
        .onFinishChange(this.updateSelectedVertex);
      galaxyFolder.add(this.parameters, "spinVelocity")
        .min(0.01).max(1).step(0.01)
        .onFinishChange(this.generateGalaxy);
      galaxyFolder.add(this.parameters, "radius")
        .min(0.01).max(20).step(0.01)
        .onFinishChange(this.generateGalaxy);
      galaxyFolder.add(this.parameters, "branches")
        .min(2).max(20).step(1)
        .onFinishChange(this.generateGalaxy);
      galaxyFolder.add(this.parameters, "randomness")
        .min(0).max(2).step(0.001)
        .onFinishChange(this.generateGalaxy);
      galaxyFolder.add(this.parameters, "randomnessPower")
        .min(1).max(10).step(0.001)
        .listen(this.parameters, "randomnessPower")
        .onFinishChange(this.generateGalaxy);
      galaxyFolder.addColor(this.parameters, "insideColor")
        .onFinishChange(this.generateGalaxy);
      galaxyFolder.addColor(this.parameters, "outsideColor")
        .onFinishChange(this.generateGalaxy);
      // Actions
      this.elements.pauseButton = this.elements.gui.add(this, "pause").name("Pause");
      this.elements.gui.add(this, "reset").name("Reset animation");
    },
    pause: function() {
      if (this.animation.animate) {
        this.animation.animate = false;
        this.animation.pauseStartTime = clock.getElapsedTime();
        this.elements.pauseButton.name("Resume");
      } else {
        this.animation.pauseTotalTime +=
          clock.getElapsedTime() - this.animation.pauseStartTime;
        this.animation.animate = true;
        this.elements.pauseButton.name("Pause");
      }
    },
    reset: function() {
      this.animation.resetTime = clock.getElapsedTime();
      this.animation.pauseTotalTime = 0.0;
      this.animation.animate = true;
    },
    initCanvas: function() {
      // Update sizes
      sizes.width = window.innerWidth;
      sizes.height = window.innerHeight;

      this.elements.webglCanvas = document.querySelector("canvas.webgl");
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        75,
        sizes.width / sizes.height,
        0.1,
        100
      );
      camera.position.z = 2.0;
      camera.position.y = 1.5;
      camera.aspect = sizes.width / sizes.height;
      camera.updateProjectionMatrix();

      // Controls
      controls = new OrbitControls(camera, this.elements.webglCanvas);
      controls.enableDamping = true;

      // Renderer
      renderer = new THREE.WebGLRenderer({ canvas: this.elements.webglCanvas });
      renderer.setSize(sizes.width, sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      let container = document.createElement("div");
      container.setAttribute("id", "stats");
      document.body.appendChild(container);
      container.appendChild(this.elements.stats.dom);
    },
    tick: function() {
      const elapsedTime =
        clock.getElapsedTime() -
        this.animation.resetTime -
        this.animation.pauseTotalTime;
      if (this.animation.animate && geometry !== null) {
        material.uniforms.uTime.value = elapsedTime;
      }

      this.elements.stats.update();
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrameId = requestAnimationFrame(this.tick);
    },
    cleanAll: function() {
      if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
      }

      this.elements.gui.destroy();
      var statsElement = document.getElementById("stats");
      statsElement.parentNode.removeChild(statsElement);
      cancelAnimationFrame(requestAnimationFrameId);
    },
    updateSelectedVertex: function() {
      if (this.parameters.affectedAxes === "XZ") {
        this.parameters.selectedVertex = this.parameters.distanceHasImpact ?
          galaxyShaderVertexXZ : galaxyShaderVertexXZNoDistance;
      } else if (this.parameters.affectedAxes === "XY") {
        this.parameters.selectedVertex = this.parameters.distanceHasImpact ?
          galaxyShaderVertexXY : galaxyShaderVertexXYNoDistance;
        this.parameters.randomnessPower = 5.0;
      } else if (this.parameters.affectedAxes === "YZ") {
        this.parameters.selectedVertex = this.parameters.distanceHasImpact ?
          galaxyShaderVertexYZ : galaxyShaderVertexYZNoDistance;
        this.parameters.randomnessPower = 5.0;
      }
      this.generateGalaxy();
    }
  },
  created() {
    console.log("Created");
    this.setGuiControls();
  },
  mounted() {
    console.log("Mounted");
    this.reset();
    this.initCanvas();
    this.generateGalaxy();
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
</style>
