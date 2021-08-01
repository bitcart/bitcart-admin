<template>
  <item-data :headers="headers" :actions="actions" :url="url" :title="title">
    <template #item.lightning_enabled="{ item }">
      <v-switch :input-value="item.lightning_enabled" readonly />
    </template>
  </item-data>
</template>
<script>
import ItemData from "@/components/ItemData.vue"
export default {
  components: {
    ItemData,
  },
  layout: "dashboard",
  data() {
    return {
      headers: [
        { text: "ID", value: "id", mode: "display", copy: true },
        { text: "Name", value: "name", rules: ["required"] },
        { text: "Balance", value: "balance", mode: "display" },
        {
          text: "Currency",
          value: "currency",
          input: "autocomplete",
          url: "cryptos",
          default: "btc",
        },
        {
          text: "Xpub",
          value: "xpub",
          expand: true,
          rules: ["required"],
          help: "https://docs.bitcartcc.com/getting-started/createwallet",
          errors: { "Wallet key invalid": "Invalid xpub" },
        },
        {
          text: "Label",
          value: "label",
          help: "https://docs.bitcartcc.com/support-and-community/faq/stores-faq#how-do-i-change-my-payment-methods-name",
        },
        {
          text: "Lightning",
          value: "lightning_enabled",
          input: "switch",
          mode: "display",
        },
        { text: "Created date", value: "created", mode: "display" },
        { text: "Actions", value: "action", sortable: false },
      ],
      actions: [
        { icon: "mdi-lightning-bolt", process: this.configureLightning },
      ],
      url: "wallets",
      title: "Wallet",
    }
  },
  methods: {
    configureLightning(item, itemIndex) {
      this.$router.push(`/wallets/${item.id}/lightning`)
    },
  },
}
</script>
