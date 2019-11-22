<template>
  <v-container>
    <v-snackbar
      v-model="showSnackbar"
      color="success"
      bottom
      :timeout="2500"
    >
      <v-icon>mdi-content-copy</v-icon>
      Successfully copied to clipboard!
    </v-snackbar>
    <v-card class="accent--border" raised="raised" :loading="loading && !errorText">
      <div v-if="loading">
        <v-card-text v-if="errorText" class="d-flex justify-center">
          {{ errorText }}
        </v-card-text>
        <v-card-text v-else class="d-flex justify-center">
          Loading...
        </v-card-text>
      </div>
      <div v-else>
        <v-card-title class="justify-center">
          {{ product.title }}
        </v-card-title>
        <div v-if="showCheckout">
          <div class="d-flex justify-center">
            <qrcode tag="v-img" :options="{width: 500}" class="image-preview" :value="invoice.bitcoin_url" />
          </div>
          <div class="d-flex justify-center">
            <p>
              {{ invoice.bitcoin_address }}<br>
              Waiting for {{ invoice.amount }} BTC payment
            </p>
          </div>
          <v-card-actions class="justify-center">
            <v-btn class="justify-center" color="primary" @click="copyText(invoice.bitcoin_url)">
              <v-icon left="left">
                mdi-content-copy
              </v-icon><span>Copy</span>
            </v-btn>
          </v-card-actions>
        </div>
        <div v-else>
          <div class="d-flex justify-center success-circle success-icon">
            <v-icon class="d-flex justify-center" color="green">
              mdi-check
            </v-icon>
          </div>
          <div class="d-flex justify-center">
            This invoice has been paid
          </div>
        </div>
      </div>
    </v-card>
  </v-container>
</template>

<script>
export default {
  auth: false,
  data () {
    return {
      showSnackbar: false,
      showCheckout: true,
      invoice: {},
      product: {},
      loading: true,
      errorText: ''
    }
  },
  mounted () {
    const self = this
    this.$axios.get(`/invoices/${this.$route.params.id}`).then(function (resp) {
      self.invoice = resp.data
      if (resp.data.status === 'complete') {
        self.showCheckout = false
        self.loading = false
        return
      }
      self.$axios.get(`/products/${resp.data.products[0]}`).then(function (resp1) {
        self.product = resp1.data
        self.loading = false
        let url = self.combineURLs(`${self.$store.state.env.URL}`, `/ws/invoices/${self.$route.params.id}`)
        url = url.replace(`http://`, `ws://`).replace(`https://`, `wss://`)
        const websocket = new WebSocket(url)
        websocket.onmessage = function (event) {
          const status = JSON.parse(event.data).status
          if (status === 'complete') {
            self.showCheckout = false
          }
        }
      }).catch(err => (self.errorText = err))
    }).catch(err => (self.errorText = err))
  },
  methods: {
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
  border: 2px solid #13e5b6;
}
.success-icon {
  animation: checkbounce 750ms linear both;
}
</style>
