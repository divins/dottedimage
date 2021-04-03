<template>
    <h1>Fooo</h1>
    <canvas class="webgl"></canvas>
    <a class="demo repo"
        :title="links.repo.title"
        :href="links.repo.href"
        target="_blank">
        {{ links.repo.label }}
    </a>
    <p class="disclaimer">
        This demo has been created following a <a :href="links.brunos.href" :title="links.brunos.title" target="_blank">{{ links.brunos.label }}</a> tutorial. 
        Give it a <a :href="links.tutorial.href" :title="links.tutorial.title" target="_blank">try</a>!
    </p>
</template>

<script>
import ScatteringScene from "../scenes/ScatteringScene.js";

export default {
    name: "Scattering",
    props: {
        msg: String
    },
    data() {
        return {
        links: {
            repo: {
            title: "View source code for Galaxy",
            label: "< >",
            href: "https://github.com/divins/dottedimage/blob/master/src/components/Scattering.vue"
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
    methods: {
    },
    created() {
        console.log("Created");
    },
    mounted() {
        const scattering = new ScatteringScene({
            message: "so what"
        });
        scattering.initialize();
        scattering.startMagic();
    },
    beforeUnmount() {
    }
}
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