<template>
  <canvas class="webgl"></canvas>
  <div class="loading-bar"></div>
  <div class="point point-0">
    <div class="label">1</div>
    <div class="description">
      Front and top screen with HUD aggregating terrain and battle informations.
    </div>
  </div>
  <div class="point point-1">
    <div class="label">2</div>
    <div class="description">
      Ventilation with air purifier and detection of environment toxicity.
    </div>
  </div>
  <div class="point point-2">
    <div class="label">3</div>
    <div class="description">
      Cameras supporting night vision and heat vision with automatic adjustment.
    </div>
  </div>
  <a
    class="demo repo"
    :title="links.repo.title"
    :href="links.repo.href"
    target="_blank"
  >
    {{ links.repo.label }}
  </a>
  <p class="disclaimer">
    This demo has been created following a
    <a :href="links.brunos.href" :title="links.brunos.title" target="_blank">{{
      links.brunos.label
    }}</a>
    tutorial. Give it a
    <a :href="links.tutorial.href" :title="links.tutorial.title" target="_blank"
      >try</a
    >!
  </p>
</template>

<script>
import PostProcessingScene from "../scenes/PostProcessingScene.js";

const postProcessing = new PostProcessingScene({});

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
          href:
            "https://github.com/divins/dottedimage/blob/master/src/components/AppliedPostProcessing.vue"
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
      }
    }
  },
  methods: {},
  created() {
    console.log("Created");
  },
  mounted() {
    console.log("Mounted");
    postProcessing.initialize();
    postProcessing.startMagic();
  },
  beforeUnmount() {
    console.log("Before unmount");
    postProcessing.cleanUp();
  }
};
</script>

<style>
body {
  overflow: hidden;
}
</style>

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
