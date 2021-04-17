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
    This demo has been set as a learning process copying the 
    <a :href="links.digiconf.href" :title="links.digiconf.title" target="_blank">{{
      links.digiconf.label
    }}</a>
    site.
  </p>
</template>

<script>
import DigiConfScene from "../scenes/DigiConfScene.js";

const digiConf = new DigiConfScene({});

export default {
  name: "DigiConf",
  data() {
    return {
      links: {
        repo: {
          title: "View source code for Galaxy",
          label: "< >",
          href:
            "https://github.com/divins/dottedimage/blob/master/src/scenes/PortalScene.js"
        },
        digiconf: {
          title: "View Digital Conference website",
          label: "Digital Conference Website 2019",
          href:
            "https://digitalconference.ru/"
        }
      }
    };
  },
  methods: {},
  mounted() {
    digiConf.initialize({ backgroundColor: "#100318" });
    digiConf.startMagic();
  },
  beforeUnmount() {
    digiConf.cleanUp();
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
