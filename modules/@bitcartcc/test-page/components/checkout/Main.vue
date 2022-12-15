<template>
  <div style="display: contents">
    <v-list-item
      v-if="
        checkoutPage &&
        (isEthPaymentMethod || itemv.currency === 'trx') &&
        !itemv.user_address
      "
      class="ma-0 pa-0"
    >
      <v-list-item-content class="ma-0 pa-0">
        <v-form
          ref="paymentSelectionForm"
          @submit.prevent="updatePaymentDetails()"
        >
          <v-card flat>
            <v-card-text>
              <p class="d-flex justify-center text-h5">Choose the way to pay</p>
              <p class="d-flex justify-center">
                Enter the address you will send from
              </p>
              <v-tooltip bottom class="ma-0 pa-0">
                <template #activator="{ on, attrs }">
                  <p
                    class="d-flex justify-center blue--text"
                    v-bind="attrs"
                    style="text-decoration: dashed underline !important"
                    v-on="on"
                  >
                    Why are we asking for your wallet address?
                  </p>
                </template>
                <p class="ma-0 pa-0">
                  Because we want to guarantee a smooth refund process in case
                  you want to get your money back. <br />
                  We do not accept money from Binance and other exchanges, so
                  you need to send your funds to your own wallet first.<br />
                  Asking for your wallet address helps to prevent careless users
                  sending us money from exchanges which often results in failed
                  expired payments. <br />
                  Only funds sent from the specified wallet address will be
                  taken into account for your invoice.
                </p>
              </v-tooltip>
              <v-text-field
                :value="inputPaymentAddress"
                label="Your address"
                :error-messages="paymentAddressErrors"
                :rules="[rules.required]"
                @input="$emit('update:inputPaymentAddress', $event)"
              />
            </v-card-text>
            <v-container>
              <v-row justify="center" class="py-1">
                <v-btn color="primary" type="submit" :loading="addressUpdating"
                  >Continue with address</v-btn
                >
              </v-row>
              <v-row justify="center" class="py-1">
                <metamask-button
                  v-if="$device.isDesktop && isEthPaymentMethod"
                  :abi="abiCache"
                  :update-address="updatePaymentDetails"
                  :method="itemv"
                />
              </v-row>
              <v-row justify="center" class="py-1">
                <wallet-connect-button
                  v-if="$device.isDesktop && isEthPaymentMethod"
                  :method="itemv"
                  :update-address="updatePaymentDetails"
                  :abi="abiCache"
                />
              </v-row>
            </v-container>
          </v-card>
        </v-form>
      </v-list-item-content>
    </v-list-item>
    <v-list-item-content class="ma-0 pa-0">
      <v-card class="ma-0 pa-0">
        <v-card-text class="ma-0 pa-0">
          <v-container class="ma-0 pa-0">
            <v-tabs
              ref="tabs"
              v-model="selectedAction"
              centered
              grow
              :active-class="checkoutPage ? 'activeTab' : null"
              :color="checkoutPage ? 'success' : null"
            >
              <v-tab>Scan</v-tab>
              <v-tab>Copy</v-tab>
            </v-tabs>
            <v-divider />
            <v-tabs-items v-model="selectedAction" class="payment-box">
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
                        getAmountClass(
                          itemv.amount.length + itemv.symbol.length + 1
                        )
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
            </v-tabs-items>
          </v-container>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            v-if="!checkoutPage"
            class="justify-center"
            color="primary"
            @click="checkout(invoice.id)"
          >
            <v-icon left="left"> mdi-open-in-new </v-icon
            ><span
              >Open checkout
              <v-btn text color="white" @click.stop="showPopup">^</v-btn></span
            >
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-list-item-content>
  </div>
</template>

<script>
import DisplayField from "@/components/DisplayField"
import MetamaskButton from "@/components/MetamaskButton.vue"
import WalletConnectButton from "@/components/WalletConnectButton.vue"
export default {
  components: {
    DisplayField,
    MetamaskButton,
    WalletConnectButton,
  },
  props: {
    invoice: {
      type: Object,
      required: true,
    },
    store: {
      type: Object,
      required: true,
    },
    checkoutPage: {
      type: Boolean,
      default: false,
    },
    itemv: {
      type: Object,
      required: true,
    },
    addressUpdating: {
      type: Boolean,
      default: false,
    },
    abiCache: {
      type: Object,
      required: true,
    },
    updatePaymentDetails: {
      type: Function,
      required: true,
    },
    paymentAddressErrors: {
      type: Array,
      required: true,
    },
    inputPaymentAddress: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      selectedAction: null,
      rules: this.$utils.rules,
    }
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
  watch: {
    itemv(v) {
      console.log("HEREE", v)
      setTimeout(
        () =>
          this.$emit(
            "update:paymentSelectionFormRef",
            this.$refs.paymentSelectionForm
          ),
        100
      )
    },
  },
  mounted() {
    this.$emit("update:tabsRef", this.$refs.tabs)
  },
  methods: {
    getAmountClass(textLen) {
      if (textLen <= 25) return { "text-h5": true }
      else return { "text-h6": true, "font-weight-regular": true }
    },
    checkout(id) {
      if (!id) {
        id = this.qrItem.id
      }
      this.$router.push({ path: `/i/${id}` })
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
