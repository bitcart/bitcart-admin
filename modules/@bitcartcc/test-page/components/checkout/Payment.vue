<template>
  <div style="display: contents">
    <v-tab-item>
      <v-container fill-height>
        <v-row align="center" justify="center">
          <v-tabs
            v-if="itemv.lightning"
            v-model="selectedToCopy"
            centered
            :active-class="checkoutPage ? 'activeTab' : null"
            :color="checkoutPage ? 'success' : null"
          >
            <v-tab>Invoice</v-tab>
            <v-tab>Node Info</v-tab>
          </v-tabs>
          <qrcode
            :options="{ width: 240 }"
            :value="qrValue"
            tag="v-img"
            class="d-flex justify-center"
          />
        </v-row>
        <v-row justify="center">
          <metamask-button
            v-if="$device.isDesktop && isEthPaymentMethod"
            :abi="abiCache"
            :update-address="updatePaymentDetails"
            :method="itemv"
          />
        </v-row>
        <v-row justify="center">
          <wallet-connect-button
            v-if="$device.isDesktop && isEthPaymentMethod"
            :method="itemv"
            :update-address="updatePaymentDetails"
            :abi="abiCache"
          />
          <v-btn v-else color="primary" :href="paymentURL"
            >Open in wallet</v-btn
          >
        </v-row>
        <v-row v-if="showRecommendedFee" justify="center">
          Recommended fee:
          {{ itemv.recommended_fee }} sat/byte
        </v-row>
        <v-row v-if="itemv.hint" justify="center">
          {{ itemv.hint }}
        </v-row>
      </v-container>
    </v-tab-item>
    <v-tab-item>
      <v-card flat class="pa-0 ma-0">
        <v-card-text>
          <p class="d-flex justify-center">Amount</p>
          <p
            class="d-flex justify-center"
            :class="
              getAmountClass(itemv.amount.length + itemv.symbol.length + 1)
            "
          >
            {{ itemv.amount }}
            {{ itemv.symbol.toUpperCase() }}
          </p>
          <v-divider />
          <display-field
            :title="itemv.lightning ? 'Invoice' : 'Address'"
            :value="itemv.payment_address"
          />
          <display-field
            v-if="itemv.lightning"
            title="Node Info"
            :value="itemv.node_id"
          />
          <display-field
            v-else
            title="Payment Link"
            :value="itemv.payment_url"
          />
        </v-card-text>
      </v-card>
    </v-tab-item>
  </div>
</template>

<script>
import DisplayField from "@/components/DisplayField.vue"
import MetamaskButton from "@/components/MetamaskButton.vue"
import WalletConnectButton from "@/components/WalletConnectButton.vue"
export default {
  components: {
    DisplayField,
    MetamaskButton,
    WalletConnectButton,
  },
  props: {
    itemv: {
      type: Object,
      required: true,
    },
    store: {
      type: Object,
      required: true,
    },
    checkoutPage: {
      type: Boolean,
      required: true,
    },
    abiCache: {
      type: Object,
      required: true,
    },
    updatePaymentDetails: {
      type: Function,
      required: true,
    },
  },
  computed: {
    isEthPaymentMethod() {
      return this.itemv.payment_url.startsWith("ethereum:")
    },
    showRecommendedFee() {
      return (
        this.store.checkout_settings &&
        this.store.checkout_settings.show_recommended_fee &&
        this.itemv.recommended_fee !== 0
      )
    },
    paymentURL() {
      return this.itemv.lightning
        ? `lightning:${this.itemv.payment_url}`
        : this.itemv.payment_url
    },
    qrValue() {
      return this.itemv.lightning && this.selectedToCopy === 1
        ? this.itemv.node_id
        : this.itemv.payment_url
    },
  },
  methods: {
    getAmountClass(textLen) {
      if (textLen <= 25) return { "text-h5": true }
      else return { "text-h6": true, "font-weight-regular": true }
    },
  },
}
</script>

<style scoped>
.payment-box,
.v-tabs-items.payment-box .v-window-item {
  height: 400px;
  overflow-y: auto;
}
.v-application.theme--light .activeTab {
  background: #f5f5f5;
}
.v-application.theme--dark .activeTab {
  background: #424242;
}
.v-list-item__title.align-right {
  align-self: flex-end;
}
</style>
