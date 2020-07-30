<template>
  <v-container>
    <v-snackbar
      v-model="showSnackbar"
      :timeout="2500"
      color="success"
      bottom
    >
      <v-icon>mdi-content-copy</v-icon>
      Successfully copied to clipboard!
    </v-snackbar>
    <v-card :loading="loading && !errorText" width="500px" class="accent--border mx-auto my-12" raised margin>
      <div v-if="loading">
        <v-card-text v-if="errorText" class="d-flex justify-center">
          {{ errorText }}
        </v-card-text>
        <v-card-text v-else class="d-flex justify-center">
          Loading...
        </v-card-text>
      </div>
      <div v-else>
        <TabbedCheckout v-if="status === 'Pending' || status === 'active'" :checkout-page="true" :tabitem="invoice.payments" :invoice="invoice" :product="product" />
        <div v-else>
          <div :class="colorClass(texts[status].icon)" class="d-flex justify-center success-circle success-icon">
            <v-icon :color="texts[status].icon === 'mdi-check' ? 'green' : 'red'" class="d-flex justify-center">
              {{ texts[status].icon }}
            </v-icon>
          </div>
          <div class="d-flex justify-center">
            {{ texts[status].text }}
          </div>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import TabbedCheckout from '@/components/TabbedCheckout'
export default {
  auth: false,
  components: {
    TabbedCheckout
  },
  data () {
    return {
      showSnackbar: false,
      status: 'Pending',
      invoice: {},
      product: {},
      loading: true,
      errorText: '',
      texts: {
        expired: {
          icon: 'mdi-close',
          text: 'This invoice has expired'
        },
        complete: {
          icon: 'mdi-check',
          text: 'This invoice has been paid'
        },
        Failed:
        {
          icon: 'mdi-close',
          text: 'This invoice has failed'
        },
        Invalid:
        {
          icon: 'mdi-close',
          text: 'This invoice is invalid'
        },
        '': {
          icon: 'mdi-close',
          text: 'This invoice is invalid'
        }
      }
    }
  },
  mounted () {
    this.$axios.get(`/invoices/${this.$route.params.id}`).then((resp) => {
      this.invoice = resp.data
      this.status = resp.data.status
      this.loading = false
      if (resp.data.products.length > 0) {
        this.$axios.get(`/products/${resp.data.products[0]}`).then((resp1) => {
          this.product = resp1.data
          this.loading = false
          this.startWebsocket()
        }).catch(err => (this.errorText = err))
      } else { this.startWebsocket() }
    }).catch(err => (this.errorText = err))
  },
  methods: {
    startWebsocket () {
      let url = this.combineURLs(`${this.$store.getters.apiURL}`, `/ws/invoices/${this.$route.params.id}?token=${this.$auth.getToken('local').replace('Bearer ', '')}`)
      url = url.replace('http://', 'ws://').replace('https://', 'wss://')
      const websocket = new WebSocket(url)
      websocket.onmessage = (event) => {
        const status = JSON.parse(event.data).status
        if (status === 'complete' && this.invoice.redirect_url) { window.location = this.invoice.redirect_url }
        this.status = status
      }
    },
    colorClass (icon) {
      return { 'green-color': icon === 'mdi-check', 'red-color': icon !== 'mdi-check' }
    },
    copyToClipboard (text) {
      const el = document.createElement('textarea')
      el.value = text
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    },
    copyText (text) {
      this.copyToClipboard(text)
      this.whatToCopy = 'ID'
      this.showSnackbar = true
    },
    combineURLs (baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL
    }
  }
}
</script>

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
.success-circle {
  border-radius: 50%;
  height: 154px;
  width: 154px;
  margin: 0 auto;
  border-width: 2px;
  border-style: solid;
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
</style>
