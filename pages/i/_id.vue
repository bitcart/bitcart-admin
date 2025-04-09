<template>
  <v-container class="pa-0">
    <v-snackbar v-model="showSnackbar" :timeout="2500" color="success" bottom>
      <v-icon>mdi-content-copy</v-icon>
      Successfully copied to clipboard!
    </v-snackbar>
    <v-snackbar v-model="showPartial" :timeout="2500" color="info" bottom>
      Partial payment detected. Please pay in full to complete the invoice.
    </v-snackbar>
    <v-dialog
      hide-overlay
      persistent
      no-click-animation
      :value="showDialog"
      max-width="400px"
      class="my-md-12 mx-auto"
      transition="none"
      :fullscreen="$vuetify.breakpoint.mobile"
    >
      <v-card :loading="loading && !errorText" class="elevation-24">
        <div v-if="loading" :class="$route.query.modal ? 'pb-6' : 'py-6'">
          <close-button @closedialog="closeDialog" />
          <div v-if="errorText" class="text-center">
            {{ errorText ? errorText : "Loading..." }}
          </div>
        </div>
        <div v-else>
          <TabbedCheckout
            v-if="displayStatus === 'pending' || displayStatus === 'underpaid' || displayStatus === 'waiting_confirmation'"
            :checkout-page="true"
            :invoice.sync="invoice"
            :store="store"
            :underpaid="displayStatus === 'underpaid'"
            class="px-0 pb-0"
            @closedialog="closeDialog"
          />
          <v-card-text v-else class="no-overflow py-12">
            <close-button class="mt-n8" @closedialog="closeDialog" />
            <div
              :class="[colorClass(texts[displayStatus].icon), displayStatus === 'confirmed' ? 'confirming' : '']"
              class="d-flex justify-center success-circle success-icon"
            >
              <v-icon
                v-if="displayStatus !== 'confirmed'"
                :color="getIconColor(texts[displayStatus].icon)"
                class="d-flex justify-center icon-static"
              >
                {{ texts[displayStatus].icon }}
              </v-icon>
            </div>
            <div class="d-flex justify-center pt-4">
              <div class="text-subtitle-1 font-weight-bold">
                {{ texts[displayStatus].text }}
              </div>
            </div>
          </v-card-text>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import TabbedCheckout from "@/components/TabbedCheckout"
