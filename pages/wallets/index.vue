<template>
  <item-data :headers="headers" :actions="actions" :url="url" :title="title">
    <template #item.lightning_enabled="{ item }">
      <v-switch :input-value="item.lightning_enabled" disabled />
    </template>
  </item-data>
</template>
<script>
import ItemData from "@/components/ItemData.vue"
import JSONField from "@/components/JSONField.vue"

export default {
  components: {
    ItemData,
  },
  layout: "dashboard",
  data() {
    return {
      headers: [
        {
          text: "ID",
          value: "id",
          mode: "display",
          copy: true,
          errorText:
            "Error loading wallet. Either the currency of this wallet is no longer supported or it was disabled on the server. Check server logs for more information",
        },
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
          help: "https://docs.bitcart.ai/your-first-invoice#creating-a-wallet",
          errors: { "Wallet key invalid": "Invalid xpub" },
          dynamicText: (v, schema) => {
            if (schema && schema[v.currency]) {
              return schema[v.currency].xpub_name
            }
            return v.xpub_name || "Xpub"
          },
        },
        {
          text: "Contract",
          value: "contract",
          input: "autocomplete",
          url: (item) => `cryptos/tokens/${item.currency}`,
          component: "v-combobox",
          errors: { "Invalid contract": "Invalid contract" },
        },
        {
          text: "Label",
          value: "label",
          help: "https://docs.bitcart.ai/support-and-community/faq/stores-faq#how-do-i-change-my-payment-methods-name",
        },
        {
          text: "Hint",
          value: "hint",
          expand: true,
          help: "https://docs.bitcart.ai/support-and-community/faq/stores-faq#how-do-i-display-a-checkout-hint-for-customers",
        },
        {
          text: "Additional xpub data",
          value: "additional_xpub_data",
          input: "dynamic",
          url: "/wallets/schema",
          choice: "currency",
          default: {},
          expand: true,
          component: JSONField,
          requiredKey: "required",
          propertiesKey: "properties",
        },
        {
          text: "Lightning",
          value: "lightning_enabled",
          input: "switch",
          mode: "display",
        },
        { text: "Created date", value: "created", mode: "display" },
        {
          text: "Metadata",
          value: "metadata",
          input: "metadata",
          expand: true,
          component: JSONField,
        },
        { text: "Actions", value: "action", sortable: false },
      ],
      actions: [
        {
          icon: "mdi-lightning-bolt",
          text: "Lightning management",
          process: this.configureLightning,
        },
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
