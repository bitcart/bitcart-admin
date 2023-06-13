<template>
  <div>
    <v-btn
      color="primary"
      :disabled="insufficientBalance"
      :loading="loading"
      @click="connectToMetamask"
    >
      <template v-if="insufficientBalance">Insuficient Balance</template>
      <template v-else>
        <v-img :src="`${STATIC_PATH}/metamask.svg`" height="40" width="40" />Pay
        with MetaMask
      </template>
    </v-btn>
    <v-snackbar
      v-model="showSnackbar"
      :timeout="2500"
      :color="snackbarColor"
      bottom
    >
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>
<script>
export default {
  props: {
    abi: {
      type: Object,
      required: true,
    },
    updateAddress: {
      type: Function,
      required: true,
    },
    method: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showSnackbar: false,
      snackbarText: "",
      snackbarColor: "error",
      loading: false,
      insufficientBalance: false,
    }
  },
  head() {
    return {
      script: [
        {
          src: `https://unpkg.com/@metamask/detect-provider/dist/detect-provider.min.js`,
        },
        {
          src: `https://unpkg.com/web3@1/dist/web3.min.js`,
        },
      ],
    }
  },
  watch: {
    method(v) {
      this.insufficientBalance = false
      this.loading = false
    },
  },
  methods: {
    showMessage(ok, text) {
      this.loading = false
      this.snackbarText = text
      this.snackbarColor = ok ? "success" : "error"
      this.showSnackbar = true
    },
    showError(text) {
      this.showMessage(false, text)
    },
    async connectToMetamask() {
      if (window.ethereum) {
        this.web3 = new window.Web3(window.ethereum)
        await this.$utils.connectToWallet.call(
          this,
          "metamask",
          () => window.ethereum.selectedAddress,
          this.updateAddress
        )
      } else {
        window.location.href = "https://metamask.io/download"
      }
    },
  },
}
</script>
