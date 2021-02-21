<template>
  <v-row>
    <v-col
      v-for="(card, index) in cards"
      :key="index"
      cols="3"
      class="mx-6"
      :class="getClass(index)"
    >
      <v-card height="100%" @click.native="$emit('input', card.id)">
        <v-card-text>
          <v-icon size="50px" class="mb-5 d-flex justify-center">
            {{ card.icon }}
          </v-icon>
          <p class="text-h4 font-weight-medium text-center">{{ card.title }}</p>
          <v-card-subtitle class="text-h6 font-weight-regular">
            {{ card.text }}
          </v-card-subtitle>
        </v-card-text>
        <v-icon v-if="card.id === value" class="check-icon"> mdi-check </v-icon>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      cards: [
        {
          title: "A remote machine",
          text:
            "A remote machine that you can provide the SSH connectivity details to so that the configurator automagically sets it up for you",
          icon: "mdi-remote",
          id: "Remote",
        },
        {
          title: "Manual",
          text:
            "We'll generate a bash script that you run on the server without ever providing us access.",
          icon: "mdi-console",
          id: "Manual",
        },
        {
          title: "Current instance",
          text: "Change current instance's settings",
          icon: "mdi-cogs",
          id: "Current",
        },
      ],
    }
  },
  methods: {
    getClass(index) {
      if (index === 0) return "ml-auto"
      if (index === this.cards.length - 1) return "mr-auto"
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
