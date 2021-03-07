<template>
  <div class="hello">
    <div class="navbar">
      <ul>
        <li>Cols: {{ gridInfo.cols }}</li>
        <li>Rows: {{ gridInfo.rows }}</li>
        <li>Artifacts: {{ gridInfo.artifactsCount }}</li>
      </ul>
      <input type="file" accept="image/*" @input="upload" />
      <button @click="cleanScene">Clean</button>
    </div>
    <img id="output_image" @load="process" />
    <canvas class="webgl"></canvas>
  </div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module.js";

let canvas = null;
let scene = null;
let camera = null;
let renderer = null;
let controls = null;
const clock = new THREE.Clock();

let geometry = null;
let material = null;
let points = null;

export default {
  name: "ToShaders",
  props: {
    msg: String
  },
  data() {
    return {
      gridOptions: {
        spacingX: 10,
        spacingY: 10,
        particleSize: 0.4
      },
      sizes: {
        width: 0,
        height: 0
      },
      positionMultiplier: 0.01,
      canvasMultiplier: 1,
      gridInfo: {
        cols: null,
        rows: null,
        artifactsCount: null
      },
      animationOptions: {
        animate: false,
        zDisplacement: 0.2
      },
      gui: null,
      elements: {
        stats: new Stats()
      }
    };
  },
  methods: {
    upload: function($event) {
      let reader = new FileReader();
      reader.onload = () => {
        let output = document.getElementById("output_image");
        output.src = reader.result;
      };
      reader.readAsDataURL($event.target.files[0]);
    },
    setCanvas: function() {
      // Update sizes
      let output = document.getElementById("output_image");
      this.sizes.width = output.width * this.canvasMultiplier;
      this.sizes.height = output.height * this.canvasMultiplier;

      // Update camera
      camera.aspect = this.sizes.width / this.sizes.height;
      camera.position.x = (output.width / 2) * this.positionMultiplier;
      camera.position.y = (output.height / 2) * this.positionMultiplier;
      camera.position.z = 5;
      controls.target = new THREE.Vector3(
        (output.width / 2) * this.positionMultiplier,
        (output.height / 2) * this.positionMultiplier,
        0
      );
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(this.sizes.width, this.sizes.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    },
    process: function() {
      this.cleanScene();
      this.setCanvas();

      var output = document.getElementById("output_image");
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      canvas.width = output.width;
      canvas.height = output.height;
      ctx.drawImage(output, 0, 0, output.width, output.height);

      this.gridInfo.cols = Math.round(output.width / this.gridOptions.spacingX);
      this.gridInfo.rows = Math.round(output.height / this.gridOptions.spacingY);
      this.gridInfo.artifactsCount = this.gridInfo.cols * this.gridInfo.rows;

      /**
       * Geometry
       */
      geometry = new THREE.BufferGeometry()

      const positions = new Float32Array(this.gridInfo.artifactsCount * 3)
      const colors = new Float32Array(this.gridInfo.artifactsCount * 3)
      const scale = new Float32Array(this.gridInfo.artifactsCount * 1)

      for (let i = 0; i < this.gridInfo.cols; i++) {
        const posX = i * this.gridOptions.spacingX;
        for (let z = 0; z < this.gridInfo.rows; z++) {
          const i3 = (i * this.gridInfo.rows + z) * 3;

          const posY = z * this.gridOptions.spacingY;
          var pixelData = ctx.getImageData(posX, posY, 1, 1).data;

          colors[i3] = pixelData[0] / 255;
          colors[i3 + 1] = pixelData[1] / 255;
          colors[i3 + 2] = pixelData[2] / 255;

          positions[i3] = posX * this.positionMultiplier;
          positions[i3 + 1] = (output.height - posY) * this.positionMultiplier;
          positions[i3 + 2] = Math.random() * 0.5;

          scale[(i * this.gridInfo.rows + z)] = Math.random() + 10;
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geometry.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))

      /**
       * Material
       */
      material = new THREE.ShaderMaterial({
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        vertexShader: `
          uniform float uSize;

          attribute float aScale;
          uniform float uTime;

          varying vec3 vColor;

          void main(){
            /**
            * Position
            */
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);

            vec4 viewPosition = viewMatrix * modelPosition;
            vec4 projectedPosition = projectionMatrix * viewPosition;
            gl_Position = projectedPosition;

            /**
            * Size
            */
            gl_PointSize = uSize * aScale;
            gl_PointSize *= (1.0 / - viewPosition.z);

            vColor = color;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;

          void main(){
            float strength = distance(gl_PointCoord, vec2(0.5));
            strength = 1.0 - strength;
            strength = pow(strength, 10.0);

            vec3 color = vec3(strength) * vColor;

            gl_FragColor = vec4(color, 1.0);
          }
        `,
        uniforms: {
          uSize: { value: 10 * renderer.getPixelRatio() },
          uTime: { value: 0.0 }
        }
      });

      /**
       * Points
       */
      points = new THREE.Points(geometry, material);
      scene.add(points);
      renderer.render(scene, camera);
    },
    cleanScene: function() {
      if (points !== null) {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
      }

      this.gridInfo.cols = null;
      this.gridInfo.rows = null;
      this.gridInfo.artifactsCount = null;
    },
    reprocess() {
      return () => {
        this.cleanScene();
        this.process();
      };
    },
    setGuiControls: function() {
      this.gui = new dat.GUI();
      this.gui
        .add(this.gridOptions, "spacingX")
        .name("X Space")
        .min(5)
        .max(50)
        .step(5)
        .onFinishChange(this.reprocess());
      this.gui
        .add(this.gridOptions, "spacingY")
        .name("Y Space")
        .min(5)
        .max(50)
        .step(5)
        .onFinishChange(this.reprocess());
      this.gui
        .add(this.gridOptions, "particleSize")
        .name("Particle size")
        .min(0.1)
        .max(1.5)
        .step(0.1)
        .onFinishChange(this.reprocess());
      this.gui
        .add(this.animationOptions, "zDisplacement")
        .name("Z Displacement")
        .min(0.2)
        .max(5)
        .step(0.2);
      this.gui.add(this.animationOptions, "animate");
    },
    initCanvas: function() {
      canvas = document.querySelector("canvas.webgl");
      scene = new THREE.Scene();
      //scene.background = new THREE.Color( 0xffffff );

      camera = new THREE.PerspectiveCamera(
        70,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        100
      );
      camera.position.z = 2;

      // Controls
      controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;

      renderer = new THREE.WebGLRenderer({ canvas });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      let container = document.createElement("div");
      container.setAttribute("id", "stats");
      document.body.appendChild(container);
      container.appendChild(this.elements.stats.dom);
    },
    tick: function() {
      const elapsedTime = clock.getElapsedTime();
      if (this.animationOptions.animate && geometry !== null) {
        material.uniforms.uTime.value = elapsedTime;
      }

      this.elements.stats.update();
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(this.tick);
    },
    cleanAll: function() {
      this.cleanScene();
      this.gui.destroy();
      var statsElement = document.getElementById("stats");
      statsElement.parentNode.removeChild(statsElement);
    }
  },
  mounted() {
    this.initCanvas();
    this.tick();
  },
  created() {
    this.setGuiControls();
  },
  beforeUnmount() {
    this.cleanAll();
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
/*canvas {
  width: 0px;
  height: 0px;
}*/
img#output_image {
  max-width: 50%;
}
</style>
