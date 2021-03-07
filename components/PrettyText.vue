<template>
  <v-row class="pa-0">
    <v-col cols="8" class="py-0">
      <p :class="titleClass">{{ text }}</p>
    </v-col>
    <v-col cols="4" class="py-0">
      <p class="text-h6 font-weight-regular">
        {{ displayValue }}
      </p>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    text: {
      type: String,
      required: true,
    },
    value: {
      type: null,
      required: true,
    },
    titleClass: {
      type: String,
      default: "text-h6",
    },
  },
  computed: {
    displayValue() {
      return this.getOrEmpty(this.value)
    },
  },
  methods: {
    getOrEmpty(val) {
      if (!val) return "Not set"
      return val
    },
  },
}
</script>

<style scoped>
.v-application .text-h6 {
  line-height: 0.8 !important;
}
</style>
