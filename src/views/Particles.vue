<template>
  <div class="home">
    <ToParticles msg="Using Particles to repaint an image" />
  </div>
</template>

<script>
// @ is an alias to /src
import ToParticles from "@/components/ToParticles.vue";

export default {
  name: "Particles",
  components: {
    ToParticles
  }
};
</script>
