<template>
  <v-container class="ma-0 pa-0">
    <v-row>
      <div class="text-subtitle-1 mx-auto">
        Your code was sent to you via email
      </div>
    </v-row>
    <v-row>
      <v-col
        class="mx-auto d-flex align-center"
        style="max-width: 400px"
        @paste.capture="onPaste"
      >
        <v-otp-input v-model="part1" :length="4" type="text" />
        <span class="mx-2 text-h5">-</span>
        <v-otp-input v-model="part2" :length="4" type="text" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      part1: this.value.slice(0, 4),
      part2: this.value.slice(4, 8),
    }
  },
  watch: {
    part1() {
      this.$emit("input", this.part1 + "-" + this.part2)
    },
    part2() {
      this.$emit("input", this.part1 + "-" + this.part2)
    },
  },
  methods: {
    onPaste(e) {
      const text = e.clipboardData.getData("text")
      const clean = text.replace(/-/g, "").trim()
      if (clean.length > 4) {
        e.preventDefault()
        this.part1 = clean.slice(0, 4)
        this.part2 = clean.slice(4, 8)
      }
    },
  },
}
</script>
