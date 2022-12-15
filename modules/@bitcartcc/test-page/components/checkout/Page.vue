<template>
  <div style="display: contents">
    <close-button
      :show="$vuetify.breakpoint.mobile && !checkoutPage"
      style="background-color: #ffffff"
      @closedialog="$emit('closedialog')"
    />
    <v-card v-if="noTabs" flat>
      <v-card-title class="justify-center"> Empty </v-card-title>
      <v-card-text class="d-flex justify-center">
        No payment methods available<br />
        It probably means that there was an error on invoice creation.<br />
        Please check server logs
      </v-card-text>
    </v-card>
    <div v-else>
      <div v-if="checkoutPage">
        <UIExtensionSlot
          name="checkout_header"
          :logo-url="logoURL"
          :expiration-percentage="expirationPercentage"
          :expiring-soon="expiringSoon"
          :main-progress-color="mainProgressColor"
          :background-progress-color="backgroundProgressColor"
        >
          <v-img contain max-height="40" :src="logoURL" class="mb-2">
            <close-button @closedialog="$emit('closedialog')" />
          </v-img>
          <v-progress-linear
            :value="expirationPercentage"
            height="25"
            :color="mainProgressColor"
            :background-color="backgroundProgressColor"
            class="mx-0"
          >
            <v-progress-circular
              indeterminate
              size="18"
              color="white"
              width="3"
              class="ml-2"
            />
            <p class="my-auto px-3 white--text text-subtitle-2">
              {{
                expiringSoon
                  ? "Invoice expiring soon..."
                  : "Awaiting payment..."
              }}
            </p>
            <v-spacer />
            <p class="white--text my-auto text-subtitle-2 px-3">
              {{ timerText }}
            </p>
          </v-progress-linear>
        </UIExtensionSlot>
      </div>
      <v-list class="py-0" dense>
        <UIExtensionSlot
          name="checkout_payment_method_selection"
          :invoice="invoice"
          :currency-select-class="currencySelectClass"
          :selected-currency="selectedCurrency"
        >
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Pay with</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-menu v-model="showMenu" offset-y style="max-width: 600px">
                <template #activator="{ on, attrs }">
                  <v-list-item-title
                    class="text-subtitle-1 font-weight-light"
                    :class="currencySelectClass"
                    v-bind="attrs"
                    v-on="on"
                    >{{ itemv.name }}
                    <v-icon v-if="invoice.payments.length > 1" small
                      >mdi-chevron-down</v-icon
                    ></v-list-item-title
                  >
                </template>
                <v-list>
                  <v-list-item-group v-model="selectedCurrency" mandatory>
                    <v-list-item
                      v-for="(item, index) in invoice.payments"
                      :key="index"
                    >
                      <v-list-item-title>{{ item.name }}</v-list-item-title>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-menu>
            </v-list-item-action>
          </v-list-item>
        </UIExtensionSlot>
        <v-divider />
        <UIExtensionSlot
          name="checkout_invoice_details"
          :store="store"
          :itemv="itemv"
          :invoice="invoice"
        >
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>{{ store.name }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-title
                class="text-subtitle-1 font-weight-regular align-right"
                >{{ itemv.amount }}
                {{ itemv.symbol.toUpperCase() }}</v-list-item-title
              >
              <v-list-item-title
                class="text-caption font-weight-regular align-right"
              >
                1 {{ itemv.symbol.toUpperCase() }} =
                {{ itemv.rate_str }}
              </v-list-item-title>
            </v-list-item-action>
          </v-list-item>
          <v-row class="mt-n5" no-gutters>
            <v-btn
              icon
              x-small
              class="justify-center mx-auto"
              @click="showDetails = !showDetails"
            >
              <v-icon>{{
                showDetails ? "mdi-arrow-up" : "mdi-arrow-down"
              }}</v-icon>
            </v-btn>
          </v-row>
          <v-divider v-if="showDetails" />
          <v-list-item v-if="showDetails">
            <v-list-item-content>
              <v-list-item-title>Order amount</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-list-item-title
                class="text-subtitle-1 font-weight-regular align-right"
              >
                {{ invoice.price }}
                {{ invoice.currency }}
              </v-list-item-title>
            </v-list-item-action>
          </v-list-item>
        </UIExtensionSlot>
        <v-divider />
        <v-list-item v-if="!needEmail && !needAddress" class="ma-0 pa-0">
          <UIExtensionSlot
            name="checkout_main"
            :checkout-page="checkoutPage"
            :itemv="itemv"
            :update-payment-details="updatePaymentDetails"
            :address-updating="addressUpdating"
            :abi-cache="abiCache"
            :invoice="invoice"
          >
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
                      <p class="d-flex justify-center text-h5">
                        Choose the way to pay
                      </p>
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
                          Because we want to guarantee a smooth refund process
                          in case you want to get your money back. <br />
                          We do not accept money from Binance and other
                          exchanges, so you need to send your funds to your own
                          wallet first.<br />
                          Asking for your wallet address helps to prevent
                          careless users sending us money from exchanges which
                          often results in failed expired payments. <br />
                          Only funds sent from the specified wallet address will
                          be taken into account for your invoice.
                        </p>
                      </v-tooltip>
                      <v-text-field
                        v-model="inputPaymentAddress"
                        label="Your address"
                        :error-messages="paymentAddressErrors"
                        :rules="[rules.required]"
                      />
                    </v-card-text>
                    <v-container>
                      <v-row justify="center" class="py-1">
                        <v-btn
                          color="primary"
                          type="submit"
                          :loading="addressUpdating"
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
                      <UIExtensionSlot
                        name="checkout_payment"
                        :itemv="itemv"
                        :checkout-page="checkoutPage"
                      >
                        <v-tab-item>
                          <v-container fill-height>
                            <v-row align="center" justify="center">
                              <v-tabs
                                v-if="itemv.lightning"
                                v-model="selectedToCopy"
                                centered
                                :active-class="
                                  checkoutPage ? 'activeTab' : null
                                "
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
                                    itemv.amount.length +
                                      itemv.symbol.length +
                                      1
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
                      </UIExtensionSlot>
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
                      <v-btn text color="white" @click.stop="showPopup"
                        >^</v-btn
                      ></span
                    >
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-list-item-content>
          </UIExtensionSlot>
        </v-list-item>
        <div v-if="needEmail" class="payment-box pt-10">
          <UIExtensionSlot
            name="checkout_email_form"
            :update-email="updateEmail"
            :email-updating="emailUpdating"
          >
            <v-list-item class="ma-0 pa-0">
              <v-list-item-content class="ma-0 pa-0">
                <v-form ref="emailForm" @submit.prevent="updateEmail">
                  <v-card flat>
                    <v-card-text>
                      <p class="d-flex justify-center text-h5">
                        Contact & Refund Email
                      </p>
                      <p class="d-flex justify-center">
                        Please provide an email address below. We will contact
                        you at this address if there is an issue with your
                        payment.
                      </p>
                      <v-text-field
                        v-model="inputEmail"
                        label="Your email"
                        :rules="[rules.required, rules.email]"
                      />
                    </v-card-text>
                    <v-card-actions class="d-flex justify-center">
                      <v-btn
                        color="primary"
                        type="submit"
                        :loading="emailUpdating"
                        >Continue</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-form>
              </v-list-item-content>
            </v-list-item>
          </UIExtensionSlot>
        </div>
        <div v-else-if="needAddress" class="payment-box pt-10">
          <UIExtensionSlot
            name="checkout_address_form"
            :update-additional="updateAdditional"
            :additional-updating="additionalUpdating"
          >
            <v-list-item class="ma-0 pa-0">
              <v-list-item-content class="ma-0 pa-0">
                <v-form ref="additionalForm" @submit.prevent="updateAdditional">
                  <v-card flat>
                    <v-card-text>
                      <p class="d-flex justify-center text-h5">
                        Shipping address & notes
                      </p>
                      <p class="d-flex justify-center">
                        Please provide your shipping address below. You may
                        leave additional notes regarding your order.
                      </p>
                      <v-text-field
                        v-model="inputAddress"
                        label="Shipping address"
                        :rules="[rules.required]"
                      />
                      <v-text-field v-model="inputNotes" label="Notes" />
                    </v-card-text>
                    <v-card-actions class="d-flex justify-center">
                      <v-btn
                        color="primary"
                        type="submit"
                        :loading="additionalUpdating"
                        >Continue</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-form>
              </v-list-item-content>
            </v-list-item>
          </UIExtensionSlot>
        </div>
      </v-list>
    </div>
  </div>
</template>

<script>
import CloseButton from "@/components/CloseButton"
import DisplayField from "@/components/DisplayField"
import MetamaskButton from "@/components/MetamaskButton"
import WalletConnectButton from "@/components/WalletConnectButton"
import UIExtensionSlot from "@/components/UIExtensionSlot"
export default {
  components: {
    CloseButton,
    DisplayField,
    MetamaskButton,
    WalletConnectButton,
    UIExtensionSlot,
  },
  props: {
    checkoutPage: {
      type: Boolean,
      default: false,
    },
    invoice: {
      type: Object,
      default() {
        return {}
      },
    },
    store: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      showDetails: false,
      selectedCurrency: 0,
      selectedAction: null,
      selectedToCopy: null,
      showMenu: false,
      endDate: new Date(),
      expirationPercentage: 0,
      timerText: "",
      inputEmail: "",
      inputAddress: "",
      inputNotes: "",
      inputPaymentAddress: "",
      addressUpdating: false,
      paymentAddressErrors: [],
      rules: this.$utils.rules,
      emailUpdating: false,
      additionalUpdating: false,
      abiCache: {},
    }
  },
  computed: {
    itemv() {
      return this.invoice.payments[this.selectedCurrency]
    },
    currentCurrency() {
      return this.itemv.currency
    },
    qrValue() {
      return this.itemv.lightning && this.selectedToCopy === 1
        ? this.itemv.node_id
        : this.itemv.payment_url
    },
    noTabs() {
      return this.invoice.payments.length === 0
    },
    expiringSoon() {
      return this.expirationPercentage >= 75
    },
    mainProgressColor() {
      return this.expiringSoon ? "#d32f2f" : "#388e3c"
    },
    backgroundProgressColor() {
      return this.expiringSoon ? "red" : "green"
    },
    currencySelectClass() {
      return this.invoice.payments.length > 1
        ? { multipleCurrency: true, rounded: true }
        : {}
    },
    paymentURL() {
      return this.itemv.lightning
        ? `lightning:${this.itemv.payment_url}`
        : this.itemv.payment_url
    },
    logoURL() {
      let url = `${this.STATIC_PATH}/checkout-logo.png`
      if (
        this.store.checkout_settings &&
        this.store.checkout_settings.custom_logo_link
      )
        url = this.store.checkout_settings.custom_logo_link
      return url
    },
    showRecommendedFee() {
      return (
        this.store.checkout_settings &&
        this.store.checkout_settings.show_recommended_fee &&
        this.itemv.recommended_fee !== 0
      )
    },
    isEthPaymentMethod() {
      return this.itemv.payment_url.startsWith("ethereum:")
    },
    needEmail() {
      return (
        this.store.checkout_settings &&
        this.store.checkout_settings.email_required &&
        !this.invoice.buyer_email
      )
    },
    needAddress() {
      return (
        this.store.checkout_settings &&
        this.store.checkout_settings.ask_address &&
        !this.invoice.shipping_address
      )
    },
  },
  watch: {
    showProp(val) {
      if (!val) {
        this.selectedAction = null
        this.selectedToCopy = null
        this.selectedCurrency = 0
      }
    },
    selectedCurrency(val) {
      this.selectedAction = null
      this.selectedToCopy = null
      this.inputPaymentAddress = ""
      this.paymentAddressErrors = []
      this.fetchTokenABI()
    },
  },
  mounted() {
    this.fetchTokenABI()
    const date = new Date()
    date.setSeconds(date.getSeconds() + this.invoice.time_left)
    this.endDate = date
    this.startProgressTimer()
  },
  methods: {
    fetchTokenABI() {
      if (!this.itemv) return
      if (!(this.currentCurrency in this.abiCache)) {
        this.$axios
          .get(`/cryptos/tokens/${this.currentCurrency}/abi`)
          .then((res) => {
            this.abiCache[this.currentCurrency] = res.data
          })
      }
    },
    startProgressTimer() {
      const timeLeftS = this.endDate
        ? (this.endDate.getTime() - new Date().getTime()) / 1000
        : this.invoice.time_left
      this.expirationPercentage =
        100 - (timeLeftS / this.invoice.expiration_seconds) * 100
      this.timerText = this.updateTimerText(timeLeftS)
      if (this.expirationPercentage < 100) {
        setTimeout(this.startProgressTimer, 500)
      }
    },
    updateTimerText(timer) {
      if (timer >= 0) {
        let minutes = parseInt(timer / 60, 10)
        minutes = minutes < 10 ? "0" + minutes : minutes
        let seconds = parseInt(timer % 60, 10)
        seconds = seconds < 10 ? "0" + seconds : seconds
        return minutes + ":" + seconds
      } else {
        return "00:00"
      }
    },
    showPopup() {
      this.$emit("closedialog")
      window.bitcart.showInvoice(this.invoice.id)
    },
    checkout(id) {
      if (!id) {
        id = this.qrItem.id
      }
      this.$router.push({ path: `/i/${id}` })
    },
    updateEmail() {
      if (!this.$refs.emailForm.validate()) return
      this.emailUpdating = true
      this.$axios
        .patch(`/invoices/${this.invoice.id}/customer`, {
          buyer_email: this.inputEmail,
        })
        .then((r) => {
          this.emailUpdating = false
          this.$emit("update:invoice", {
            ...this.invoice,
            buyer_email: this.inputEmail,
          })
        })
    },
    updateAdditional() {
      if (!this.$refs.additionalForm.validate()) return
      this.additionalUpdating = true
      this.$axios
        .patch(`/invoices/${this.invoice.id}/customer`, {
          notes: this.inputNotes,
          shipping_address: this.inputAddress,
        })
        .then((r) => {
          this.additionalUpdating = false
          this.$emit("update:invoice", {
            ...this.invoice,
            notes: this.inputNotes,
            shipping_address: this.inputAddress,
          })
        })
    },
    updatePaymentDetails(address) {
      if (typeof address === "undefined") {
        if (!this.$refs.paymentSelectionForm.validate()) return
        address = this.inputPaymentAddress
      }
      this.addressUpdating = true
      this.$axios
        .patch(`/invoices/${this.invoice.id}/details`, {
          id: this.itemv.id,
          address,
        })
        .then((r) => {
          this.addressUpdating = false
          this.paymentAddressErrors = []
          const payments = this.invoice.payments
          payments[this.selectedCurrency].user_address = address
          this.$emit("update:invoice", { ...this.invoice, payments })
          // NOTE: a nasty hack to fix vuetify tabs not detecting movements
          setTimeout(() => this.$refs.tabs.onResize(), 100)
        })
        .catch((err) => {
          this.addressUpdating = false
          if (err.response && err.response.data.detail === "Invalid address") {
            this.paymentAddressErrors = ["Invalid address"]
          }
        })
    },
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
.multipleCurrency {
  border-width: 1px;
  border-style: solid;
  padding: 6px;
  overflow: auto !important;
}
.v-application.theme--light .multipleCurrency {
  border-color: rgba(0, 0, 0, 0.12);
}
.v-application.theme--dark .multipleCurrency {
  border-color: rgba(255, 255, 255, 0.12);
}
</style>
