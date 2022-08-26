<template>
  <Default>
    <v-row>
      <v-col md="3" cols="12">
        <info-card link="/wallets" :texts="walletTexts" />
      </v-col>
      <v-col v-for="card in cards" :key="card.id" md="3" cols="12">
        <InfoCard :texts="card.texts" :link="card.link" />
      </v-col>
    </v-row>
    <slot />
  </Default>
</template>
<script>
import Default from "@/layouts/default"
import InfoCard from "@/components/InfoCard"
export default {
  components: {
    Default,
    InfoCard,
  },
  data() {
    return {
      cards: [
        {
          texts: [
            {
              header: "Notifications",
              key: "notifications",
              value: "",
            },
            {
              header: "Total notifications:",
              key: "notifications",
              value: "notifications created",
            },
          ],
          link: "/notifications",
        },
        {
          texts: [
            {
              header: "Templates",
              key: "templates",
              value: "",
            },
            {
              header: "Total templates:",
              key: "templates",
              value: "templates created",
            },
          ],
          link: "/templates",
        },
        {
          texts: [
            {
              header: "Stores",
              key: "stores",
              value: "",
            },
            {
              header: "Total stores:",
              key: "stores",
              value: "stores created",
            },
          ],
          link: "/stores",
        },
        {
          texts: [
            {
              header: "Discounts",
              key: "discounts",
              value: "",
            },
            {
              header: "Total discounts:",
              key: "discounts",
              value: "discounts created",
            },
          ],
          link: "/discounts",
        },
        {
          texts: [
            {
              header: "Total products",
              key: "products",
              value: "",
            },
            {
              header: "Total products created:",
              key: "products",
              value: "product in stores",
            },
          ],
          link: "/products",
        },
        {
          texts: [
            {
              header: "Total invoices",
              key: "invoices",
              value: "",
            },
            {
              header: "Total invoices created:",
              key: "invoices",
              value: "invoices in stores",
            },
          ],
          link: "/invoices",
        },
        {
          texts: [
            {
              header: "Total payouts",
              key: "payouts",
              value: "",
            },
            {
              header: "Total payouts created:",
              key: "payouts",
              value: "payouts in stores",
            },
          ],
          link: "/payouts",
        },
      ],
    }
  },
  computed: {
    walletTexts() {
      return [
        {
          header: "Wallets Balance",
          customText: this.$auth.user.settings.fetch_balance
            ? null
            : "Disabled in settings",
          mainValue: this.$store.state.balance || 0,
          value: this.$auth.user
            ? this.$auth.user.settings.balance_currency
            : 0,
        },
        {
          header: "Total wallets connected:",
          key: "wallets",
          value: "wallets connected",
        },
      ]
    },
  },
  beforeCreate() {
    if (process.client) {
      this.$store.dispatch("syncStats")
    }
  },
}
</script>
