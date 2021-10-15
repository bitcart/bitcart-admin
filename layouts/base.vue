<template>
  <v-app dark :style="customStyle">
    <slot name="header" />
    <v-main>
      <div v-if="adminUnconfigured">
        <troubleshooting-guide :title="unconfiguredTitle" />
      </div>
      <slot v-else />
    </v-main>
    <slot name="footer" />
  </v-app>
</template>

<script>
import TroubleshootingGuide from "@/components/TroubleshootingGuide.vue"
export default {
  components: {
    TroubleshootingGuide,
  },
  data() {
    return {
      unconfiguredTitle: "Admin panel unconfigured",
    }
  },
  head() {
    const metaHead = this.$store.state.policies.discourage_index
      ? {
          meta: [{ name: "robots", content: "noindex" }],
        }
      : {}
    return {
      ...metaHead,
      ...(this.adminUnconfigured && { title: this.unconfiguredTitle }),
    }
  },
  computed: {
    adminUnconfigured() {
      return this.$utils.isEmpty(this.$store.state.policies)
    },
    customStyle() {
      return this.$route.query.modal
        ? { background: "rgba(55, 58, 60, 0.4)" }
        : {}
    },
  },
}
</script>
