<template>
  <v-container class="ma-0 pa-0">
    <v-row>
      <div class="text-subtitle-1 mx-auto">
        Your code was sent to you via email
      </div>
    </v-row>
    <v-row>
      <v-col class="mx-auto" style="max-width: 400px">
        <v-otp-input v-model="otpCode" type="number" />
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
      otpCode: this.value,
    }
  },
  watch: {
    otpCode(v) {
      this.$emit("input", v)
    },
  },
}
</script>
