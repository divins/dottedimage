<template>
  <div class="hello">
    <div class="navbar">
      <ul>
        <li>Cols: {{ gridInfo.cols }}</li>
        <li>Rows: {{ gridInfo.rows }}</li>
        <li>Artifacts: {{ gridInfo.artifactsCount }}</li>
      </ul>
      <input type="file" accept="image/*" @input="upload" />
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

export default {
  name: "ToCircles",
  props: {
    msg: String
  },
  data() {
    return {
      gridOptions: {
        spacingX: 10,
        spacingY: 10,
        sizeScaleMultiplier: 1
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
        //this.setCanvas();
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
      this.setCanvas();
      var output = document.getElementById("output_image");
      var canvas = document.createElement("canvas");
      canvas.width = output.width;
      canvas.height = output.height;
      var ctx = canvas.getContext("2d");
      ctx.drawImage(output, 0, 0, output.width, output.height);
      this.gridInfo.cols = Math.round(output.width / this.gridOptions.spacingX);
      this.gridInfo.rows = Math.round(output.height / this.gridOptions.spacingY);
      this.gridInfo.artifactsCount = this.gridInfo.cols * this.gridInfo.rows;
      for (let i = 0; i < this.gridInfo.cols; i++) {
        const posX = i * this.gridOptions.spacingX;
        for (let z = 0; z < this.gridInfo.rows; z++) {
          const posY = z * this.gridOptions.spacingY;
          var pixelData = ctx.getImageData(posX, posY, 1, 1).data;
          let material = new THREE.MeshBasicMaterial();
          material.color = new THREE.Color(
            `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`
          );
          material.side = THREE.DoubleSide;
          let sphere = new THREE.Mesh(
            new THREE.CircleGeometry(
              (Math.random() * (0.1 - 0.04) + 0.04) *
                this.gridOptions.sizeScaleMultiplier,
              16
            ),
            material
          );
          sphere.position.x = posX * this.positionMultiplier;
          sphere.position.y = (output.height - posY) * this.positionMultiplier;
          sphere.position.z = Math.random() * 0.5;
          scene.add(sphere);
        }
      }
      renderer.render(scene, camera);
    },
    cleanScene: function() {
      /*geometry.dispose();
      material.dispose();
      scene.remove(points);
      this.gridInfo.cols = null;
      this.gridInfo.rows = null;
      this.gridInfo.artifactsCount = null;*/
    },
    setGuiControls: function() {
      this.gui = new dat.GUI();
      this.gui
        .add(this.gridOptions, "spacingX")
        .name("X Space")
        .min(5)
        .max(50)
        .step(5);
        //.onFinishChange(process);
      this.gui
        .add(this.gridOptions, "spacingY")
        .name("Y Space")
        .min(5)
        .max(50)
        .step(5);
        //.onFinishChange(process);
      this.gui
        .add(this.gridOptions, "sizeScaleMultiplier")
        .name("Circle size")
        .min(0.1)
        .max(1.5)
        .step(0.1);
        //.onFinishChange(process);
    },
    initCanvas: function() {
      canvas = document.querySelector("canvas.webgl");
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(
        70,
        canvas.clientWidth / canvas.clientHeight,
        0.01,
        10
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
    seedRand: function(min, max, seed) {
      min = min || 0;
      max = max || 1;
      var rand;
      if (typeof seed === "number") {
        seed = (seed * 9301 + 49297) % 233280;
        var rnd = seed / 233280;
        var disp = Math.abs(Math.sin(seed));
        rnd = rnd + disp - Math.floor(rnd + disp);
        rand = min + rnd * (max - min + 1);
      } else {
        rand = Math.random() * (max - min + 1) + min;
      }
      return rand;
    },
    animate: function() {
      const elapsedTime = clock.getElapsedTime();
      if (scene.children.length > 2) {
        for (const [id, circle] of scene.children.entries()) {
          let scale = null;
          if (id % 2) {
            scale =
              Math.abs(
                Math.sin(elapsedTime + this.seedRand(undefined, undefined, id))
              ) + 0.15;
          } else {
            scale =
              Math.abs(
                Math.cos(elapsedTime + this.seedRand(undefined, undefined, id))
              ) + 0.15;
          }
          circle.scale.set(scale, scale, scale);
        }
      }
      this.elements.stats.update();
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(this.animate);
    },
    cleanAll: function() {
      this.gui.destroy();
      var statsElement = document.getElementById("stats");
      statsElement.parentNode.removeChild(statsElement);
    }
  },
  mounted() {
    this.initCanvas();
    this.animate();
  },
  created() {
    this.setGuiControls();
  },
  unmounted() {
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
canvas {
  width: 0px;
  height: 0px;
}
img#output_image {
  max-width: 50%;
}
</style>