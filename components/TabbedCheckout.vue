<template>
  <v-container v-if="showProp">
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
              expiringSoon ? "Invoice expiring soon..." : "Awaiting payment..."
            }}
          </p>
          <v-spacer />
          <p class="white--text my-auto text-subtitle-2 px-3">
            {{ timerText }}
          </p>
        </v-progress-linear>
      </div>
      <v-list class="py-0" dense>
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
                  >{{ itemv.name }}</v-list-item-title
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
        <v-divider />
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>{{ store.name }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-list-item-title
              class="text-subtitle-1 font-weight-regular align-right"
              >{{ itemv.amount }}
              {{ itemv.currency.toUpperCase() }}</v-list-item-title
            >
            <v-list-item-title
              class="text-caption font-weight-regular align-right"
            >
              1 {{ itemv.currency.toUpperCase() }} =
              {{ itemv.rate_str }}
            </v-list-item-title>
          </v-list-item-action>
        </v-list-item>
        <v-divider />
        <v-list-item class="ma-0 pa-0">
          <v-list-item-content class="ma-0 pa-0">
            <v-card class="ma-0 pa-0">
              <v-card-text class="ma-0 pa-0">
                <v-container class="ma-0 pa-0">
                  <v-tabs
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
                  <v-tabs-items
                    v-model="selectedAction"
                    class="full-height-tab"
                  >
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
                          <v-btn color="primary" :href="paymentURL"
                            >Open in wallet</v-btn
                          >
                        </v-row>
                        <v-row v-if="showRecommendedFee" justify="center">
                          Recommended fee: {{ itemv.recommended_fee }} sat/byte
                        </v-row>
                      </v-container>
                    </v-tab-item>
                    <v-tab-item>
                      <v-card flat class="pa-0 ma-0">
                        <v-card-text>
                          <p class="d-flex justify-center">Amount</p>
                          <p class="text-h4 d-flex justify-center">
                            {{ itemv.amount }}
                            {{ itemv.currency.toUpperCase() }}
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
                    <v-btn text color="white" @click.stop="showPopup"
                      >^</v-btn
                    ></span
                  >
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
  </v-container>
</template>

<script>
import CloseButton from "@/components/CloseButton"
import DisplayField from "@/components/DisplayField"
export default {
  components: {
    CloseButton,
    DisplayField,
  },
  props: {
    showProp: {
      type: Boolean,
      default: true,
    },
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
      selectedCurrency: 0,
      selectedAction: null,
      selectedToCopy: null,
      showMenu: false,
      endDate: new Date(),
      expirationPercentage: 0,
      timerText: "",
    }
  },
  computed: {
    itemv() {
      return this.invoice.payments[this.selectedCurrency]
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
    },
  },
  mounted() {
    const date = new Date()
    date.setSeconds(date.getSeconds() + this.invoice.time_left)
    this.endDate = date
    this.startProgressTimer()
  },
  methods: {
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
    isEmpty(obj) {
      return Object.entries(obj).length === 0 && obj.constructor === Object
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
.v-tabs-items.full-height-tab .v-window-item {
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
}
.v-application.theme--light .multipleCurrency {
  border-color: rgba(0, 0, 0, 0.12);
}
.v-application.theme--dark .multipleCurrency {
  border-color: rgba(255, 255, 255, 0.12);
}
</style>
