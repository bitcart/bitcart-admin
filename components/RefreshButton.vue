<template>
  <v-btn :color="btnColor" :icon="isDesktop" @click="func()">
    <v-icon v-if="isDesktop"> mdi-reload </v-icon>
    <div v-else>Refresh</div>
  </v-btn>
</template>

<script>
export default {
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
