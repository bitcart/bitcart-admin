<template>
  <v-container>
    <v-row v-for="(crypto, symbol) in cryptos" :key="symbol">
      <v-col cols="4" class="mx-auto">
        <v-card width="100%" @click.native="selectItem(symbol)">
          <v-card-text>
            <p class="text-h4 font-weight-medium text-center">
              {{ titles[symbol] }}
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
      <v-col cols="4" class="mx-auto">
        <v-card width="100%">
          <v-card-text>
            <p class="text-h4 font-weight-medium text-center">
              Add another coin
            </p>
            <v-select v-model="newCrypto" :items="Object.keys(titles)" />
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
      titles: {
        btc: "Bitcoin",
        bch: "Bitcoin Cash",
        ltc: "Litecoin",
        gzro: "Gravity",
        bsty: "Globalboost",
      },
    }
  },
  watch: {
    cryptos(v) {
      this.$emit("input", v)
    },
  },
  methods: {
    selectItem(symbol) {
      this.cryptos[symbol].enabled = !this.cryptos[symbol].enabled
    },
    isEnabled(symbol) {
      return this.cryptos[symbol].enabled
    },
    addCrypto(symbol) {
      if (!symbol) return
      this.$set(this.cryptos, symbol, {
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
  right: 2rem;
  top: 0.5rem;
  text-align: center;
}
</style>
