<template>
  <v-container>
    <v-tabs v-if="showProp && !noTabs" v-model="selectedTab" show-arrows>
      <v-tab v-for="(item, key) in tabitem" :key="key">
        {{ key }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-if="showProp && !noTabs" v-model="selectedTab">
      <v-tab-item
        v-for="(itemv, key) in tabitem"
        :key="key"
      >
        <v-card>
          <v-card-title class="justify-center">
            {{ checkoutPage && !isEmpty(product) ? product.name : 'QR code' }}
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row class="d-flex justify-center">
                <div class="d-flex justify-center">
                  <qrcode :options="{width: 240}" :value="itemv.payment_url" tag="v-img" />
                </div>
                <v-col cols="12">
                  <p class="mt-6 mb-0 title">
                    1 {{ itemv.currency.toUpperCase() }} = {{ (invoice.price/itemv.amount).toFixed(8).replace(/0{0,7}$/, "") }} {{ invoice.currency }}<br>
                    {{ itemv.payment_address }}<br>
                    Waiting for {{ itemv.amount }} {{ itemv.currency.toUpperCase() }} payment
                  </p>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn class="justify-center" color="primary" @click="copyText(itemv.payment_url, 'URL')">
              <v-icon left="left">
                mdi-content-copy
              </v-icon><span>Copy</span>
            </v-btn>
            <v-btn v-if="!checkoutPage" class="justify-center" color="primary" @click="checkout(invoice.id)">
              <v-icon left="left">
                mdi-open-in-new
              </v-icon><span>Open checkout</span>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-tab-item>
    </v-tabs-items>
    <v-card v-if="showProp && noTabs" class="accent--border" raised="raised">
      <v-card-title class="justify-center">
        Empty
      </v-card-title>
      <v-card-text class="d-flex justify-center">
        No payment methods available
      </v-card-text>
    </v-card>
    <v-snackbar
      v-model="showSnackbar"
      :timeout="2500"
      color="success"
      bottom
    >
      <v-icon>mdi-content-copy</v-icon>
      Successfully copied {{ whatToCopy }} to clipboard!
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  props: {
    showProp: {
      type: Boolean,
      default: true
    },
    checkoutPage: {
      type: Boolean,
      default: false
    },
    tabitem: {
      type: Object,
      default () { return {} }
    },
    invoice: {
      type: Object,
      default () { return {} }
    },
    product: {
      type: Object,
      default () { return {} }
    }
  },
  data () {
    return {
      selectedTab: null,
      whatToCopy: 'ID',
      showSnackbar: false
    }
  },
  computed: {
    noTabs () {
      return this.isEmpty(this.tabitem)
    }
  },
  watch: {
    showProp (val) {
      if (!val) { this.selectedTab = null }
    }
  },
  methods: {
    isEmpty (obj) {
      return Object.entries(obj).length === 0 && obj.constructor === Object
    },
    checkout (id) {
      if (!id) { id = this.qrItem.id }
      this.$router.push({ path: `/i/${id}` })
    },
    copyToClipboard (text) {
      const el = document.createElement('textarea')
      el.addEventListener('focusin', e => e.stopPropagation())
      el.value = text
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    },
    copyText (text, desc) {
      this.copyToClipboard(text)
      this.whatToCopy = desc || 'ID'
      this.showSnackbar = true
    }
  }
}
</script>
