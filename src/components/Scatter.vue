<template>
  <div id="controllers">
    <button class="button">Skull</button>
    <button class="button">Horse</button>
    <button class="button">Text</button>
  </div>
  <canvas class="webgl"></canvas>
  <p class="disclaimer">
    This demo has been created following a
    <a :href="links.author.href" :title="links.author.title" target="_blank">{{
      links.author.label
    }}</a>
    tutorial. Give it a
    <a :href="links.tutorial.href" :title="links.tutorial.title" target="_blank"
      >try</a
    >!
  </p>
</template>

<script>
import ScatterScene from "../scenes/ScatterScene.js";

const scatter = new ScatterScene({});

export default {
  name: "Portal",
  data() {
    return {
      links: {
        repo: {
          title: "View source code for Scatter",
          label: "< >",
          href:
            "https://github.com/divins/dottedimage/blob/master/src/scenes/ScatterScene.js"
        },
        tutorial: {
          title: "See followed tutorial",
          label: "¿?",
          href: "https://www.awwwards.com/academy/course/impress-everyone-with-a-3d-particle-scene-starting-from-bad-models"
        },
        author: {
          title: "Fabio Ottaviani Twitter",
          label: "Favio Ottaviani",
          href: "https://twitter.com/supahfunk"
        }
      }
    };
  },
  methods: {},
  created() {
    console.log("Created");
  },
  mounted() {
    scatter.initialize();
    scatter.startMagic();
  },
  beforeUnmount() {
    scatter.cleanUp();
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

#controllers {
  position: fixed;
  z-index: 1;
  left: 0;
  top: 60px;
  text-align: center;
  width: 100%;
  padding: 10px;
}

.button {
  border: none;
  background: white;
  color: black;
  padding: 8px 20px;
  border-radius: 15px;
  cursor: pointer;
  outline: none;
  margin: 5px;
  font-family: sans-serif;
}
</style>
