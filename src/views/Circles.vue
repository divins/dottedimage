<template>
  <div class="home">
    <ToCircles msg="Using Circles to repaint an image" />
  </div>
</template>

<script>
// @ is an alias to /src
import ToCircles from "@/components/ToCircles.vue";

export default {
  name: "Circles",
  components: {
    ToCircles
  }
};
</script>
