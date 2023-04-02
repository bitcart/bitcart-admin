<template>
  <v-container>
    <h1 class="text-center">Exchange rates</h1>
    <v-textarea
      v-model="store.checkout_settings.rate_rules"
      :rows="10"
      :success-messages="success_messages"
      :error-messages="error_messages"
      label="Custom rate rules"
      @input="
        success_messages = ''
        error_messages = ''
      "
    >
    </v-textarea>
    <v-btn color="primary" class="mt-2 mb-4" @click="save">Save</v-btn>
    <v-divider />
    <h2>Test rates</h2>
    <v-form ref="form" @submit.prevent="testRates">
      <v-text-field
        v-model="currencies"
        label="Comma-separated list of currencies, e.g. BTC_USD"
        :rules="[rules.required]"
      />
      <v-btn color="primary" class="mt-2 mb-4" type="submit">Test rates</v-btn>
      <div v-if="testResults">
        <div v-for="(result, idx) in testResults" :key="idx">
          {{ result.message }}
        </div>
      </div>
    </v-form>
  </v-container>
</template>

<script>
export default {
  async asyncData({ route, error, $axios }) {
    try {
      return { store: (await $axios.get(`/stores/${route.params.id}`)).data }
    } catch {
      return error({ statusCode: 404, text: "Store not found" })
    }
  },
  data() {
    return {
      success_messages: "",
      error_messages: "",
      currencies: "",
      testResults: "",
      rules: this.$utils.rules,
    }
  },
  methods: {
    save() {
      this.$axios
        .patch(
          `/stores/${this.store.id}/rate_rules`,
          this.store.checkout_settings.rate_rules
        )
        .then((r) => (this.success_messages = `Successfully saved: ${r.data}`))
        .catch((r) => (this.error_messages = r.response.data.detail))
    },
    testRates() {
      if (this.$refs.form.validate()) {
        this.testResults = ""
        this.$axios
          .get(`/stores/${this.store.id}/rates?currencies=${this.currencies}`)
          .then((r) => (this.testResults = r.data.rates))
      }
    },
  },
}
</script>
