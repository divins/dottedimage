<template>
  <div class="home">
    <Scattering msg="Scattering a model" />
  </div>
</template>

<script>
// @ is an alias to /src
import Scattering from "@/components/Scattering.vue";

export default {
  name: "ScatteringView",
  components: {
    Scattering
  }
};
</script>