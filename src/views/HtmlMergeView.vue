<template>
  <div class="home">
    <HtmlMerge msg="Scattering models" />
  </div>
</template>

<script>
// @ is an alias to /src
import HtmlMerge from "@/components/HtmlMerge.vue";

export default {
  name: "HtmlMergeView",
  components: {
    HtmlMerge
  }
};
</script>
