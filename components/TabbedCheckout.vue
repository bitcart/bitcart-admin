<template>
  <v-container>
    <div v-if="checkoutPage">
      <v-img contain max-height="40" src="/checkout-logo.png" class="mb-2">
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
        <p class="my-auto px-3 white--text subtitle-2">
          {{
            expiringSoon ? "Invoice expiring soon..." : "Awaiting payment..."
          }}
        </p>
        <v-spacer />
        <p class="white--text my-auto subtitle-2 px-3">
          {{ timerText }}
        </p>
      </v-progress-linear>
    </div>
    <v-tabs v-if="showProp && !noTabs" v-model="selectedTab" show-arrows>
      <v-tab v-for="(item, key) in tabitem" :key="key">
        {{ key }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-if="showProp && !noTabs" v-model="selectedTab">
      <v-tab-item v-for="(itemv, key) in tabitem" :key="key">
        <v-card>
          <v-card-title class="justify-center">
            {{ checkoutPage && !isEmpty(product) ? product.name : "QR code" }}
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row class="d-flex justify-center">
                <div class="d-flex justify-center">
                  <qrcode
                    :options="{ width: 240 }"
                    :value="itemv.payment_url"
                    tag="v-img"
                  />
                </div>
                <v-col cols="12">
                  <p class="mt-6 mb-0 title">
                    1 {{ itemv.currency.toUpperCase() }} =
                    {{
                      (invoice.price / itemv.amount)
                        .toFixed(8)
                        .replace(/0{0,7}$/, "")
                    }}
                    {{ invoice.currency }}<br />
                    {{ itemv.payment_address }}<br />
                    Waiting for {{ itemv.amount }}
                    {{ itemv.currency.toUpperCase() }} payment
                  </p>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn
              class="justify-center"
              color="primary"
              @click="copyText(itemv.payment_url, 'URL')"
            >
              <v-icon left="left"> mdi-content-copy </v-icon><span>Copy</span>
            </v-btn>
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
      </v-tab-item>
    </v-tabs-items>
    <v-card v-if="showProp && noTabs" class="accent--border" raised="raised">
      <v-card-title class="justify-center"> Empty </v-card-title>
      <v-card-text class="d-flex justify-center">
        No payment methods available
      </v-card-text>
    </v-card>
    <v-snackbar v-model="showSnackbar" :timeout="2500" color="success" bottom>
      <v-icon>mdi-content-copy</v-icon>
      Successfully copied {{ whatToCopy }} to clipboard!
    </v-snackbar>
  </v-container>
</template>

<script>
import CloseButton from "@/components/CloseButton"
export default {
  components: {
    CloseButton,
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
    tabitem: {
      type: Object,
      default() {
        return {}
      },
    },
    invoice: {
      type: Object,
      default() {
        return {}
      },
    },
    product: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      selectedTab: null,
      whatToCopy: "ID",
      showSnackbar: false,
      endDate: new Date(),
      expirationPercentage: 0,
      timerText: "",
    }
  },
  computed: {
    noTabs() {
      return this.isEmpty(this.tabitem)
    },
    expiringSoon() {
      return this.expirationPercentage >= 75
    },
    mainProgressColor() {
      return this.expiringSoon ? "red darken-2" : "green darken-2"
    },
    backgroundProgressColor() {
      return this.expiringSoon ? "red" : "green"
    },
  },
  watch: {
    showProp(val) {
      if (!val) {
        this.selectedTab = null
      }
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
    copyToClipboard(text) {
      const el = document.createElement("textarea")
      el.addEventListener("focusin", (e) => e.stopPropagation())
      el.value = text
      el.setAttribute("readonly", "")
      el.style.position = "absolute"
      el.style.left = "-9999px"
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    },
    copyText(text, desc) {
      this.copyToClipboard(text)
      this.whatToCopy = desc || "ID"
      this.showSnackbar = true
    },
  },
}
</script>
