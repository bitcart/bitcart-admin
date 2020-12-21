<template>
  <item-data :headers="headers" :url="url" :title="title" />
</template>
<script>
import ItemData from "@/components/ItemData.vue"
export default {
  layout: "dashboard",
  components: {
    ItemData,
  },
  data() {
    return {
      headers: [
        { text: "ID", value: "id", mode: "display" },
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
        { text: "Created date", value: "created", mode: "display" },
        { text: "Actions", value: "action", sortable: false },
      ],
      url: "wallets",
      title: "Wallet",
    }
  },
}
</script>
