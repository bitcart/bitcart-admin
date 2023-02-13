<template>
  <Default>
    <slot />
  </Default>
</template>
<script>
import Default from "@/layouts/default"
export default {
  components: {
    Default,
  },
  beforeCreate() {
    if (process.client) {
      this.$store.dispatch("syncStats")
    }
  },
}
</script>
