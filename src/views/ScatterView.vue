<template>
  <div class="home">
    <Scatter msg="Scattering models" />
  </div>
</template>

<script>
// @ is an alias to /src
import Scatter from "@/components/Scatter.vue";

export default {
  name: "ScatterView",
  components: {
    Scatter
  }
};
</script>
