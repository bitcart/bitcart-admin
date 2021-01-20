<template>
  <v-app dark :style="customStyle">
    <slot name="header" />
    <v-main>
      <slot />
    </v-main>
    <slot name="footer" />
  </v-app>
</template>

<script>
export default {
  head() {
    return this.$store.state.policies.discourage_index
      ? {
          meta: [{ name: "robots", content: "noindex" }],
        }
      : {}
  },
  computed: {
    customStyle() {
      return this.$route.query.modal
        ? { background: "rgba(55, 58, 60, 0.4)" }
        : {}
    },
  },
}
</script>
