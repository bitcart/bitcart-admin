<template>
  <v-btn :color="btnColor" :icon="isDesktop" @click="func()">
    <tooltip-icon v-if="isDesktop" icon="mdi-reload" text="Refresh" />
    <div v-else>Refresh</div>
  </v-btn>
</template>

<script>
import TooltipIcon from "@/components/TooltipIcon"
export default {
  components: {
    TooltipIcon,
  },
  props: {
    func: {
      type: Function,
      required: true,
    },
  },
  computed: {
    isDesktop() {
      return !this.$vuetify.breakpoint.mobile
    },
    btnColor() {
      if (!this.isDesktop) return "primary"
      return undefined
    },
  },
}
</script>
