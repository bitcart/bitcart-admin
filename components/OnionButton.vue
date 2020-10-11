<template>
  <v-btn icon :href="url">
    <v-img src="/onion.svg" height="32" width="32" contain />
  </v-btn>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      default: "",
    },
  },
}
</script>
