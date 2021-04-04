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
import PortalScene from "../scenes/PortalScene.js";

const portal = new PortalScene({});

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
          href: "https://threejs-journey.xyz"
        },
        brunos: {
          title: "Bruno Simon website",
          label: "Bruno Simon",
          href: "https://bruno-simon.com/"
        }
      }
    };
  },
  methods: {},
  created() {
    console.log("Created");
  },
  mounted() {
    portal.initialize({ backgroundColor: "#100318" });
    portal.startMagic();
  },
  beforeUnmount() {
    portal.cleanUp();
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
  opacity: 0;
  color: #100318;
  transition: opacity 1.5s ease-in-out, color 0.5s ease-in-out;
  transition-delay: 0.5s, 0.0s;
}
</style>
