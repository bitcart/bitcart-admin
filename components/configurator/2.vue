<template>
  <v-card>
    <v-card-text>
      <v-text-field
        v-model="domainSettings.domain"
        label="Domain"
      ></v-text-field>
      <v-checkbox v-model="domainSettings.https" label="HTTPS Enabled" />
      <p class="text-h6 font-weight-regular">
        If you don't have a domain to use, you'll still be able to<br />
        access BitcartCC and other related services via
        <a target="_blank" href="https://docs.bitcartcc.com/guides/tor">TOR</a>.
      </p>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      domainSettings: this.value,
    }
  },
  watch: {
    domainSettings(v) {
      this.$emit("input", v)
    },
  },
}
</script>
