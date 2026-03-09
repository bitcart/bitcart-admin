<template>
  <v-app dark :style="customStyle">
    <UIExtensionSlot name="base_header">
      <slot name="header" />
    </UIExtensionSlot>
    <v-main @mouseenter.native="$bus.$emit('drawerOff')">
      <div v-if="adminUnconfigured">
        <troubleshooting-guide :title="unconfiguredTitle" />
      </div>
      <slot v-if="!adminUnconfigured" />
      <UIExtensionSlot v-if="!adminUnconfigured" name="app" />
    </v-main>
    <UIExtensionSlot name="base_footer">
      <slot name="footer" />
    </UIExtensionSlot>
  </v-app>
</template>

<script>
import TroubleshootingGuide from "@/components/TroubleshootingGuide.vue"
import UIExtensionSlot from "~/components/UIExtensionSlot.vue"
export default {
  components: {
    TroubleshootingGuide,
    UIExtensionSlot,
  },
  data() {
    return {
      unconfiguredTitle: "Admin panel unconfigured",
    }
  },
  head() {
    const discourage = this.$store.state.policies.discourage_index
    const noindex = discourage === undefined || discourage
    return {
      ...(noindex && { meta: [{ name: "robots", content: "noindex" }] }),
      ...(this.adminUnconfigured && { title: this.unconfiguredTitle }),
    }
  },
  computed: {
    adminUnconfigured() {
      return !!this.$store.state.apiError
    },
    customStyle() {
      return this.$route.query.modal
        ? { background: "rgba(0, 0, 0, 0.85)" }
        : {}
    },
  },
  mounted() {
    if (
      this.$utils.isEmpty(this.$store.state.policies) &&
      !this.adminUnconfigured
    ) {
      this.$store.dispatch("loadAppData")
    }
  },
}
</script>
