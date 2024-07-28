<template>
  <div style="display: contents">
    <item-data
      ref="itemdata"
      :search.sync="search"
      :headers="headers"
      :url="url"
      :title="title"
      :custom-batch-actions="batchActions"
      :actions="actions"
    >
      <template #before-toolbar>
        <v-row>
          <v-col cols="12" md="6">
            <search-filters
              :search.sync="search"
              :custom-filters="customFilters"
            />
          </v-col>
          <v-col class="pr-0" cols="12" md="6">
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
            <v-btn color="primary" @click="openExportDialog"> Export </v-btn>
          </v-col>
          <v-dialog v-model="showRefundDialog" max-width="650px">
            <v-card>
              <v-card-title class="justify-center">Issue refund</v-card-title>
              <v-card-text>
                Choose what to refund
                <v-radio-group v-model="refundType">
                  <v-radio
                    key="sent_amount_old"
                    :label="`${currentItem.sent_amount} ${currentItem.paid_currency} (sent amount, at exchange rate of invoice creation)`"
                    value="sent_amount_old"
                  />
                  <v-radio
                    key="sent_amount_new"
                    :label="`${newAmount} ${currentItem.paid_currency} (sent amount, at current exchange rate)`"
                    value="sent_amount_new"
                  />
                  <v-radio
                    key="sent_price"
                    :label="`${sentPrice} ${currentItem.currency} (sent amount, at invoice currency)`"
                    value="sent_price"
                  />
                  <v-radio key="custom" label="Custom amount" value="custom" />
                  <v-row>
                    <v-col cols="6">
                      <v-text-field v-model="customAmount" label="Amount" />
                    </v-col>
                    <v-col cols="6">
                      <auto-complete
                        v-model="customCurrency"
                        url="cryptos/fiatlist"
                        label="Currency"
                        :body="true"
                      />
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-switch
                      v-model="sendCustomerEmail"
                      label="Send email notification to the customer if possible"
                    />
                  </v-row>
                </v-radio-group>
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn color="primary" :loading="loading" @click="createRefund"
                  >Issue refund</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
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
      <template #item.paid_date="{ item }">
        <div v-if="item.paid_date">
          {{ minutesDiff(item) }}
          {{ minutesDiff(item) === 1 ? "minute" : "minutes" }}
        </div>
      </template>
      <template #item.products="{ item, copyText }">
        <v-list-item
          v-for="itemv in item.products"
          :key="itemv"
          @click="copyText(itemv)"
        >
          <v-list-item-title>{{ item.product_names[itemv] }}</v-list-item-title>
        </v-list-item>
      </template>
    </item-data>
    <v-snackbar
      v-model="showSnackbar"
      :timeout="2500"
      :color="snackbarColor"
      bottom
    >
      {{ snackbarText }}
    </v-snackbar>
  </div>
</template>
<script>
import ItemData from "@/components/ItemData.vue"
import SearchFilters from "@/components/SearchFilters.vue"
import JSONField from "@/components/JSONField.vue"
import AutoComplete from "@/components/AutoComplete.vue"
export default {
  components: {
    ItemData,
    SearchFilters,
    AutoComplete,
  },
  layout: "dashboard",
  data() {
    const dt = {
      search: "",
      showExportDialog: false,
      showRefundDialog: false,
      currentItem: {},
      itemIndex: -1,
      refundType: "sent_amount_old",
      showSnackbar: false,
      newAmount: 0,
      sentPrice: 0,
      customAmount: "0",
      customCurrency: "USD",
      sendCustomerEmail: true,
      loading: false,
      snackbarColor: "success",
      snackbarText: "",
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
          component: "v-combobox",
          url: "cryptos/fiatlist",
          body: true,
        },
        { text: "Paid Currency", value: "paid_currency", mode: "display" },
        {
          text: "Payment method ID",
          value: "payment_id",
          mode: "display",
          expand: true,
        },
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
        {
          text: "Invoice expiration",
          value: "expiration",
          rules: ["int"],
          hint: "In minutes, defaults to store setting",
          mode: "createonly",
        },
        { text: "Promocode", value: "promocode" },
        {
          text: "Notification url",
          value: "notification_url",
          help: "https://docs.bitcart.ai/bitcart-basics/walkthrough#notification-url",
          rules: ["url"],
          expand: true,
        },
        {
          text: "Redirect url",
          value: "redirect_url",
          rules: ["url"],
          expand: true,
        },
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
        {
          text: "Paid time",
          value: "paid_date",
          mode: "display",
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
      actions: [
        {
          icon: "mdi-cash-refund",
          text: "Issue a refund",
          process: this.issueRefund,
        },
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
    matchPayment(item) {
      return item.payments.find((payment) => {
        return payment.id === item.payment_id
      })
    },
    minutesDiff(item) {
      return Math.round(
        (new Date(item.paid_date) - new Date(item.created)) / 60000
      )
    },
    getTxURL(txHash, item) {
      const matchedPayment = this.matchPayment(item)
      return this.$utils.getTxURL.call(this, txHash, matchedPayment.currency)
    },
    issueRefund(item, itemIndex) {
      if (item.paid_currency === "") {
        this.snackbarColor = "error"
        this.snackbarText =
          "This invoice has no payments, so it can't be refunded"
        this.showSnackbar = true
        return
      }
      if (item.refund_id) {
        this.copyRefundLink(item.refund_id)
        return
      }
      const matchedPayment = this.matchPayment(item)
      this.$axios
        .get(
          `/wallets/${matchedPayment.wallet_id}/rate?currency=${item.currency}`
        )
        .then((r) => {
          this.newAmount = this.$utils.decimalStr(
            (item.sent_amount * matchedPayment.rate) / r.data,
            matchedPayment.divisibility
          )
          this.sentPrice = this.$utils.decimalStr(
            item.sent_amount * matchedPayment.rate,
            this.$utils.getDivisibility(item.price)
          )
          this.currentItem = item
          this.itemIndex = itemIndex
          this.showRefundDialog = true
        })
    },
    createRefund() {
      let refundAmount = this.customAmount
      let refundCurrency = this.customCurrency
      if (
        this.refundType === "sent_amount_old" ||
        this.refundType === "sent_amount_new"
      ) {
        refundAmount =
          this.refundType === "sent_amount_new"
            ? this.newAmount
            : this.currentItem.sent_amount
        refundCurrency = this.currentItem.paid_currency
      }
      if (this.refundType === "sent_price") {
        refundAmount = this.sentPrice
        refundCurrency = this.currentItem.currency
      }
      this.loading = true
      this.$axios
        .post(`/invoices/${this.currentItem.id}/refunds`, {
          amount: refundAmount,
          currency: refundCurrency,
          admin_host: window.location.origin,
          sent_email: this.sendCustomerEmail,
        })
        .then((r) => {
          this.loading = false
          this.$set(this.currentItem, "refund_id", r.data.id)
          this.copyRefundLink(r.data.id)
          this.showRefundDialog = false
        })
    },
    copyRefundLink(id) {
      this.snackbarColor = "success"
      this.snackbarText = "Refund link copied to clipboard"
      this.showSnackbar = true
      this.$utils.copyToClipboard(`${window.location.origin}/refunds/${id}`)
    },
  },
}
</script>
