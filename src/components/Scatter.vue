<template>
  <div id="controllers">
    <button class="button">Skull</button>
    <button class="button">Horse</button>
    <button class="button">Text</button>
  </div>
  <canvas class="webgl"></canvas>
  <div class="loading ended">Loading...</div>
  <!-- <a
    class="demo repo"
    :title="links.repo.title"
    :href="links.repo.href"
    target="_blank"
  >
    {{ links.repo.label }}
  </a> -->
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
          title: "View source code for Galaxy",
          label: "< >",
          href:
            "https://github.com/divins/dottedimage/blob/master/src/components/Portal.vue"
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

.loading {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #100318;
  text-align: center;
  line-height: 50;
  color: wheat;
  font-size: 1.2rem;
}
.loading.ended {
  pointer-events: none;
  opacity: 0;
  color: #100318;
  transition: opacity 1.5s ease-in-out, color 0.5s ease-in-out;
  transition-delay: 0.5s, 0.0s;
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
