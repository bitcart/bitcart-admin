<template>
  <div>
    <v-btn color="primary" @click="connectToMetamask"
      ><v-img src="/metamask.svg" height="40" width="40" />Connect to
      MetaMask</v-btn
    >
    <v-snackbar v-model="showSnackbar" :timeout="2500" color="error" bottom>
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
    method: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      currentAddress: null,
      showSnackbar: false,
      snackbarText: "",
    }
  },
  head() {
    return {
      script: [
        {
          src: `https://unpkg.com/@metamask/detect-provider/dist/detect-provider.min.js`,
        },
        {
          src: `https://unpkg.com/web3@latest/dist/web3.min.js`,
        },
      ],
    }
  },
  methods: {
    showError(text) {
      this.snackbarText = text
      this.showSnackbar = true
    },
    async connectToMetamask() {
      if (window.ethereum) {
        this.web3 = new window.Web3(window.ethereum)
        const chainid = await this.web3.eth.getChainId()
        console.log(chainid, this.method.chain_id)
        if (chainid !== this.method.chain_id)
          return this.showError(
            "This method is not available on this network. Please select another network."
          )
        console.log(chainid)
        window.ethereum
          .request({ method: "eth_requestAccounts" })
          .then((accounts) => {
            this.currentAddress = accounts[0]

            console.log(this.currentAddress)
          })
          .catch((error) => {
            console.log(error)
          })
      } else {
        console.log("Please install MetaMask")
      }
    },
  },
}
</script>
