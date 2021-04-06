<template>
  <v-container>
    <v-row v-for="(crypto, symbol) in coins" :key="symbol">
      <v-col cols="12" md="4" class="mx-auto">
        <v-card width="100%" @click.native="selectItem(symbol)">
          <v-card-text>
            <p class="text-h4 font-weight-medium text-center">
              {{ cryptos.titles[symbol] }}
            </p>
            <v-select v-model="crypto.network" :items="networks" @click.stop />
            <v-checkbox
              v-model="crypto.lightning"
              label="Lightning"
              @click.stop
            />
          </v-card-text>
          <v-checkbox
            :input-value="isEnabled(symbol)"
            readonly
            class="check-icon"
          />
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="4" class="mx-auto">
        <v-card width="100%">
          <v-card-text>
            <p class="text-h4 font-weight-medium text-center">
              Add another coin
            </p>
            <v-select
              v-model="newCrypto"
              :items="Object.keys(cryptos.titles)"
            />
            <v-btn color="primary" @click="addCrypto(newCrypto)"> Add </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      cryptos: this.value,
      newCrypto: null,
      networks: ["mainnet", "testnet"],
    }
  },
  computed: {
    coins() {
      return this.cryptos.coins
    },
  },
  watch: {
    coins(v) {
      this.$emit("input", this.cryptos)
    },
    value(v) {
      this.cryptos = v
    },
  },
  methods: {
    selectItem(symbol) {
      this.coins[symbol].enabled = !this.coins[symbol].enabled
    },
    isEnabled(symbol) {
      return this.coins[symbol].enabled
    },
    addCrypto(symbol) {
      this.newCrypto = null // clear select
      if (!symbol) return
      this.$set(this.coins, symbol, {
        network: "mainnet",
        lightning: false,
        enabled: true,
      })
    },
  },
}
</script>

<style scoped>
.check-icon {
  font-size: 40px;
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  text-align: center;
}
</style>
