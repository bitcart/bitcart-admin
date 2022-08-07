<template>
  <item-data
    ref="itemdata"
    :search.sync="search"
    :headers="headers"
    :url="url"
    :title="title"
    :custom-batch-actions="batchActions"
  >
    <template #before-toolbar>
      <search-filters :search.sync="search" :custom-filters="customFilters" />
    </template>
  </item-data>
</template>
<script>
import ItemData from "@/components/ItemData.vue"
import SearchFilters from "@/components/SearchFilters.vue"

export default {
  components: {
    ItemData,
    SearchFilters,
  },
  layout: "dashboard",
  data() {
    return {
      search: "",
      headers: [
        { text: "ID", value: "id", mode: "display", copy: true },
        {
          text: "Destination",
          value: "destination",
          rules: ["required"],
        },
        {
          text: "Amount",
          value: "amount",
          rules: ["required", "positive"],
        },
        {
          text: "Store",
          value: "store_id",
          rules: ["required"],
          input: "autocomplete",
          url: "stores",
          copy: true,
        },
        {
          text: "Wallet",
          value: "wallet_id",
          rules: ["required"],
          input: "autocomplete",
          url: "wallets",
          copy: true,
        },
        {
          text: "Currency",
          value: "currency",
          input: "autocomplete",
          url: "cryptos/fiatlist",
          body: true,
        },
        {
          text: "Notification url",
          value: "notification_url",
          help: "https://docs.bitcartcc.com/bitcartcc-basics/walkthrough#notification-url",
          rules: ["url"],
        },
        { text: "Status", value: "status", mode: "edit" },
        {
          text: "Max fee",
          value: "max_fee",
          rules: ["positive"],
        },
        {
          text: "Tx hash",
          value: "tx_hash",
          expand: true,
        },
        {
          text: "Used fee",
          value: "used_fee",
          expand: true,
        },
        { text: "Created date", value: "created", mode: "display" },
        { text: "Actions", value: "action", sortable: false },
      ],
      url: "payouts",
      title: "Payout",
      customFilters: [
        {
          title: "Unreviewed payouts",
          command: "status:pending",
        },
        {
          title: "Approved payouts",
          command: "status:approved",
        },
        {
          title: "Complete payouts",
          command: "status:complete",
        },
      ],
      batchActions: [
        {
          title: "Approve",
          command: "approve",
        },
        {
          title: "Send",
          command: "send",
        },
        {
          title: "Cancel",
          command: "cancel",
        },
      ],
    }
  },
}
</script>
