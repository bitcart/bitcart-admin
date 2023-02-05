<template>
  <div>
    <p>
      The merchant has created a refund for this invoice. Refund amount is
      {{ refund.amount }} {{ refund.currency }}.
    </p>
    <v-text-field
      v-if="!refund.payout_status"
      v-model="destination"
      label="Your address"
      :error-messages="errors"
      class="pb-2"
    />
    <div v-else>
      Refund submitted. Payment status: {{ refund.payout_status }}
      <div v-if="refund.tx_hash">
        Transaction hash:
        <a
          v-if="getTxURL()"
          :href="`${getTxURL()}`"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          {{ refund.tx_hash }}
        </a>
        <template v-else>{{ refund.tx_hash }}</template>
      </div>
    </div>
    <v-btn v-if="!refund.payout_status" color="primary" @click="submitRefund"
      >Submit refund</v-btn
    >
  </div>
</template>

<script>
export default {
  asyncData({ store, route, error, app }) {
    if (!route.params.id) {
      return error({ statusCode: 404, text: "Refund not found" })
    }
    return app.$axios
      .get(`/invoices/refunds/${route.params.id}`)
      .then((r) => {
        return {
          refund: r.data,
        }
      })
      .catch((e) => {
        error({ statusCode: 404, text: "Refund not found" })
      })
  },
  data() {
    return {
      destination: "",
      errors: [],
    }
  },
  methods: {
    submitRefund() {
      this.errors = []
      this.$axios
        .post(`/invoices/refunds/${this.refund.id}/submit`, {
          destination: this.destination,
        })
        .then((r) => {
          this.refund = r.data
        })
        .catch((e) => {
          if (e?.response?.data?.detail) this.errors = [e.response.data.detail]
        })
    },
    getTxURL() {
      return this.$utils.getTxURL.call(
        this,
        this.refund.tx_hash,
        this.refund.wallet_currency
      )
    },
  },
}
</script>
