<template>
  <v-app dark>
    <slot name="header" />
    <v-content>
      <v-container>
        <slot />
        <nuxt />
      </v-container>
    </v-content>
    <slot name="footer" />
  </v-app>
</template>

<script>
export default {
  beforeCreate () {
    const hours = new Date().getHours()
    const isDayTime = hours > 6 && hours < 20
    if (!isDayTime) { this.$vuetify.theme.dark = true }
  },
  head () {
    return this.$store.state.policies.discourage_index ? {
      meta: [
        { name: 'robots', content: 'noindex' }
      ]
    } : {}
  }
}
</script>
