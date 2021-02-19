<template>
  <v-row>
    <v-col
      v-for="(card, index) in cards"
      :key="index"
      cols="3"
      :class="getClass(index)"
    >
      <v-card
        height="100%"
        class="pb-6"
        @click.native="selectItem(card.service)"
      >
        <v-card-text>
          <p class="text-h4 font-weight-medium text-center">{{ card.title }}</p>
          <v-card-subtitle
            class="text-h6 font-weight-regular"
            style="white-space: pre-wrap"
            v-text="card.text"
          />
        </v-card-text>
        <v-card-actions class="justify-center card-actions">
          <v-btn color="primary" target="_blank" :href="card.docs">Docs</v-btn>
        </v-card-actions>
        <v-icon v-if="isEnabled(card.service)" class="check-icon">
          mdi-check
        </v-icon>
      </v-card>
    </v-col>
  </v-row>
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
    const dt = {
      services: this.value,
      cards: [
        {
          title: "Tor support",
          text:
            "Enables Tor and hidden services support.\nMakes all the public-facing services run under Tor,\nmaking it possible to run BitcartCC in complex network conditions or without a domain",
          docs: "https://docs.bitcartcc.com/guides/tor",
          service: "tor",
        },
      ],
    }
    for (const card of dt.cards) {
      if (!(card.service in dt.services))
        this.$set(dt.services, card.service, false)
    }
    return dt
  },
  methods: {
    getClass(index) {
      let classV = "mx-6"
      if (this.cards.length === 1) classV = "mx-auto"
      if (this.cards.length > 1 && index === 0) classV += " ml-auto"
      if (this.cards.length > 1 && index === this.cards.length - 1)
        classV += " mr-auto"
      return classV
    },
    selectItem(service) {
      this.services[service] = !this.services[service]
    },
    isEnabled(service) {
      return this.services[service]
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
.card-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
