<template>
  <item-data ref="editcard" :headers="headers" :actions="actions" :url="url" :title="title" :postprocess="postprocess" :dialog-watch.sync="dialogOpen">
    <template #dialog="{ item }">
      <v-col v-if="item && item.currency && item.currency.toLowerCase() === 'btclnd'" cols="12">
        <v-alert type="warning" prominent>
          <p class="text-h6 font-weight-bold">
            LND support in Bitcart is a new, experimental feature implemented
            very recently. Use at your own risk.
          </p>
          <p>
            Before you proceed, please understand that the Lightning Network is
            still considered experimental and is under active development.
          </p>
          <p class="font-weight-bold">
            Do not add money that you can't afford to lose - there's a high risk
            of loss of funds.
          </p>
          <p>
            Take time to familiarize yourself with the risks and problems, some
            of which are:
          </p>
          <ul>
            <li>
              Lightning support in Electrum, used by Bitcart, is experimental
            </li>
            <li>
              Currently it is not possible to move your lightning node with
              channels to another server (Electrum implementation limitations)
            </li>
            <li>
              Internal Electrum lightning node is used, so you should open your
              channels from scratch
            </li>
          </ul>
          <hr class="my-3" style="border: 0; border-top: 1px solid rgba(0,0,0,0.3);" />
          <p>To proceed, please ensure that:</p>
          <ul>
            <li>
              You accept being #reckless and being the sole responsible party
              for any loss of funds.
            </li>
            <li>
              You agree to keep on your lightning node only what you can afford
              to lose.
            </li>
          </ul>
        </v-alert>
      </v-col>
    </template>
    <template #item.error="{ item }">
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-icon
            small
            :color="item.error ? 'orange' : 'green'"
            v-bind="attrs"
            v-on="on"
          >
            {{ item.error ? "mdi-circle-outline" : "mdi-circle" }}
          </v-icon>
        </template>
        <span>{{ item.error ? "Syncing / Loading" : "Online" }}</span>
      </v-tooltip>
    </template>
    <template #item.lightning_enabled="{ item }">
      <v-icon small :color="item.lightning_enabled ? 'success' : 'error'">
        {{ item.lightning_enabled ? "mdi-circle" : "mdi-circle-outline" }}
      </v-icon>
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
  mounted() {
    // Pre-fetch wallet schema so postprocess can use it even if refs aren't ready
    this.$axios.get("/wallets/schema").then((r) => {
      this._walletSchema = r.data
    }).catch(() => {})
  },
  data() {
    return {
      dialogOpen: false,
      headers: [
        {
          text: "ID",
          value: "id",
          mode: "display",
          copy: true,
          errorText:
            "Error loading wallet. Either the currency of this wallet is no longer supported or it was disabled on the server. Check server logs for more information",
        },
        { text: "Status", value: "error", mode: "display", sortable: false },
        { text: "Name", value: "name", rules: ["required"] },
        { text: "Balance", value: "balance", mode: "display" },
        { text: "Lightning Balance", value: "lightning_balance", mode: "display" },
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
          dynamicTextDependsOn: ["currency"],
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
          dynamicAutocompletesDependsOn: ["currency"],
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
          text: "Transaction speed",
          value: "transaction_speed",
          rules: ["int"],
          hint: "Number of confirmations for invoice to be considered complete",
          errors: {
            "Transaction speed must be in range from 0 to 10":
              "Transaction speed must be in range from 0 to 10",
          },
          help: "https://docs.bitcart.ai/guides/transaction-speed",
          expand: true,
        },
        {
          text: "Enable Tor (hybrid mode)",
          value: "tor_enabled_ui",
          input: "switch",
          default: true,
          expand: true,
          hint: "Warning: enabling Tor does NOT make your customer payments or store anonymous, it is primarily for increased reachability on the lightning network.",
          dynamicVisibility: (v, schema) => {
            return (
              schema &&
              v.currency &&
              schema[v.currency] &&
              schema[v.currency].supports_tor
            )
          },
        },
        {
          text: "Monitor for zero-conf transactions",
          value: "zero_conf_ui",
          input: "switch",
          default: true,
          expand: true,
          hint: "Monitoring for zero-conf transactions requires the use of an external ElectrumX server which involves telling that server the address(es) you wish to monitor. This may be a privacy concern depending on your threat model.",
          "persistent-hint": true,
          dynamicVisibility: (v, schema) => {
            return (
              schema &&
              v.currency &&
              schema[v.currency] &&
              schema[v.currency].supports_zero_conf
            )
          },
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
        {
          icon: "mdi-information-outline",
          text: "Node status",
          process: this.viewStatus,
          show: (item) => item.currency && item.currency.toLowerCase() === "btclnd",
        },
      ],
      url: "wallets",
      title: "Wallet",
    }
  },
  methods: {
    postprocess(data) {
      // Only merge tor/zero_conf into additional_xpub_data when the coin
      // supports these features.
      if (!data.additional_xpub_data) {
        data.additional_xpub_data = {}
      }
      // Access the wallet schema cached by the EditCard inside ItemData
      let schema = null
      try {
        // ItemData > EditCard > cachedSchema
        const itemData = this.$refs.editcard
        const editCard = itemData && (itemData.$refs.editcard || itemData.$children?.find(c => c.cachedSchema))
        schema = editCard && editCard.cachedSchema
      } catch (e) {
        // ref chain not available
      }
      // Fallback: fetch schema synchronously if not cached
      if (!schema && this._walletSchema) {
        schema = this._walletSchema
      }
      const coinSupports = (field) => {
        return schema && data.currency && schema[data.currency] && schema[data.currency][field]
      }
      if (coinSupports("supports_tor")) {
        data.additional_xpub_data.tor_enabled = !!data.tor_enabled_ui
      }
      if (coinSupports("supports_zero_conf")) {
        data.additional_xpub_data.zero_conf_monitoring = !!data.zero_conf_ui
      }
      delete data.tor_enabled_ui
      delete data.zero_conf_ui
      return data
    },
    configureLightning(item, itemIndex) {
      this.$router.push(`/wallets/${item.id}/lightning`)
    },
    viewStatus(item, itemIndex) {
      this.$router.push(`/wallets/${item.id}/status`)
    },
    isLNDWallet(item) {
      return item.currency && item.currency.toLowerCase() === "btclnd"
    },
  },
  watch: {
    dialogOpen(val) {
      if (!val) return
      // When the edit dialog opens, populate _ui toggle fields
      // from the wallet's additional_xpub_data so they reflect saved state
      this.$nextTick(() => {
        // Find the EditCard's item through the component tree
        const itemData = this.$refs.editcard
        if (!itemData) return
        // Try multiple paths to find the EditCard
        let item = null
        const editCard = itemData.$refs?.editcard
        if (editCard && editCard.item) {
          item = editCard.item
        } else {
          // Search children for the EditCard component
          const child = itemData.$children?.find(c => c.item && c.cachedSchema)
          if (child) item = child.item
        }
        if (!item) return
        const data = item.additional_xpub_data || {}
        if (data.tor_enabled !== undefined) {
          this.$set(item, "tor_enabled_ui", data.tor_enabled)
        }
        if (data.zero_conf_monitoring !== undefined) {
          this.$set(item, "zero_conf_ui", data.zero_conf_monitoring)
        }
      })
    },
  },
}
</script>
