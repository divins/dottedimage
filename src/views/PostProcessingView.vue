<template>
  <div class="home">
    <PostProcessing />
  </div>
</template>

<script>
// @ is an alias to /src
import PostProcessing from "@/components/PostProcessing.vue";

export default {
  name: "PostProcessingView",
  components: {
    PostProcessing
  }
};
</script>
