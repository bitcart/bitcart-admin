<template>
  <item-data
    ref="itemdata"
    :search.sync="search"
    :headers="headers"
    :url="url"
    :title="title"
    :custom-batch-actions="batchActions"
    :processbatch="processbatch"
  >
    <template #item.tx_hash="{ item }">
      <a
        v-if="getTxURL(item)"
        :href="`${getTxURL(item)}`"
        target="_blank"
        rel="noopener noreferrer nofollow"
      >
        {{ item.tx_hash }}
      </a>
      <template v-else>{{ item.tx_hash }}</template>
    </template>
    <template #before-toolbar>
      <v-col class="px-0">
        <search-filters
          :search.sync="search"
          :custom-filters="customFilters"
          title="payouts"
        />
        <v-dialog v-model="showSendDialog" max-width="700px">
          <v-card>
            <v-card-title
              >Sign payouts
              <v-btn
                icon
                target="_blank"
                href="https://docs.bitcart.ai/bitcart-basics/walkthrough#signing-payouts"
              >
                <v-icon medium> mdi-help-circle-outline </v-icon>
              </v-btn></v-card-title
            >
            <v-card-text>
              <v-container>
                <v-row v-for="(wallet, index) in wallets" :key="index">
                  <v-col cols="3">
                    <auto-complete
                      v-model="wallets[index][0]"
                      url="wallets"
                      label="Wallet"
                    />
                  </v-col>
                  <v-col cols="8">
                    <v-text-field
                      v-model="wallets[index][1]"
                      label="Private key"
                    />
                  </v-col>
                  <v-col cols="1" class="mt-4">
                    <v-btn icon @click="wallets.splice(index, 1)">
                      <tooltip-icon icon="close" text="Delete" />
                    </v-btn>
                  </v-col>
                </v-row>
                <v-row>
                  <v-btn color="primary" @click="wallets.push(['', ''])"
                    >Add private key</v-btn
                  >
                </v-row>
                <v-row>
                  <v-switch
                    v-model="batchPayouts"
                    label="Batch payouts in one transaction"
                    hide-details
                  />
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions class="justify-center pb-5">
              <v-btn color="primary" @click="sendBatchCommand"
                >Sign & broadcast</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </template>
  </item-data>
</template>
<script>
import ItemData from "@/components/ItemData.vue"
import SearchFilters from "@/components/SearchFilters.vue"
import AutoComplete from "@/components/AutoComplete.vue"
import TooltipIcon from "@/components/TooltipIcon"
import JSONField from "@/components/JSONField.vue"

export default {
  components: {
    ItemData,
    SearchFilters,
    AutoComplete,
    TooltipIcon,
  },
  layout: "dashboard",
  data() {
    return {
      search: "",
      showSendDialog: false,
      batchPayouts: false,
      wallets: [],
      headers: [
        { text: "ID", value: "id", mode: "display", copy: true },
        {
          text: "Destination",
          value: "destination",
          rules: ["required"],
          errors: {
            "Invalid destination address": "Invalid destination address",
          },
        },
        {
          text: "Amount",
          value: "amount",
          rules: ["required", "quantity"],
          hint: "Use -1 to send all available funds",
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
          component: "v-combobox",
          url: "cryptos/fiatlist",
          body: true,
        },
        {
          text: "Notification url",
          value: "notification_url",
          help: "https://docs.bitcart.ai/bitcart-basics/walkthrough#notification-url",
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
          mode: "display",
        },
        {
          text: "Used fee",
          value: "used_fee",
          expand: true,
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
  methods: {
    processbatch(command) {
      if (command === "send") {
        if (!this.showSendDialog) {
          this.wallets = []
          this.batchPayouts = false
          this.showSendDialog = true
        } else {
          this.showSendDialog = false
          return {
            options: {
              wallets: Object.fromEntries(this.wallets),
              batch: this.batchPayouts,
            },
          }
        }
        return null
      } else return {}
    },
    sendBatchCommand() {
      this.$refs.itemdata.processBatchCommand("send", this.wallets)
    },
    getTxURL(payout) {
      return this.$utils.getTxURL.call(
        this,
        payout.tx_hash,
        payout.wallet_currency
      )
    },
  },
}
</script>
