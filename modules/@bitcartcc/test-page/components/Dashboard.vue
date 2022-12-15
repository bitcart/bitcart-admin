<template>
  <div style="display: contents">
    <v-col md="3" cols="12">
      <info-card link="/wallets" :texts="walletTexts" />
    </v-col>
    <v-col v-for="card in cards" :key="card.id" md="3" cols="12">
      <InfoCard :texts="card.texts" :link="card.link" />
    </v-col>
  </div>
</template>

<script>
import InfoCard from "@/components/InfoCard"
export default {
  components: { InfoCard },
  props: {
    cards: {
      type: Array,
      required: true,
    },
    walletTexts: {
      type: Array,
      required: true,
    },
  },
  mounted() {
    console.log(this.cards)
  },
}
</script>
