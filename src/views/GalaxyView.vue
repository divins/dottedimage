<template>
  <div class="home">
    <Galaxy msg="Using Shaders to repaint an image" />
  </div>
</template>

<script>
// @ is an alias to /src
import Galaxy from "@/components/Galaxy.vue";

export default {
  name: "GalaxyView",
  components: {
    Galaxy
  }
};
</script>
