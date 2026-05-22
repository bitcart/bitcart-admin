<template>
  <v-container>
    <v-row class="justify-center">
      <v-col cols="12" md="10">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-information-outline</v-icon>
            Node Status — {{ wallet.currency.toUpperCase() }} Wallet
          </v-card-title>
          <v-tabs v-model="activeTab">
            <v-tab>Status</v-tab>
            <v-tab>LND Logs</v-tab>
          </v-tabs>
          <v-tabs-items v-model="activeTab">
            <!-- Status Tab -->
            <v-tab-item>
              <v-card-text v-if="loading">
                <v-row class="justify-center">
                  <v-progress-circular indeterminate color="primary" />
                </v-row>
              </v-card-text>
              <v-card-text
                v-else-if="!status || Object.keys(status).length === 0"
              >
                <v-alert type="info">
                  No status available. The node may not be running yet.
                </v-alert>
              </v-card-text>
              <v-card-text v-else>
                <v-alert
                  v-if="status.synchronized"
                  type="success"
                  dense
                  outlined
                  class="mb-4"
                >
                  Node is fully synchronized
                </v-alert>
                <v-alert v-else type="warning" dense outlined class="mb-4">
                  Node is syncing...
                </v-alert>
                <v-simple-table>
                  <template #default>
                    <tbody>
                      <tr v-if="status.version">
                        <td class="font-weight-bold">LND Version</td>
                        <td>{{ status.version }}</td>
                      </tr>
                      <tr v-if="status.network">
                        <td class="font-weight-bold">Network</td>
                        <td>
                          <v-chip
                            small
                            :color="status.network === 'mainnet' ? 'success' : 'orange'"
                            outlined
                          >
                            {{ status.network }}
                          </v-chip>
                        </td>
                      </tr>
                      <tr v-if="status.identity_pubkey">
                        <td class="font-weight-bold">Node Public Key</td>
                        <td>
                          <code style="word-break: break-all">{{
                            status.identity_pubkey
                          }}</code>
                        </td>
                      </tr>
                      <tr v-if="status.uris && status.uris.length > 0">
                        <td class="font-weight-bold">Node Addresses</td>
                        <td>
                          <div
                            v-for="(uri, idx) in status.uris"
                            :key="idx"
                            class="mb-1"
                          >
                            <v-icon x-small class="mr-1">{{
                              uri.includes(".onion:")
                                ? "mdi-shield-lock"
                                : "mdi-earth"
                            }}</v-icon>
                            <code
                              style="
                                word-break: break-all;
                                font-size: 0.85em;
                              "
                              >{{ uri }}</code
                            >
                          </div>
                        </td>
                      </tr>
                      <tr
                        v-else-if="status.clearnet_uri || status.onion_uri"
                      >
                        <td class="font-weight-bold">Node Addresses</td>
                        <td>
                          <div v-if="status.clearnet_uri" class="mb-1">
                            <v-icon x-small class="mr-1">mdi-earth</v-icon>
                            <code
                              style="
                                word-break: break-all;
                                font-size: 0.85em;
                              "
                              >{{ status.clearnet_uri }}</code
                            >
                          </div>
                          <div v-if="status.onion_uri">
                            <v-icon x-small class="mr-1"
                              >mdi-shield-lock</v-icon
                            >
                            <code
                              style="
                                word-break: break-all;
                                font-size: 0.85em;
                              "
                              >{{ status.onion_uri }}</code
                            >
                          </div>
                        </td>
                      </tr>
                      <tr v-if="status.alias">
                        <td class="font-weight-bold">Node Alias</td>
                        <td>{{ status.alias }}</td>
                      </tr>
                      <tr>
                        <td class="font-weight-bold">Synced to Chain</td>
                        <td>
                          <v-icon
                            small
                            :color="
                              status.synced_to_chain ? 'success' : 'warning'
                            "
                          >
                            {{
                              status.synced_to_chain
                                ? "mdi-check-circle"
                                : "mdi-sync"
                            }}
                          </v-icon>
                          {{
                            status.synced_to_chain ? "Yes" : "Syncing..."
                          }}
                          <span
                            v-if="
                              !status.synced_to_chain && status.sync_progress
                            "
                            class="grey--text ml-2"
                          >
                            ({{ status.sync_progress }})
                          </span>
                        </td>
                      </tr>
                      <tr v-if="status.synced_to_graph !== undefined">
                        <td class="font-weight-bold">Synced to Graph</td>
                        <td>
                          <v-icon
                            small
                            :color="
                              status.synced_to_graph ? 'success' : 'warning'
                            "
                          >
                            {{
                              status.synced_to_graph
                                ? "mdi-check-circle"
                                : "mdi-sync"
                            }}
                          </v-icon>
                          {{
                            status.synced_to_graph ? "Yes" : "Syncing..."
                          }}
                        </td>
                      </tr>
                      <tr>
                        <td class="font-weight-bold">Block Height</td>
                        <td>
                          {{
                            status.block_height ||
                            status.blockchain_height ||
                            0
                          }}
                          <span
                            v-if="
                              !status.synced_to_chain &&
                              (status.block_height === 0 ||
                                !status.block_height)
                            "
                            class="grey--text ml-2"
                            >(waiting for initial sync)</span
                          >
                        </td>
                      </tr>
                      <tr v-if="status.block_hash">
                        <td class="font-weight-bold">Block Hash</td>
                        <td>
                          <code style="word-break: break-all">{{
                            status.block_hash
                          }}</code>
                        </td>
                      </tr>
                      <tr>
                        <td class="font-weight-bold">Peers</td>
                        <td>{{ status.num_peers || 0 }}</td>
                      </tr>
                      <tr>
                        <td class="font-weight-bold">Active Channels</td>
                        <td>{{ status.num_active_channels || 0 }}</td>
                      </tr>
                      <tr v-if="status.num_inactive_channels !== undefined">
                        <td class="font-weight-bold">Inactive Channels</td>
                        <td>{{ status.num_inactive_channels }}</td>
                      </tr>
                      <tr v-if="status.num_pending_channels !== undefined">
                        <td class="font-weight-bold">Pending Channels</td>
                        <td>{{ status.num_pending_channels }}</td>
                      </tr>
                      <tr>
                        <td class="font-weight-bold">Total LND Instances</td>
                        <td>
                          {{ status.total_wallets || 0 }}
                          <span class="grey--text ml-1"
                            >(across all wallets managed by this
                            daemon)</span
                          >
                        </td>
                      </tr>
                      <tr v-if="status.total_payments_routed !== undefined">
                        <td class="font-weight-bold">Payments Routed</td>
                        <td>{{ status.total_payments_routed }}</td>
                      </tr>
                      <tr v-if="status.total_amount_routed_sats !== undefined">
                        <td class="font-weight-bold">Total Amount Routed</td>
                        <td>
                          {{ status.total_amount_routed_sats }} sats
                          <span class="grey--text ml-1"
                            >({{ status.total_amount_routed_btc }} BTC)</span
                          >
                        </td>
                      </tr>
                      <tr v-if="status.total_fees_collected_sats !== undefined">
                        <td class="font-weight-bold">Fees Collected</td>
                        <td>
                          {{ status.total_fees_collected_sats }} sats
                          <span class="grey--text ml-1"
                            >({{ status.total_fees_collected_btc }} BTC)</span
                          >
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card-text>
              <v-card-actions>
                <v-btn text color="primary" @click="refresh">
                  <v-icon left>mdi-refresh</v-icon>
                  Refresh
                </v-btn>
                <v-spacer />
                <v-btn text @click="$router.back()">Back</v-btn>
              </v-card-actions>
            </v-tab-item>

            <!-- Logs Tab -->
            <v-tab-item>
              <v-card-text>
                <!-- Log source sub-tabs -->
                <v-tabs v-model="logSourceTab" class="mb-3">
                  <v-tab>LND</v-tab>
                  <v-tab v-if="status.tor_enabled">Tor</v-tab>
                </v-tabs>

                <!-- Severity filters -->
                <div class="d-flex align-center mb-3">
                  <span class="text-subtitle-2 mr-3">Severity:</span>
                  <v-checkbox
                    v-model="showCritical"
                    label="CRT"
                    hide-details
                    dense
                    class="mr-2 mt-0"
                    color="red darken-3"
                  />
                  <v-checkbox
                    v-model="showError"
                    label="ERR"
                    hide-details
                    dense
                    class="mr-2 mt-0"
                    color="red"
                  />
                  <v-checkbox
                    v-model="showWarning"
                    label="WRN"
                    hide-details
                    dense
                    class="mr-2 mt-0"
                    color="orange"
                  />
                  <v-checkbox
                    v-model="showInfo"
                    label="INF"
                    hide-details
                    dense
                    class="mr-2 mt-0"
                    color="blue"
                  />
                  <v-checkbox
                    v-model="showDebug"
                    label="DBG"
                    hide-details
                    dense
                    class="mr-2 mt-0"
                    color="grey"
                  />
                  <v-spacer />
                  <v-btn
                    small
                    text
                    color="primary"
                    :loading="logsLoading"
                    @click="fetchLogs"
                  >
                    <v-icon small left>mdi-refresh</v-icon>
                    Refresh
                  </v-btn>
                  <v-btn small text @click="autoScroll = !autoScroll">
                    <v-icon small left>{{
                      autoScroll
                        ? "mdi-arrow-down-bold"
                        : "mdi-arrow-down-bold-outline"
                    }}</v-icon>
                    {{ autoScroll ? "Auto-scroll ON" : "Auto-scroll OFF" }}
                  </v-btn>
                </div>

                <!-- Log output -->
                <div
                  ref="logContainer"
                  class="log-container"
                  style="
                    height: 500px;
                    overflow: auto;
                    background: #1e1e1e;
                    border-radius: 4px;
                    padding: 8px;
                    font-family: 'Courier New', monospace;
                    font-size: 0.75em;
                    line-height: 1.3;
                  "
                >
                  <div
                    v-for="(entry, idx) in filteredLogs"
                    :key="idx"
                    :style="{ color: logColor(entry.level) }"
                    style="white-space: pre; margin: 0; padding: 0"
                  >{{ entry.text }}</div>
                  <div
                    v-if="filteredLogs.length === 0"
                    style="color: #888; text-align: center; padding: 20px"
                  >
                    {{
                      logsLoading
                        ? "Loading logs..."
                        : "No log entries matching filters"
                    }}
                  </div>
                </div>
              </v-card-text>
            </v-tab-item>
          </v-tabs-items>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar" :timeout="2500" color="error" bottom>
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  async asyncData({ route, error, $axios }) {
    let wallet
    try {
      wallet = (await $axios.get(`/wallets/${route.params.id}`)).data
    } catch {
      return error({ statusCode: 404, text: "Wallet not found" })
    }
    let status = {}
    try {
      status = (await $axios.get(`/wallets/${wallet.id}/status`)).data
    } catch {
      // Status may not be available if node is not running
    }
    return { wallet, status, loading: false }
  },
  data() {
    return {
      wallet: {},
      status: {},
      loading: true,
      activeTab: 0,
      logSourceTab: 0,
      logs: [],
      logsLoading: false,
      autoScroll: true,
      // Severity filters (all enabled by default)
      showCritical: true,
      showError: true,
      showWarning: true,
      showInfo: true,
      showDebug: false,
      snackbar: false,
      snackbarText: "",
      logRefreshTimer: null,
    }
  },
  computed: {
    currentLogSource() {
      return this.logSourceTab === 0 ? "lnd" : "tor"
    },
    filteredLogs() {
      const enabledLevels = new Set()
      if (this.showCritical) enabledLevels.add("CRT")
      if (this.showError) enabledLevels.add("ERR")
      if (this.showWarning) enabledLevels.add("WRN")
      if (this.showInfo) enabledLevels.add("INF")
      if (this.showDebug) {
        enabledLevels.add("DBG")
        enabledLevels.add("TRC")
      }
      return this.logs.filter(
        (e) =>
          e.source === this.currentLogSource &&
          enabledLevels.has(e.level)
      )
    },
  },
  watch: {
    activeTab(val) {
      if (val === 1) {
        // Switched to logs tab
        this.fetchLogs()
        this.startAutoRefresh()
      } else {
        this.stopAutoRefresh()
      }
    },
    logSourceTab() {
      this.fetchLogs()
    },
    filteredLogs() {
      if (this.autoScroll) {
        this.$nextTick(() => {
          const el = this.$refs.logContainer
          if (el) el.scrollTop = el.scrollHeight
        })
      }
    },
  },
  beforeDestroy() {
    this.stopAutoRefresh()
  },
  methods: {
    logColor(level) {
      switch (level) {
        case "CRT":
          return "#ff1744"
        case "ERR":
          return "#ff5252"
        case "WRN":
          return "#ffab40"
        case "INF":
          return "#e0e0e0"
        case "DBG":
        case "TRC":
          return "#757575"
        default:
          return "#bdbdbd"
      }
    },
    async fetchLogs() {
      this.logsLoading = true
      try {
        const { data } = await this.$axios.get(
          `/wallets/${this.wallet.id}/logs?source=all`
        )
        this.logs = data || []
      } catch (e) {
        this.snackbarText = "Failed to fetch logs"
        this.snackbar = true
      }
      this.logsLoading = false
    },
    startAutoRefresh() {
      this.stopAutoRefresh()
      this.logRefreshTimer = setInterval(() => {
        this.fetchLogs()
      }, 3000)
    },
    stopAutoRefresh() {
      if (this.logRefreshTimer) {
        clearInterval(this.logRefreshTimer)
        this.logRefreshTimer = null
      }
    },
    async refresh() {
      this.loading = true
      try {
        const { data } = await this.$axios.get(
          `/wallets/${this.wallet.id}/status`
        )
        this.status = data
      } catch (e) {
        this.snackbarText = "Failed to fetch node status"
        this.snackbar = true
      }
      this.loading = false
    },
  },
}
</script>
