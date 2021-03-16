<template>
  <div class="home">
    <AppliedPostProcessing msg="Applying some post-processing" />
  </div>
</template>

<script>
// @ is an alias to /src
import AppliedPostProcessing from "@/components/AppliedPostProcessing.vue";

export default {
  name: "PostProcessing",
  components: {
    AppliedPostProcessing
  }
};
</script>
