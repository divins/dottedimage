<template>
  <canvas class="webgl"></canvas>
  <div class="loading">Loading...</div>
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
import TerrainScene from "../scenes/TerrainScene.js";

const terrain = new TerrainScene({});

export default {
  name: "Terrain",
  data() {
    return {
      links: {
        repo: {
          title: "View source code for Terrain",
          label: "< >",
          href:
            "https://github.com/divins/dottedimage/blob/master/src/scenes/PortalScene.js"
        },
        tutorial: {
          title: "See followed video",
          label: "¿?",
          href: "https://www.twitch.tv/videos/1078301589"
        },
        brunos: {
          title: "Bruno Simon Twitch",
          label: "Bruno Simon",
          href: "https://www.twitch.tv/bruno_simon_dev"
        }
      }
    };
  },
  methods: {},
  mounted() {
    terrain.initialize({ backgroundColor: "#222" });
    terrain.startMagic();
  },
  beforeUnmount() {
    terrain.cleanUp();
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
  opacity: 1;
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
</style>
