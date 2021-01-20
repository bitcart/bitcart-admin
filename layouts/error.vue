<template>
  <v-layout column align-center justify-center>
    <div>
      <h1>
        {{ title }}
      </h1>
      <NuxtLink to="/"> Home page </NuxtLink>
    </div>
  </v-layout>
</template>

<script>
export default {
  layout: "empty",
  props: {
    error: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      pageNotFound: "404 Not Found",
      otherError: "An error occurred",
    }
  },
  head() {
    return { title: this.title }
  },
  computed: {
    title() {
      return this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    },
  },
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
