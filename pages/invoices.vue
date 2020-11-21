<template>
  <item-data
    :headers="headers"
    :url="url"
    :title="title"
    :custom-batch-actions="batchActions"
  >
    <template v-slot:before-toolbar>
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
  layout: "dashboard",
  components: {
    ItemData,
    MenuDropdown,
  },
  data() {
    return {
      headers: [
        { text: "ID", value: "id", mode: "display" },
        { text: "Price", value: "price", readonly: true, rules: ["required"] },
        {
          text: "Currency",
          value: "currency",
          input: "autocomplete",
          url: "fiatlist",
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
        },
        {
          text: "Products",
          value: "products",
          input: "autocomplete",
          url: "products",
          multiple: true,
          sortable: false,
        },
        { text: "Promocode", value: "promocode" },
        { text: "Notification url", value: "notification_url", rules: ["url"] },
        { text: "Redirect url", value: "redirect_url", rules: ["url"] },
        { text: "Buyer email", value: "buyer_email", rules: ["email"] },
        { text: "Order", value: "order_id" },
        { text: "Discount", value: "discount", mode: "edit" },
        { text: "Status", value: "status", mode: "edit" },
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
      batchActions: [
        {
          title: "Mark as invalid",
          command: "mark_invalid",
        },
      ],
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
  },
  head() {
    return {
      script: [{ src: "/modal/bitcart.js" }],
    }
  },
}
</script>
