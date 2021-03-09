<template>
  <div class="labs">
    <div class="instructions">
      <p>Please select an image to convert it to dots!</p>
      <input type="file" accept="image/*" @input="upload" />
    </div>
    <div class="info">
      <p>
        This experiment is using shaders for the animation!
      </p>
      <ul class="grid-info">
        <li>Cols: {{ gridInfo.cols }}</li>
        <li>Rows: {{ gridInfo.rows }}</li>
        <li>Artifacts: {{ gridInfo.artifactsCount }}</li>
      </ul>
    </div>
    <div class="experiment">
      <img id="output_image" @load="process" />
      <canvas class="webgl"></canvas>
    </div>
  </div>
  <a class="demo repo"
    :title="links.repo.title"
    :href="links.repo.href"
    target="_blank">
    {{ links.repo.label }}
  </a>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import Stats from "three/examples/jsm/libs/stats.module.js";

let scene = null;
let camera = null;
let renderer = null;
let controls = null;
const clock = new THREE.Clock();

let geometry = null;
let material = null;
let points = null;

let requestAnimationFrameId = null;

export default {
  name: "ToShaders",
  props: {
    msg: String
  },
  data() {
    return {
      links: {
        repo: {
          title: "View source code for shaders animation",
          label: "< >",
          href: "https://github.com/divins/dottedimage/blob/master/src/components/ToShaders.vue"
        }
      },
      gridOptions: {
        spacingX: 10,
        spacingY: 10,
        particleSize: 15
      },
      positionMultiplier: 0.01,
      canvasMultiplier: 1,
      imageSize: {
        width: null,
        height: null
      },
      gridInfo: {
        cols: null,
        rows: null,
        artifactsCount: null,
      },
      elements: {
        gui: null,
        stats: new Stats(),
        webglCanvas: null
      },
      animation: {
        animate: true,
        zDisplacement: 0.2
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
    process: function() {
      this.cleanScene();

      var output = document.getElementById("output_image");
      this.imageSize.width = output.width;
      this.imageSize.height = output.height;
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      canvas.width = this.imageSize.width;
      canvas.height = this.imageSize.height;
      ctx.drawImage(output, 0, 0, canvas.width, canvas.height);

      this.gridInfo.cols = Math.round(this.imageSize.width / this.gridOptions.spacingX);
      this.gridInfo.rows = Math.round(this.imageSize.height / this.gridOptions.spacingY);
      this.gridInfo.artifactsCount = this.gridInfo.cols * this.gridInfo.rows;

      this.setCanvas();

      /**
       * Geometry
       */
      geometry = new THREE.BufferGeometry();

      const positions = new Float32Array(this.gridInfo.artifactsCount * 3);
      const colors = new Float32Array(this.gridInfo.artifactsCount * 3);
      const scale = new Float32Array(this.gridInfo.artifactsCount * 1);

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

          scale[(i * this.gridInfo.rows + z)] = Math.random() + 1.0;
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('aScale', new THREE.BufferAttribute(scale, 1));

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
          uniform float uZDisplacement;

          varying vec3 vColor;

          void main(){
            // Position
            vec4 modelPosition = modelMatrix * vec4(position, 1.0);
            modelPosition.z += sin(aScale * 10.0 - uTime) * uZDisplacement;

            vec4 viewPosition = viewMatrix * modelPosition;
            vec4 projectedPosition = projectionMatrix * viewPosition;
            gl_Position = projectedPosition;

            // Size
            if(uZDisplacement == 0.0){
              gl_PointSize = uSize * aScale * abs(sin(aScale * 10.0 - uTime*0.5));
            } else {
              gl_PointSize = uSize * aScale;
            }

            vColor = color;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;

          void main(){
            float strength = distance(gl_PointCoord, vec2(0.5));
            strength = 1.0 - strength;
            strength = pow(strength, 5.0);
            strength = step(0.5, strength);

            vec3 color = vec3(strength) * vColor;

            gl_FragColor = vec4(color, 1.0);
          }
        `,
        uniforms: {
          uSize: { value: this.gridOptions.particleSize * renderer.getPixelRatio() },
          uZDisplacement: { value: this.animation.zDisplacement },
          uTime: { value: 0.0 }
        }
      });

      // Points
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
      this.gui.add(this.gridOptions, "spacingX")
        .min(5).max(50).step(5)
        .name("X Space")
        .onFinishChange(this.reprocess());
      this.gui
        .add(this.gridOptions, "spacingY")
        .min(5).max(50).step(5)
        .name("Y Space")
        .onFinishChange(this.reprocess());
      this.gui
        .add(this.gridOptions, "particleSize")
        .min(1).max(50).step(1)
        .name("Particle size")
        .onFinishChange(this.reprocess());
      this.gui
        .add(this.animation, "zDisplacement")
        .min(0).max(5).step(0.1)
        .name("Z Displacement")
        .onFinishChange(this.reprocess());
      this.gui.add(this.animation, "animate");
    },
    setCanvas: function() {
      // Update sizes
      //let output = document.getElementById("output_image");
      /*this.sizes.width = output.width * this.canvasMultiplier;
      this.sizes.height = output.height * this.canvasMultiplier;*/

      // Update camera
      camera.aspect = this.imageSize.width / this.imageSize.height;
      camera.position.x = (this.imageSize.width / 2) * this.positionMultiplier;
      camera.position.y = (this.imageSize.height / 2) * this.positionMultiplier;
      camera.position.z = 5;
      controls.target = new THREE.Vector3(
        (this.imageSize.width / 2) * this.positionMultiplier,
        (this.imageSize.height / 2) * this.positionMultiplier,
        0
      );
      camera.updateProjectionMatrix();

      // Update renderer
      renderer.setSize(this.imageSize.width, this.imageSize.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    },
    initCanvas: function() {
      this.elements.webglCanvas = document.querySelector("canvas.webgl");
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        70,
        this.elements.webglCanvas.clientWidth / this.elements.webglCanvas.clientHeight,
        0.1,
        100
      );
      camera.position.z = 2;

      // Controls
      controls = new OrbitControls(camera, this.elements.webglCanvas);
      controls.enableDamping = true;

      renderer = new THREE.WebGLRenderer({ canvas: this.elements.webglCanvas });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      let container = document.createElement("div");
      container.setAttribute("id", "stats");
      document.body.appendChild(container);
      container.appendChild(this.elements.stats.dom);
    },
    tick: function() {
      const elapsedTime = clock.getElapsedTime();
      if (this.animation.animate && geometry !== null) {
        material.uniforms.uTime.value = elapsedTime;
      }
      this.elements.stats.update();
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrameId = requestAnimationFrame(this.tick);
    },
    cleanAll: function() {
      this.cleanScene();
      this.gui.destroy();
      var statsElement = document.getElementById("stats");
      statsElement.parentNode.removeChild(statsElement);
      cancelAnimationFrame(requestAnimationFrameId);
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
.labs {
  display: grid;
  grid-template-columns: 5% 45% 45% 5%;
  grid-template-rows: 100px auto;
  grid-template-areas:
    ". instructions info ."
    ". experiment experiment .";
}

.instructions {
  grid-area: instructions;
  font-weight: bold;
}

.info {
  grid-area: info;
  font-size: 0.9em;
}

.experiment {
  grid-area: experiment;
  position: relative;
}

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
/* canvas.webgl {
  max-width: 90%;
} */
canvas.webgl {
  max-width: 100%;
  width: auto;
  height: auto;
  position: absolute;
  top: 0px;
  left: 0px;
    width: 0px;
  height: 0px;
}
img#output_image {
  max-width: 100%;
  width: auto;
  height: auto;
  position: absolute;
  top: 0px;
  left: 0px;
  opacity: 0;
}
a.demo {
  background: #333;
  color: #ddd;
}
</style>
