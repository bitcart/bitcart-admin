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
    <v-row class="justify-center">
      <p class="text-h6">Lightning support enabled</p>
    </v-row>
    <v-row class="justify-center">
      <p class="text-h6">
        Lightning balance:
        <span>{{ lnBalance }} {{ wallet.currency.toUpperCase() }} (⚡)</span>
      </p>
    </v-row>
    <v-row class="justify-center">
      <p class="text-h6">
        Node ID:
        <span>{{ ourNodeId }}</span>
      </p>
    </v-row>
    <v-row class="justify-center">
      <v-btn color="error" @click="disableLightning">Turn off</v-btn>
    </v-row>
    <v-row class="justify-center">
      <v-col cols="3">
        <v-text-field v-model="node_id" label="Node ID"></v-text-field>
      </v-col>
      <v-col cols="3">
        <v-text-field v-model="amount" label="Amount"> </v-text-field>
      </v-col>
    </v-row>
    <v-row class="justify-center">
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn color="primary" v-bind="attrs" @click="openChannel" v-on="on"
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
      <v-btn color="primary" @click="payLNInvoice">Pay LN invoice</v-btn>
    </v-row>
    <v-row class="justify-center pt-3">
      <v-container>
        <v-data-table
          :headers="headers"
          :items="channelsToShow"
          :search="search"
          :loading="loading"
        >
          <template #top>
            <v-toolbar flat>
              <v-toolbar-title>Channels opened</v-toolbar-title>
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
import TooltipIcon from "@/components/TooltipIcon"

export default {
  components: {
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
    return { wallet, lnBalance, ourNodeId }
  },
  data() {
    return {
      wallet: {},
      ourNodeId: "",
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
          text: "Actions",
          value: "actions",
          sortable: false,
        },
      ],
    }
  },
  computed: {
    channelsToShow() {
      return this.channels.filter((x) => x.state === "OPEN")
    },
  },
  beforeMount() {
    this.fetchChannels()
  },
  methods: {
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
    payLNInvoice() {
      this.$axios
        .post(`/wallets/${this.$route.params.id}/lnpay`, {
          invoice: this.lnInvoice,
        })
        .then((r) => {
          this.showSnackbar("Successfully paid the invoice")
        })
        .catch((e) => this.showSnackbar("Failed to pay the invoice", "error"))
    },
    openChannel() {
      this.$axios
        .post(`/wallets/${this.$route.params.id}/channels/open`, {
          node_id: this.node_id,
          amount: parseFloat(this.amount),
        })
        .then((r) => {
          this.showSnackbar("Successfully opened channel")
        })
        .catch((e) => this.showSnackbar("Failed to open channel", "error"))
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
        .catch((e) => this.showSnackbar("Failed to close channel", "error"))
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
