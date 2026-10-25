<template>
  <v-container v-if="!wallet.lightning_enabled">
    <v-alert v-if="!ourNodeId" type="error"
      >Lightning unsupported in this wallet type</v-alert
    >
    <v-row v-else>
      <v-col>
        <v-alert type="warning">
          <p class="text-h6">Warning</p>
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
            <li>
              Minimum amount to open a channel is 546*100 satoshis (Electrum
              follows LN specification strictly)
            </li>
            <li>All open channels are private (implementation details)</li>
            <li>
              If you need to open smaller channels, you can use submarine swaps.
              But note that it is a custodial service provided by Electrum
            </li>
          </ul>
          <hr class="divider" />
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
    </v-row>
    <v-row class="justify-center">
      <div v-if="ourNodeId">
        <v-btn color="success" class="mx-1" @click="enableLightning"
          >Yes, I agree</v-btn
        >
        <v-btn color="error" @click="$router.back()">No, take me back!</v-btn>
      </div>
      <v-btn v-else color="primary" @click="$router.back()">Return back</v-btn>
    </v-row>
  </v-container>
  <v-container v-else>
    <v-row class="justify-center align-center">
      <p class="text-h6 mr-2">Lightning support enabled</p>
      <v-chip
        v-if="walletNetwork"
        small
        :color="walletNetwork === 'mainnet' ? 'success' : 'orange'"
        outlined
      >
        {{ walletNetwork }}
      </v-chip>
    </v-row>
    <v-row class="justify-center">
      <p class="text-h6">
        Lightning balance:
        <span>{{ lnBalance }} BTC ({{ lnBalanceSats }} sats) &#9889;</span>
      </p>
    </v-row>
    <v-row v-if="routingStats.total_payments_routed > 0" class="justify-center">
      <v-col cols="auto" class="text-center">
        <v-chip class="mx-1" outlined small>
          <v-icon x-small left>mdi-swap-horizontal</v-icon>
          {{ routingStats.total_payments_routed }} routed
        </v-chip>
        <v-chip class="mx-1" outlined small>
          <v-icon x-small left>mdi-arrow-right-bold</v-icon>
          {{ routingStats.total_amount_routed_sats }} sats routed
        </v-chip>
        <v-chip class="mx-1" outlined small color="success">
          <v-icon x-small left>mdi-cash</v-icon>
          {{ routingStats.total_fees_collected_sats }} sats earned
        </v-chip>
      </v-col>
    </v-row>
    <!-- Node URI section (full address with port) -->
    <v-row class="justify-center">
      <v-col cols="8">
        <div class="text-center mb-2">
          <p class="text-h6 mb-1">Node ID:</p>
          <code v-if="nodeUri.clearnet_uri" style="word-break: break-all">{{
            nodeUri.clearnet_uri
          }}</code>
          <code v-else-if="ourNodeId && ourNodeId !== false" style="word-break: break-all">{{
            ourNodeId
          }}</code>
          <span v-else class="grey--text">Not available yet</span>
        </div>
        <div v-if="nodeUri.onion_uri" class="text-center mb-2">
          <p class="text-subtitle-1 mb-1">
            <v-icon small>mdi-shield-lock</v-icon> Tor:
          </p>
          <code style="word-break: break-all">{{ nodeUri.onion_uri }}</code>
        </div>
      </v-col>
    </v-row>
    <!-- QR Code for node URI -->
    <v-row v-if="primaryUri" class="justify-center mb-3">
      <v-col cols="auto" class="text-center">
        <p class="text-subtitle-2 grey--text mb-1">Scan to connect</p>
        <qrcode-vue :value="primaryUri" :size="200" level="M" />
      </v-col>
    </v-row>
    <!-- Turn off button (only for non-LND wallets where lightning can be toggled) -->
    <v-row v-if="!isAlwaysLightning" class="justify-center">
      <v-btn color="error" @click="disableLightning">Turn off</v-btn>
    </v-row>
    <v-row class="justify-center">
      <v-col cols="3">
        <v-text-field v-model="node_id" label="Node ID"></v-text-field>
      </v-col>
      <v-col cols="3">
        <v-text-field v-model="amount" :label="isAlwaysLightning ? 'Amount (sats)' : 'Amount (BTC)'"> </v-text-field>
      </v-col>
    </v-row>
    <v-row v-if="isAlwaysLightning" class="justify-center">
      <v-col cols="auto">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-switch
              v-model="channelAnnounced"
              v-bind="attrs"
              v-on="on"
              :label="channelAnnounced ? 'Announced' : 'Unannounced'"
              class="mt-0"
            />
          </template>
          <span>
            Unannounced channels are not known to the wider lightning network
            and may grant enhanced privacy. Announced channels are public with
            the benefit that your Bitcart node may occasionally route payments
            for other lightning nodes and collect a small fee in the process.
          </span>
        </v-tooltip>
      </v-col>
    </v-row>
    <v-row class="justify-center">
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn color="primary" v-bind="attrs" :loading="openingChannel" :disabled="openingChannel" @click="openChannel" v-on="on"
            >Open channel</v-btn
          >
        </template>
        <span>The channel will not appear in the list instantly</span>
      </v-tooltip>
    </v-row>
    <v-row class="justify-center">
      <v-col cols="6">
        <v-text-field v-model="lnInvoice" label="LN Invoice"></v-text-field>
      </v-col>
    </v-row>
    <v-row class="justify-center">
      <v-btn color="primary" :loading="payingInvoice" :disabled="payingInvoice" @click="payLNInvoice">Pay LN invoice</v-btn>
    </v-row>
    <!-- Active/Open Channels -->
    <v-row class="justify-center pt-3">
      <v-container>
        <v-data-table
          :headers="headers"
          :items="activeChannels"
          :search="search"
          :loading="loading"
        >
          <template #top>
            <v-toolbar flat>
              <v-toolbar-title>Active Channels ({{ activeChannels.length }})</v-toolbar-title>
              <div class="flex-grow-1" />
              <v-text-field
                v-model="search"
                append-icon="search"
                label="Search"
                single-line
                hide-details
              />
            </v-toolbar>
          </template>
          <template #item.peer_state="{ item }">
            <v-chip
              :color="stateColor(item.state)"
              small
              outlined
            >
              {{ item.state }}
            </v-chip>
          </template>
          <template #item.private="{ item }">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-chip
                  :color="item.private ? 'grey' : 'primary'"
                  small
                  outlined
                  v-bind="attrs"
                  v-on="on"
                >
                  {{ item.private ? "Unannounced" : "Announced" }}{{ item.initiator ? "" : " (remote)" }}
                </v-chip>
              </template>
              <span v-if="item.initiator">
                Unannounced channels are not known to the wider lightning
                network and may grant enhanced privacy. Announced channels are
                public with the benefit that your Bitcart node may occasionally
                route payments for other lightning nodes and collect a small fee
                in the process.
              </span>
              <span v-else>
                This channel was opened by the remote peer.
                The visibility setting was chosen by them.
              </span>
            </v-tooltip>
          </template>
          <template #item.actions="{ item }">
            <tooltip-icon
              icon="mdi-close"
              text="Close"
              small
              @click="closeChannel(item)"
            />
            <tooltip-icon
              icon="mdi-close-thick"
              text="Force-Close"
              small
              @click="closeChannel(item, true)"
            />
          </template>
        </v-data-table>
      </v-container>
    </v-row>
    <!-- Inactive/Disconnected Channels (collapsed by default) -->
    <v-row v-if="inactiveChannels.length > 0" class="justify-center">
      <v-container>
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-header>
              Other Channels ({{ inactiveChannels.length }}) — Disconnected / Inactive
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-data-table
                :headers="headers"
                :items="inactiveChannels"
                dense
              >
                <template #item.actions="{ item }">
                  <tooltip-icon
                    icon="mdi-close"
                    text="Close"
                    small
                    @click="closeChannel(item)"
                  />
                  <tooltip-icon
                    icon="mdi-close-thick"
                    text="Force-Close"
                    small
                    @click="closeChannel(item, true)"
                  />
                </template>
              </v-data-table>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-container>
    </v-row>
    <v-snackbar
      v-model="snackbar"
      :timeout="2500"
      :color="snackbarColor"
      bottom
    >
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script>
import QrcodeVue from "qrcode.vue"
import TooltipIcon from "@/components/TooltipIcon"

