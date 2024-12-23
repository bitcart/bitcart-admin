<template>
  <v-row class="justify-center">
    <v-col>
      <v-img
        class="mt-8"
        max-height="80"
        max-width="80"
        contain
        :src="`${STATIC_PATH}/icon.svg`"
      />
      <v-card-title
        v-icon="`${STATIC_PATH}/icon.svg`"
        class="subheading font-weight-bold"
      >
        Bitcart AI
      </v-card-title>

      <v-divider></v-divider>

      <v-list dense>
        <v-list-item>
          <v-list-item-content class="grey--text text--darken"
            ><strong>Invoice ID</strong></v-list-item-content
          >
          <v-list-item-content class="align-end">
            {{ invoice.id }}
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content class="grey--text text--darken"
            ><strong>Order ID</strong></v-list-item-content
          >
          <v-list-item-content class="align-end">
            {{ invoice.order_id }}
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content class="grey--text text--darken"
            ><strong>Store ID</strong></v-list-item-content
          >
          <v-list-item-content class="align-end">
            {{ invoice.store_id }}
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content class="grey--text text--darken"
            ><strong>Total Amount</strong></v-list-item-content
          >
          <v-list-item-content class="align-end">
            {{ invoice.price }}
            {{ invoice.currency }}
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content class="grey--text text--darken"
            ><strong>Sent Amount</strong></v-list-item-content
          >
          <v-list-item-content class="align-end">
            {{ invoice.sent_amount + " " + invoice.currency }}
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content class="grey--text text--darken"
            ><strong>Total Fiat</strong></v-list-item-content
          >
          <v-list-item-content class="align-end">
            {{ payment.amount + " " + payment.currency.toUpperCase() }}
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content class="grey--text text--darken"
            ><strong>Exchange Rate</strong></v-list-item-content
          >
          <v-list-item-content class="align-end">
            {{ payment.rate_str }}
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content class="grey--text text--darken"
            ><strong>Amount Due</strong></v-list-item-content
          >
          <v-list-item-content class="align-end">
            {{ invoice.sent_amount }} {{ invoice.currency }}
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content class="grey--text text--darken"
            ><strong>Date</strong></v-list-item-content
          >
          <v-list-item-content class="align-end">
            {{ invoice.paid_date.substring(0, 19).replace("T", " ") }}
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    invoice: {
      type: Object,
      required: true,
    },
  },
  computed: {
    payment() {
      return this.invoice.payments.find(
        (obj) => obj.id === this.invoice.payment_id
      )
    },
  },
}
</script>
