<template>
  <div>
    <v-btn
      color="primary"
      :disabled="insufficientBalance"
      :loading="loading"
      @click="connect"
    >
      <template v-if="insufficientBalance">Insuficient Balance</template>
      <template v-else>
        <v-img
          :src="`${STATIC_PATH}/walletconnect.svg`"
          height="30"
          width="30"
          class="mr-2"
        />Pay with WalletConnect
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
      address: "",
    }
  },
  head() {
    return {
      script: [
        {
          src: `https://unpkg.com/@walletconnect/web3-provider`,
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
    async connect() {
      // eslint-disable-next-line
      const provider = new window.WalletConnectProvider.default({
        rpc: {
          [this.method.chain_id]:
            this.$store.state.policies.rpc_urls[this.method.currency],
        },
        chainId: this.method.chain_id,
      })
      provider.on("accountsChanged", (accounts) => {
        this.address = accounts[0]
      })
      //  Enable session (triggers QR Code modal)
      window?.localStorage?.removeItem("walletconnect")
      try {
        await provider.enable()
      } catch (error) {
        return this.showError(error.message)
      }
      //  Create Web3
      this.web3 = new window.Web3(provider)

      await this.$utils.connectToWallet.call(
        this,
        "walletconnect",
        () => this.address,
        this.updateAddress
      )
    },
  },
}
</script>
