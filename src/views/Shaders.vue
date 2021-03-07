<template>
  <div class="home">
    <ToShaders msg="Using Shaders to repaint an image" />
  </div>
</template>

<script>
// @ is an alias to /src
import ToShaders from "@/components/ToShaders.vue";

export default {
  name: "Shaders",
  components: {
    ToShaders
  }
};
</script>
