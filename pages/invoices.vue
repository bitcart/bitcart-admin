<template>
  <item-data
    :search.sync="search"
    :headers="headers"
    :url="url"
    :title="title"
    :custom-batch-actions="batchActions"
  >
    <template #before-toolbar>
      <v-dialog v-model="showDateDialog" max-width="500px">
        <v-card>
          <v-card-title>Filter invoices by custom date range </v-card-title>
          <v-card-text>
            <v-datetime-picker
              ref="dateInput1"
              v-model="startDate"
              label="Start date"
            />
            <v-datetime-picker
              ref="dateInput2"
              v-model="endDate"
              label="End date"
            />
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn color="primary" @click="applyDateFilter">Apply</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <menu-dropdown
        :items="filterItems"
        :process="applyFilter"
        title="Filters"
      />
      <menu-dropdown
        :items="exportItems"
        :process="exportInvoices"
        title="Export"
      />
    </template>
  </item-data>
</template>
<script>
import ItemData from "@/components/ItemData.vue"
import MenuDropdown from "@/components/MenuDropdown"
export default {
  components: {
    ItemData,
    MenuDropdown,
  },
  layout: "dashboard",
  data() {
    return {
      search: "",
      showDateDialog: false,
      startDate: null,
      endDate: null,
      headers: [
        { text: "ID", value: "id", mode: "display", copy: true },
        { text: "Price", value: "price", readonly: true, rules: ["required"] },
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
        { text: "Shipping address", value: "shipping_address", expand: true },
        { text: "Notes", value: "notes", expand: true },
        { text: "Created date", value: "created", mode: "display" },
        {
          text: "Payment methods",
          value: "payments",
          input: "tabbed",
          mode: "display",
          sortable: false,
        },
        { text: "Actions", value: "action", sortable: false },
      ],
      url: "invoices",
      title: "Invoice",
      exportItems: [
        {
          title: "JSON",
          command: "json",
        },
        {
          title: "CSV",
          command: "csv",
        },
      ],
      filterItems: [
        {
          title: "Paid invoices",
          command: "paid|confirmed|complete",
        },
        {
          title: "Invalid invoices",
          command: "invalid",
        },
        {
          title: "Last 24 hours",
          command: "start_date:-1d",
        },
        {
          title: "Last week",
          command: "start_date:-1w",
        },
        {
          title: "Last month",
          command: "start_date:-1m",
        },
        {
          title: "Custom range",
          command: { customRange: true },
        },
        {
          title: "Unfiltered",
          command: "",
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
  },
  head() {
    return {
      script: [{ src: `${this.STATIC_PATH}/modal/bitcart.js` }],
    }
  },
  methods: {
    exportInvoices(format) {
      this.$axios
        .get(`/invoices/export?export_format=${format}`, {
          responseType: "blob",
        })
        .then((response) => {
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement("a")
          link.href = url
          const contentDisposition = response.headers["content-disposition"]
          let filename = "unknown"
          if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename=(.+)/)
            if (fileNameMatch.length === 2) {
              filename = fileNameMatch[1]
            }
          }
          link.setAttribute("download", filename)
          document.body.appendChild(link)
          link.click()
        })
    },
    applyFilter(filter) {
      if (filter.customRange) {
        if (this.$refs.dateInput1) {
          this.$refs.dateInput1.clearHandler()
        }
        if (this.$refs.dateInput2) {
          this.$refs.dateInput2.clearHandler()
        }
        this.showDateDialog = true
        return
      }
      this.search = filter
    },
    applyDateFilter() {
      if (this.startDate && this.endDate) {
        this.search = `start_date:${this.startDate.toISOString()} end_date:${this.endDate.toISOString()} ${
          this.search
        }`
        this.showDateDialog = false
      }
    },
  },
}
</script>
