<template>
  <div class="home">
    <Portal msg="Fantasy Portal" />
  </div>
</template>

<script>
// @ is an alias to /src
import Portal from "@/components/Portal.vue";

export default {
  name: "PortalView",
  components: {
    Portal
  }
};
</script>