<template>
  <div class="hello">
    <div class="navbar">
      <input type="file" accept="image/*" @input="upload" />
      <button @click="process">Process</button>
    </div>
    <img id="output_image" />
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

const gui = new dat.GUI();
let stats = new Stats();

export default {
  name: "HelloWorld",
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
      positionMultiplier: 0.01
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
      this.sizes.width = output.width * 2;
      this.sizes.height = output.height * 2;

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

      const cols = Math.round(output.width / this.gridOptions.spacingX);
      const rows = Math.round(output.height / this.gridOptions.spacingY);

      for (let i = 0; i < cols; i++) {
        const posX = i * this.gridOptions.spacingX;
        for (let z = 0; z < rows; z++) {
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
    init: function() {
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
      document.body.appendChild(container);
      container.appendChild(stats.dom);

      gui
        .add(this.gridOptions, "spacingX")
        .min(5)
        .max(100)
        .step(1);
      gui
        .add(this.gridOptions, "spacingY")
        .min(5)
        .max(100)
        .step(1);
      gui
        .add(this.gridOptions, "sizeScaleMultiplier")
        .min(0.1)
        .max(3)
        .step(0.1);
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

      stats.update();
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(this.animate);
    }
  },
  mounted() {
    this.init();
    this.animate();
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
  height: 500px;
}
</style>
