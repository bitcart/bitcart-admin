<template>
  <v-btn icon :href="url">
    <v-img src="/onion.svg" max-height="32" max-width="32" contain />
  </v-btn>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      default: ''
    }
  }
}
</script>