export default {
  components: {
    QrcodeVue,
    TooltipIcon,
  },
  async asyncData({ route, error, $axios }) {
    let wallet
    try {
      wallet = (await $axios.get(`/wallets/${route.params.id}`)).data
    } catch {
      return error({ statusCode: 404, text: "Wallet not found" })
    }
    const { data: ourNodeId } = await $axios.get(
      `/wallets/${wallet.id}/checkln`
    )
    const {
      data: { lightning: lnBalance },
    } = await $axios.get(`/wallets/${wallet.id}/balance`)
    // Fetch node URI info (clearnet + tor addresses)
    let nodeUri = {
      uris: [],
      clearnet_uri: "",
      onion_uri: "",
      identity_pubkey: "",
      tor_enabled: false,
    }
    try {
      nodeUri = (await $axios.get(`/wallets/${wallet.id}/nodeuri`)).data
    } catch {
      // nodeuri may not be available for non-LND wallets
    }
    // Fetch wallet schema to check if lightning_default is set
    let walletSchema = {}
    try {
      walletSchema = (await $axios.get("/wallets/schema")).data
    } catch {
      // ignore
    }
    // Fetch network and routing stats from node status
    let walletNetwork = ""
    let routingStats = { total_payments_routed: 0, total_amount_routed_sats: 0, total_fees_collected_sats: 0 }
    try {
      const statusData = (await $axios.get(`/wallets/${wallet.id}/status`)).data
      walletNetwork = statusData.network || ""
      routingStats = {
        total_payments_routed: statusData.total_payments_routed || 0,
        total_amount_routed_sats: statusData.total_amount_routed_sats || 0,
        total_fees_collected_sats: statusData.total_fees_collected_sats || 0,
      }
    } catch {
      // ignore
    }
    return { wallet, lnBalance, ourNodeId, nodeUri, walletSchema, walletNetwork, routingStats }
  },
  data() {
    return {
      wallet: {},
      ourNodeId: "",
      nodeUri: {
        uris: [],
        clearnet_uri: "",
        onion_uri: "",
        identity_pubkey: "",
        tor_enabled: false,
      },
      walletSchema: {},
      walletNetwork: "",
      node_id: "",
      lnInvoice: "",
      amount: "",
      lnBalance: 0,
      search: "",
      channels: [],
      snackbar: false,
      loading: true,
      snackbarText: "",
      snackbarColor: "success",
      headers: [
        {
          text: "Channel ID",
          value: "channel_id",
        },
        {
          text: "Remote public key",
          value: "remote_pubkey",
        },
        {
          text: "Peer state",
          value: "peer_state",
        },
        {
          text: "Local balance",
          value: "local_balance",
        },
        {
          text: "Remote balance",
          value: "remote_balance",
        },
        {
          text: "Visibility",
          value: "private",
        },
        {
          text: "Base fee (sats)",
          value: "base_fee_sats",
        },
        {
          text: "Fee rate (%)",
          value: "fee_rate_percent",
        },
        {
          text: "Actions",
          value: "actions",
          sortable: false,
        },
      ],
      channelAnnounced: true,
      openingChannel: false,
      payingInvoice: false,
    }
  },
  computed: {
    lnBalanceSats() {
      // Convert BTC to sats for display
      const btc = parseFloat(this.lnBalance) || 0
      return Math.round(btc * 100000000)
    },
    activeChannels() {
      // Show open AND pending channels in the active list
      return this.channels.filter(
        (x) => x.state === "OPEN" || x.state === "PENDING_OPEN"
      )
    },
    inactiveChannels() {
      return this.channels.filter(
        (x) =>
          x.state !== "OPEN" &&
          x.state !== "PENDING_OPEN" &&
          x.state !== "CLOSED" &&
          x.state !== "FORCE_CLOSED"
      )
    },
    primaryUri() {
      return this.nodeUri.clearnet_uri || this.nodeUri.onion_uri || ""
    },
    isAlwaysLightning() {
      // Coins like BTCLND have lightning_default=true, meaning lightning can't be turned off
      const schema = this.walletSchema[this.wallet.currency]
      return schema && schema.lightning_default
    },
  },
  beforeMount() {
    this.fetchChannels()
    // Auto-refresh channels every 10 seconds
    this.channelRefreshTimer = setInterval(() => {
      this.fetchChannels()
    }, 10000)
  },
  beforeDestroy() {
    if (this.channelRefreshTimer) {
      clearInterval(this.channelRefreshTimer)
    }
  },
  methods: {
    stateColor(state) {
      switch (state) {
        case "OPEN":
          return "success"
        case "PENDING_OPEN":
          return "warning"
        case "DISCONNECTED":
          return "grey"
        case "PENDING_CLOSE":
        case "FORCE_CLOSING":
          return "error"
        default:
          return "grey"
      }
    },
    fetchChannels() {
      this.loading = true
      this.$axios.get(`/wallets/${this.wallet.id}/channels`).then((r) => {
        this.channels = r.data
        this.loading = false
      })
    },
    patch(obj) {
      return this.$axios
        .patch(`/wallets/${this.$route.params.id}`, {
          ...this.wallet,
          ...obj,
        })
        .then((r) => this.$router.back())
    },
    enableLightning() {
      this.patch({ lightning_enabled: true })
    },
    disableLightning() {
      this.patch({ lightning_enabled: false })
    },
    removeItem(item) {
      const index = this.channels.indexOf(item)
      if (index > -1) {
        this.channels.splice(index, 1)
      }
    },
    showSnackbar(message, color = "success") {
      this.snackbarText = message
      this.snackbarColor = color
      this.snackbar = true
    },
    getErrorMessage(e, fallback) {
      const detail = e?.response?.data?.detail
      if (detail) return typeof detail === "string" ? detail : JSON.stringify(detail)
      return fallback
    },
    payLNInvoice() {
      this.payingInvoice = true
      this.$axios
        .post(`/wallets/${this.$route.params.id}/lnpay`, {
          invoice: this.lnInvoice,
        })
        .then((r) => {
          this.showSnackbar("Successfully paid the invoice")
        })
        .catch((e) => this.showSnackbar(this.getErrorMessage(e, "Failed to pay the invoice"), "error"))
        .finally(() => { this.payingInvoice = false })
    },
    openChannel() {
      this.openingChannel = true
      const params = {
        node_id: this.node_id,
        amount: parseFloat(this.amount),
      }
      if (this.isAlwaysLightning) {
        params.private = !this.channelAnnounced
      }
      this.$axios
        .post(`/wallets/${this.$route.params.id}/channels/open`, params)
        .then((r) => {
          this.showSnackbar("Successfully opened channel")
        })
        .catch((e) => this.showSnackbar(this.getErrorMessage(e, "Failed to open channel"), "error"))
        .finally(() => { this.openingChannel = false })
    },
    closeChannel(item, force) {
      this.$axios
        .post(`/wallets/${this.$route.params.id}/channels/close`, {
          channel_point: item.channel_point,
          force,
        })
        .then((r) => {
          this.removeItem(item)
          this.showSnackbar("Successfully closed channel")
        })
        .catch((e) => this.showSnackbar(this.getErrorMessage(e, "Failed to close channel"), "error"))
    },
  },
}
</script>

<style>
.divider {
  box-sizing: content-box;
  overflow: visible;
  margin-top: 1rem;
  margin-bottom: 1rem;
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.3);
  display: block;
  width: unset;
  height: 1px;
  background: none;
}
</style>
