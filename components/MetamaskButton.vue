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
          src: `https://unpkg.com/web3@latest/dist/web3.min.js`,
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
      this.loading = true
      if (window.ethereum) {
        this.web3 = new window.Web3(window.ethereum)
        const chainid = await this.web3.eth.getChainId()
        if (chainid !== this.method.chain_id)
          return this.showError(
            `Please change your network in metamask to work on the ${this.method.currency.toUpperCase()} network (chain id ${
              this.method.chain_id
            })`
          )
        try {
          await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
          return this.showError(error.message)
        }
        let balance = 0
        let divisibility = 18 // for all EVM-based blockchains
        try {
          if (!this.method.contract)
            balance = this.web3.utils.toBN(
              await this.web3.eth.getBalance(window.ethereum.selectedAddress)
            )
          else {
            const contract = new this.web3.eth.Contract(
              this.abi[this.method.currency],
              this.method.contract
            )
            balance = this.web3.utils.toBN(
              await contract.methods
                .balanceOf(window.ethereum.selectedAddress)
                .call()
            )
            divisibility = await contract.methods.decimals().call()
          }
        } catch (error) {
          return this.showError(error.message)
        }
        const requiredAmount = this.web3.utils.toBN(
          this.toWei(this.method.amount, divisibility)
        )
        this.loading = false
        if (balance.lt(requiredAmount)) this.insufficientBalance = true
        else {
          this.showMessage(true, "Connected to metamask!")
          await this.payWithMetamask()
        }
      } else {
        window.location.href = "https://metamask.io/download"
      }
    },
    async payWithMetamask() {
      this.loading = true
      let divisibility = 18
      let contract = null
      if (this.method.contract) {
        contract = new this.web3.eth.Contract(
          this.abi[this.method.currency],
          this.method.contract
        )
        divisibility = await contract.methods.decimals().call()
      }
      const requiredAmount = this.toWei(this.method.amount, divisibility)
      try {
        if (!this.method.contract) {
          // usual tx
          await this.web3.eth.sendTransaction({
            to: this.method.payment_address,
            from: window.ethereum.selectedAddress,
            value: requiredAmount,
          })
        } else {
          // contract payment
          await contract.methods
            .transfer(this.method.payment_address, requiredAmount)
            .send({ from: window.ethereum.selectedAddress })
        }
      } catch (error) {
        this.showError(error.message)
      }
    },
    toWei(ether, unit) {
      const base = new this.web3.utils.BN(10).pow(new this.web3.utils.BN(unit))
      let [whole, fraction] = ether.split(".")
      if (!whole) whole = "0"
      if (!fraction) fraction = "0"
      while (fraction.length < unit) fraction += "0"
      whole = new this.web3.utils.BN(whole)
      fraction = new this.web3.utils.BN(fraction)
      const wei = whole.mul(base).add(fraction)
      return wei.toString(10)
    },
  },
}
</script>