import CloseButton from "@/components/CloseButton"
export default {
  auth: false,
  components: {
    TabbedCheckout,
    CloseButton,
  },
  layout: "checkout",
  data() {
    return {
      websocket: null,
      showSnackbar: false,
      showPartial: false,
      showDialog: true,
      redirected: false,
      invoice: {},
      store: {},
      loading: true,
      errorText: "",
      texts: {
        expired: {
          icon: "mdi-close",
          text: "This invoice has expired",
        },
        invalid: {
          icon: "mdi-close",
          text: "This invoice has been marked as invalid",
        },
        waiting_confirmation: {
          icon: "mdi-clock-outline",
          text: "Payment received, awaiting confirmation...",
        },
        underpaid: {
          icon: "mdi-alert-circle-outline",
          text: "Invoice underpaid. Please send the remaining amount.",
        },
        pending: {
          icon: "",
          text: "Awaiting payment...",
        },
        confirmed: {
          icon: "mdi-check",
          text: "Payment received, awaiting confirmations...",
        },
        complete: {
          icon: "mdi-check",
          text: "This invoice has been paid",
        },
        refunded: {
          icon: "mdi-cash-refund",
          text: "This invoice has been refunded",
        },
        "": {
          icon: "mdi-close",
          text: "This invoice is invalid",
        },
      },
    }
  },
  computed: {
    displayStatus() {
      if (!this.invoice || !this.invoice.status) return 'pending'
      if (this.invoice.status === 'pending' && this.invoice.exception_status === 'paid_partial') return 'underpaid'
      if (this.invoice.status === 'paid') return 'confirmed'
      return this.invoice.status
    },
    isFinalStatus() {
      return ['complete', 'expired', 'invalid', 'refunded'].includes(this.displayStatus)
    }
  },
  watch: {
    displayStatus(newStatus) {
      if (!this.redirected && this.isFinalStatus && this.invoice.redirect_url) {
        this.redirected = true
        this.$utils.redirectTo(this.invoice.redirect_url)
      }
    }
  },
  beforeCreate() {
    this.$vuetify.theme.dark = false // dark theme unsupported here
  },
  mounted() {
    this.$axios
      .get(`/invoices/${this.$route.params.id}`)
      .then((resp) => {
        this.invoice = resp.data
        this.status = resp.data.status
        window.parent.postMessage("loaded", "*")
        this.$axios
          .get(`/stores/${resp.data.store_id}`)
          .then((resp1) => {
            this.store = resp1.data
            this.$vuetify.theme.dark =
              this.store.checkout_settings.use_dark_mode
            this.loading = false
            this.startWebsocket()
          })
          .catch((err) => (this.errorText = err))
      })
      .catch((err) => this.setError(err))
  },
  beforeDestroy() {
    if (this.websocket) {
      this.websocket.close()
    }
  },
  methods: {
    setError(err) {
      if (err.response && err.response.status === 404) {
        this.errorText = "Invoice not found"
      } else {
        this.errorText = err
      }
    },
    closeDialog() {
      this.showDialog = false
      window.parent.postMessage("close", "*") // for iframes
    },
    startWebsocket() {
      let url = this.combineURLs(
        `${this.$store.getters.apiURL}`,
        `/ws/invoices/${this.$route.params.id}`
      )
      url = url.replace("http://", "ws://").replace("https://", "wss://")
      this.websocket = new WebSocket(url)
      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        const oldStatus = this.invoice.status
        const oldSentAmount = this.invoice.sent_amount
        
        // Update invoice data
        this.invoice.status = data.status
        this.invoice.exception_status = data.exception_status
        this.invoice.sent_amount = data.sent_amount
        this.invoice.paid_currency = data.paid_currency
        this.invoice.payment_id = data.payment_id

        // Show partial payment notification if needed
        if (data.status === 'pending' && 
            data.exception_status === 'paid_partial' && 
            oldSentAmount !== data.sent_amount) {
          this.$bus.$emit("showDetails")
          this.showPartial = true
        }

        // Notify parent window of status change
        if (oldStatus !== data.status) {
          window.parent.postMessage(
            {
              invoice_id: this.invoice.id,
              status: data.status,
              exception_status: data.exception_status,
              sent_amount: data.sent_amount,
              paid_currency: data.paid_currency,
              payment_id: data.payment_id,
            },
            "*"
          )
        }
      }
    },
    colorClass(icon) {
      if (["mdi-check", "mdi-cash-refund"].includes(icon)) return "green--text"
      return "red--text"
    },
    copyText(text) {
      this.$utils.copyToClipboard(text)
      this.whatToCopy = "ID"
      this.showSnackbar = true
    },
    combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "")
        : baseURL
    },
    getIconColor(icon) {
      if (["mdi-check", "mdi-cash-refund"].includes(icon)) return "green"
      return "red"
    },
  },
}
</script>

<style lang="scss">
@import "~vuetify/src/components/VDialog/_variables.scss";

$dialog-max-height: 100%;

@import "~vuetify/src/components/VDialog/VDialog.sass";
</style>

<style scoped>
@keyframes checkbounce {
  0% {
    transform: matrix3d(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  4.7% {
    transform: matrix3d(0.45, 0, 0, 0, 0, 0.45, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  9.41% {
    transform: matrix3d(0.883, 0, 0, 0, 0, 0.883, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  14.11% {
    transform: matrix3d(1.141, 0, 0, 0, 0, 1.141, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  18.72% {
    transform: matrix3d(1.212, 0, 0, 0, 0, 1.212, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  24.32% {
    transform: matrix3d(1.151, 0, 0, 0, 0, 1.151, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  29.93% {
    transform: matrix3d(1.048, 0, 0, 0, 0, 1.048, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  35.54% {
    transform: matrix3d(0.979, 0, 0, 0, 0, 0.979, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  41.04% {
    transform: matrix3d(0.961, 0, 0, 0, 0, 0.961, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  52.15% {
    transform: matrix3d(0.991, 0, 0, 0, 0, 0.991, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  63.26% {
    transform: matrix3d(1.007, 0, 0, 0, 0, 1.007, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  85.49% {
    transform: matrix3d(0.999, 0, 0, 0, 0, 0.999, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }

  100% {
    transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.success-circle {
  border-radius: 50%;
  height: 154px;
  width: 154px;
  margin: 0 auto;
  border-width: 2px;
  border-style: solid;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-static {
  position: relative;
  z-index: 1;
}

.success-circle.confirming {
  border-style: dashed;
  animation: rotate 2s linear infinite;
}

.success-circle.confirming::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-right-color: currentColor;
  animation: rotate 2s linear infinite;
}

.green-color {
  border-color: #13e5b6;
}
.red-color {
  border-color: red;
}
.success-icon {
  animation: checkbounce 750ms linear both;
}
.no-overflow {
  overflow: hidden;
}
</style>
