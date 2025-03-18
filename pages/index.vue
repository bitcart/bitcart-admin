<template>
  <v-container>
    <v-alert v-if="showWalletsWarning" type="warning" dismissible class="mb-4">
      You have a large number of wallets ({{ $store.state.stats.wallets }}). It
      is recommended to disable balance fetching in your profile settings for
      better performance.
    </v-alert>
    <v-row>
      <UIExtensionSlot
        name="dashboard"
        :cards="cards"
        :wallet-texts="walletTexts"
      >
        <v-col md="3" cols="12">
          <info-card link="/wallets" :texts="walletTexts" />
        </v-col>
        <v-col v-for="card in cards" :key="card.id" md="3" cols="12">
          <InfoCard :texts="card.texts" :link="card.link" />
        </v-col>
        <UIExtensionSlot
          name="info_card"
          component="v-col"
          class="col-md-3 col-12"
        />
      </UIExtensionSlot>
    </v-row>
  </v-container>
</template>

<script>
import InfoCard from "@/components/InfoCard"
import UIExtensionSlot from "@/components/UIExtensionSlot"
export default {
  components: {
    InfoCard,
    UIExtensionSlot,
  },
  layout: "dashboard",
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
    showWalletsWarning() {
      return (
        this.$store.state.stats.wallets >= 100 &&
        this.$auth.user &&
        this.$auth.user.settings.fetch_balance
      )
    },
    walletTexts() {
      const fetchBalanceText = this.$auth.user
        ? this.$auth.user.settings.fetch_balance
          ? null
          : "Disabled in settings"
        : null
      return [
        {
          header: "Wallets Balance",
          customText: fetchBalanceText,
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
}
</script>
