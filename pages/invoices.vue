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
      <v-row>
        <v-col class="pr-0">
          <search-filters
            :search.sync="search"
            :custom-filters="customFilters"
          />
        </v-col>
        <v-col class="pl-0">
          <v-dialog v-model="showExportDialog" max-width="500px">
            <v-card>
              <v-card-title>Export invoices</v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="6">
                      <v-select
                        v-model="exportSettings.format"
                        label="Export format"
                        :items="exportItems"
                      ></v-select>
                    </v-col>
                    <v-col cols="6">
                      <v-switch
                        v-model="exportSettings.query"
                        label="Use current query"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-switch
                        v-model="exportSettings.payments"
                        label="Include payments"
                      />
                    </v-col>
                    <v-col cols="6">
                      <v-switch
                        v-model="exportSettings.allUsers"
                        label="All users"
                        :disabled="!$auth.user.is_superuser"
                      />
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions class="justify-center pb-5">
                <v-btn color="primary" @click="exportInvoices">Export</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-btn color="primary" class="mr-2" @click="openExportDialog">
            Export
          </v-btn>
        </v-col>
      </v-row>
    </template>
    <template #item.tx_hashes="{ item }">
      <div v-for="tx_hash of item.tx_hashes" :key="tx_hash">
        <a
          v-if="getTxURL(tx_hash, item)"
          :href="`${getTxURL(tx_hash, item)}`"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          {{ tx_hash }}
        </a>
        <template v-else>{{ tx_hash }}</template>
      </div>
    </template>
  </item-data>
</template>
<script>
import ItemData from "@/components/ItemData.vue"
import SearchFilters from "@/components/SearchFilters.vue"
import JSONField from "@/components/JSONField.vue"
export default {
  components: {
    ItemData,
    SearchFilters,
  },
  layout: "dashboard",
  data() {
    const dt = {
      search: "",
      showExportDialog: false,
      defaultExportSettings: {
        format: "CSV",
        query: false,
        payments: false,
        allUsers: false,
      },
      exportSettings: {},
      headers: [
        { text: "ID", value: "id", mode: "display", copy: true },
        {
          text: "Price",
          value: "price",
          readonly: true,
          rules: ["required", "nonnegative"],
          hint: "Price of 0 means accept any payment",
        },
        {
          text: "Currency",
          value: "currency",
          input: "autocomplete",
          url: "cryptos/fiatlist",
          body: true,
        },
        { text: "Paid Currency", value: "paid_currency", mode: "display" },
        {
          text: "Store",
          value: "store_id",
          rules: ["required"],
          input: "autocomplete",
          url: "stores",
          errors: { "No wallet linked": "No wallet linked" },
          copy: true,
        },
        {
          text: "Products",
          value: "products",
          input: "autocomplete",
          url: "products",
          multiple: true,
          sortable: false,
          mode: "create",
        },
        { text: "Promocode", value: "promocode" },
        {
          text: "Notification url",
          value: "notification_url",
          help: "https://docs.bitcartcc.com/bitcartcc-basics/walkthrough#notification-url",
          rules: ["url"],
        },
        { text: "Redirect url", value: "redirect_url", rules: ["url"] },
        { text: "Buyer email", value: "buyer_email", rules: ["email"] },
        { text: "Order", value: "order_id", copy: true },
        { text: "Discount", value: "discount", mode: "edit", copy: true },
        { text: "Status", value: "status", mode: "edit" },
        {
          text: "Tx hashes",
          value: "tx_hashes",
          expand: true,
          mode: "display",
        },
        {
          text: "Sent amount",
          value: "sent_amount",
          expand: true,
          mode: "display",
        },
        {
          text: "Exception status",
          value: "exception_status",
          expand: true,
          mode: "edit",
        },
        {
          text: "Shipping address",
          value: "shipping_address",
          input: "textarea",
          rows: 3,
          mode: "edit",
          expand: true,
        },
        {
          text: "Notes",
          value: "notes",
          input: "textarea",
          rows: 3,
          mode: "edit",
          expand: true,
        },
        { text: "Created date", value: "created", mode: "display" },
        {
          text: "Payment methods",
          value: "payments",
          input: "tabbed",
          mode: "display",
          sortable: false,
        },
        {
          text: "Metadata",
          value: "metadata",
          input: "metadata",
          expand: true,
          component: JSONField,
        },
        { text: "Actions", value: "action", sortable: false },
      ],
      url: "invoices",
      title: "Invoice",
      exportItems: ["CSV", "JSON"],
      customFilters: [
        {
          title: "Paid invoices",
          command: "paid|confirmed|complete",
        },
        {
          title: "Invalid invoices",
          command: "invalid",
        },
      ],
      batchActions: [
        {
          title: "Mark as complete",
          command: "mark_complete",
        },
        {
          title: "Mark as invalid",
          command: "mark_invalid",
        },
      ],
    }
    dt.exportSettings = Object.assign({}, dt.defaultExportSettings)
    return dt
  },
  head() {
    return {
      script: [{ src: `${this.STATIC_PATH}/modal/bitcart.js` }],
    }
  },
  methods: {
    openExportDialog() {
      this.exportSettings = Object.assign({}, this.defaultExportSettings)
      this.showExportDialog = true
    },
    exportInvoices() {
      this.showExportDialog = false
      let finalURL = `/invoices/export?export_format=${this.exportSettings.format.toLowerCase()}&add_payments=${
        this.exportSettings.payments
      }&all_users=${this.exportSettings.allUsers}`
      if (this.exportSettings.query) {
        const { sortBy, sortDesc } = this.$refs.itemdata.options
        finalURL += `&query=${encodeURIComponent(
          this.$refs.itemdata.searchProp
        )}`
        if (sortBy.length === 1 && sortDesc.length === 1)
          finalURL += `&sort=${sortBy[0]}&desc=${sortDesc[0]}`
      }
      this.$axios
        .get(finalURL, {
          responseType: "blob",
        })
        .then((resp) => {
          this.$utils.downloadFile(resp)
        })
    },
    getTxURL(txHash, item) {
      let matchedPayment = item.payments.find((payment) => {
        return payment.name === item.paid_currency
      })
      // if we didn't match via label, match via name (startsWith because of index)
      if (!matchedPayment) {
        matchedPayment = item.payments.find((payment) => {
          return payment.name.startsWith(item.paid_currency)
        })
      }
      return this.$utils.getTxURL.call(this, txHash, matchedPayment.currency)
    },
  },
}
</script>
