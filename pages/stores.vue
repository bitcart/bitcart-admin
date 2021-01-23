<template>
  <div>
    <item-data
      :headers="headers"
      :url="url"
      :title="title"
      :actions="actions"
    />
    <edit-card
      :url="url"
      :on.sync="showDialog"
      :headers="emailHeaders"
      :item.sync="item"
      :item-index="itemIndex"
      :custom-props="{ loadingEmail, emailCheck, emailStatus }"
      :show-new="false"
      :edit-mode="true"
      title="store email settings"
      @reset-custom-props="resetCustomProps"
    >
      <template #dialog>
        <v-col :cols="6">
          <menu-dropdown
            :items="emailPresets"
            :process="loadPreset"
            title="Load preset"
          />
        </v-col>
      </template>
    </edit-card>
    <edit-card
      :url="url"
      :on.sync="showSettingsDialog"
      :headers="settingsHeaders"
      :item.sync="item.checkout_settings"
      :item-index="itemIndex"
      :show-new="false"
      :edit-mode="true"
      :get-edit-url="getEditURL"
      title="store checkout settings"
    />
    <template-edit
      name="store"
      :item.sync="item"
      :item-index="itemIndex"
      :show.sync="showTemplates"
    />
  </div>
</template>
<script>
import ItemData from "@/components/ItemData.vue"
import EditCard from "@/components/EditCard.vue"
import TemplateEdit from "@/components/TemplateEdit.vue"
import MenuDropdown from "@/components/MenuDropdown.vue"
export default {
  components: {
    ItemData,
    EditCard,
    TemplateEdit,
    MenuDropdown,
  },
  layout: "dashboard",
  data() {
    return {
      item: {},
      loadingEmail: false,
      emailCheck: "",
      emailStatus: "",
      itemIndex: -1,
      headers: [
        { text: "ID", value: "id", mode: "display" },
        { text: "Name", value: "name", rules: ["required"] },
        {
          text: "Default currency",
          value: "default_currency",
          default: "USD",
          input: "autocomplete",
          url: "fiatlist",
          body: true,
        },
        {
          text: "Wallets",
          value: "wallets",
          rules: ["required"],
          input: "autocomplete",
          url: "wallets",
          multiple: true,
          sortable: false,
        },
        {
          text: "Notifications",
          value: "notifications",
          input: "autocomplete",
          url: "notifications",
          multiple: true,
          sortable: false,
        },
        { text: "Created date", value: "created", mode: "display" },
        { text: "Actions", value: "action", sortable: false },
      ],
      actions: [
        {
          icon: "mdi-email",
          process: this.showEmail,
        },
        {
          icon: "mdi-cog-outline",
          process: this.showSettings,
        },
        {
          icon: "mdi-text-box",
          process: this.showTemplate,
        },
      ],
      emailPresets: [
        {
          title: "Gmail",
          command: {
            email_host: "smtp.gmail.com",
            email_port: 587,
            email_use_ssl: true,
          },
        },
        {
          title: "Yahoo",
          command: {
            email_host: "mail.yahoo.com",
            email_port: 587,
            email_use_ssl: true,
          },
        },
        {
          title: "Mailgun",
          command: {
            email_host: "smtp.mailgun.org",
            email_port: 587,
            email_use_ssl: true,
          },
        },
        {
          title: "Office365",
          command: {
            email_host: "smtp.office365.com",
            email_port: 587,
            email_use_ssl: true,
          },
        },
        {
          title: "SendGrid",
          command: {
            email_host: "smtp.sendgrid.net",
            email_port: 587,
            email_use_ssl: true,
          },
        },
      ],
      emailHeaders: [
        { text: "Store email", value: "email", rules: ["email"] },
        { text: "Email host", value: "email_host" },
        { text: "Email port", value: "email_port", rules: ["int"] },
        { text: "Email user", value: "email_user" },
        { text: "Email password", value: "email_password", input: "password" },
        { text: "SSL/TLS", value: "email_use_ssl", input: "switch" },
        { text: "Test ping", input: "button", click: this.testping },
        {
          input: "progress",
          text: "emailCheck",
          loading: "loadingEmail",
          status: "emailStatus",
        },
      ],
      settingsHeaders: [
        {
          text: "Invoice expiration",
          value: "expiration",
          rules: ["int"],
          hint: "In minutes",
        },
        {
          text: "Transaction speed",
          value: "transaction_speed",
          rules: ["int"],
          hint: "Number of confirmations for invoice to be considered complete",
          errors: {
            "Transaction speed must be in range from 0 to 6":
              "Transaction speed must be in range from 0 to 6",
          },
          help: "https://docs.bitcartcc.com/guides/transaction-speed",
        },
        {
          text: "Underpaid percentage",
          value: "underpaid_percentage",
          hint:
            "Consider the invoice paid even if the paid amount is ... % less than expected",
          errors: {
            "Underpaid percentage must be in range from 0 to 99.99":
              "Underpaid percentage must be in range from 0 to 99.99",
          },
          help:
            "https://docs.bitcartcc.com/support-and-community/faq/stores-faq#what-is-underpaid-percentage",
        },
        {
          text: "Show recommended fee",
          value: "show_recommended_fee",
          input: "switch",
          help:
            "https://docs.bitcartcc.com/support-and-community/faq/stores-faq#recommended-fee",
        },
        {
          text: "Recommended fee confirmation target blocks",
          value: "recommended_fee_target_blocks",
          rules: ["int"],
          hint:
            "The fee the customer must pay for transaction to be confirmed in ... blocks",
          errors: {
            "Recommended fee confirmation target blocks must be either of":
              "Recommended fee confirmation target blocks must be either of: 25, 10, 5, 2, 1",
          },
          help:
            "https://docs.bitcartcc.com/support-and-community/faq/stores-faq#recommended-fee",
        },
        {
          text: "Custom logo link",
          value: "custom_logo_link",
          help:
            "https://docs.bitcartcc.com/support-and-community/faq/stores-faq#what-is-custom-logo-link",
        },
        {
          text: "Use Dark Mode",
          value: "use_dark_mode",
          input: "switch",
          help:
            "https://docs.bitcartcc.com/support-and-community/faq/stores-faq#what-is-the-use-dark-mode-setting",
        },
        {
          text: "Use HTML templates",
          value: "use_html_templates",
          input: "switch",
          help: "https://docs.bitcartcc.com/guides/templates#html-templates",
        },
      ],
      showDialog: false,
      showSettingsDialog: false,
      showTemplates: false,
      url: "stores",
      title: "Store",
    }
  },
  beforeMount() {
    this.$bus.$on("updateitem", (item, index) => {
      this.item = item
    })
  },
  methods: {
    getEditURL(item) {
      return `/${this.url}/${this.item.id}/checkout_settings`
    },
    setup(item, itemIndex) {
      this.item = JSON.parse(JSON.stringify(item))
      this.itemIndex = itemIndex
    },
    showEmail(item, itemIndex) {
      this.showDialog = true
      this.setup(item, itemIndex)
    },
    showSettings(item, itemIndex) {
      this.showSettingsDialog = true
      this.setup(item, itemIndex)
    },
    showTemplate(item, itemIndex) {
      this.showTemplates = true
      this.setup(item, itemIndex)
    },
    testping(item) {
      this.emailCheck = ""
      this.loadingEmail = true
      this.$axios.get(`/stores/${item.id}/ping`).then((resp) => {
        this.loadingEmail = false
        if (resp.status === 200 && resp.data === true) {
          this.emailCheck = "Ping successful"
          this.emailStatus = "mdi-check"
        } else {
          this.emailCheck = "Error pinging email server"
          this.emailStatus = "mdi-close"
        }
      })
    },
    loadPreset(preset) {
      for (const key in preset) {
        this.item[key] = preset[key]
      }
    },
    resetCustomProps() {
      this.emailCheck = ""
      this.emailStatus = ""
      this.loadingEmail = false
    },
  },
}
</script>
