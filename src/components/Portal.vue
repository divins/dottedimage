<template>
  <canvas class="webgl"></canvas>
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
  props: {
    msg: String
  },
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
    portal.initialize();
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
</style>
