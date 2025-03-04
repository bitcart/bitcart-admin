<template>
  <v-container>
    <v-dialog v-model="showDialog">
      <v-card>
        <v-card-title class="justify-center text-h4 font-weight-bold"
          >Plugin manifest</v-card-title
        >
        <v-card-text class="text--primary">
          <div>
            <code style="white-space: pre-wrap" v-text="pluginManifest" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-alert v-if="failed" type="error"
      >Plugins installation failed. Images restored to original state. Please
      check and uninstall incorrect plugins</v-alert
    >
    <v-alert v-if="needsReload" text type="info" class="mb-4">
      Server plugins need to be reloaded for plugin changes to take effect
      <v-btn
        color="info"
        class="ml-4"
        :loading="reloading"
        @click="reloadPlugins"
      >
        Reload Plugins
      </v-btn>
    </v-alert>
    <v-expansion-panels v-model="expandedPanel" class="mb-6">
      <v-expansion-panel>
        <v-expansion-panel-header> License Keys </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-data-table
            :headers="licenseHeaders"
            :items="licenseKeys"
            :loading="licensesLoading"
          >
            <template #top>
              <v-toolbar flat>
                <v-toolbar-title>Plugin Licenses</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-dialog v-model="licenseDialog" max-width="500px">
                  <template #activator="{ on, attrs }">
                    <v-btn
                      color="primary"
                      dark
                      class="mb-2"
                      v-bind="attrs"
                      v-on="on"
                    >
                      Add License
                    </v-btn>
                  </template>
                  <v-card>
                    <v-card-title>
                      <span class="text-h5">Add License Key</span>
                    </v-card-title>
                    <v-card-text>
                      <v-container>
                        <v-text-field
                          v-model="editedLicense.license_key"
                          label="License Key"
                        ></v-text-field>
                      </v-container>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn color="error" text @click="closeLicenseDialog">
                        Cancel
                      </v-btn>
                      <v-btn color="primary" text @click="saveLicense">
                        Save
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-toolbar>
            </template>
            <template #item.actions="{ item }">
              <v-icon small class="mr-2" @click="deleteLicense(item)">
                mdi-delete
              </v-icon>
            </template>
            <template #item.active="{ value }">
              <v-chip :color="value ? 'success' : 'error'" small>
                {{ value ? "Active" : "Inactive" }}
              </v-chip>
            </template>
            <template #item.next_billing_date="{ value }">
              {{ value ? new Date(value).toLocaleDateString() : "N/A" }}
            </template>
            <template #item.plugin_description="{ value }">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <span
                    class="text-truncate d-inline-block"
                    style="max-width: 200px"
                    v-bind="attrs"
                    v-on="on"
                  >
                    {{ value }}
                  </span>
                </template>
                <span>{{ value }}</span>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-tabs v-model="activeTab" class="mb-6">
      <v-tab>Installed Plugins</v-tab>
      <v-tab>Plugin Marketplace</v-tab>
    </v-tabs>
    <v-tabs-items v-model="activeTab">
      <v-tab-item>
        <p class="text-h4">Installed plugins</p>
        <v-row>
          <v-col
            v-for="plugin in plugins"
            :key="plugin.author + plugin.name"
            md="3"
            cols="12"
          >
            <v-card height="100%" max-width="350" class="ml-1">
              <div style="overflow-y: auto; height: 250px">
                <v-card-title
                  >{{ plugin.name }}<br />
                  Version: {{ plugin.version }}<br />
                  Author: {{ plugin.author }}</v-card-title
                >
                <v-card-text class="py-0">
                  <p class="text-h6">
                    {{ plugin.description }}
                  </p>
                </v-card-text>
              </div>
              <v-card-actions>
                <v-container>
                  <v-row class="pb-2">
                    <v-btn
                      v-if="plugin.website"
                      icon
                      :href="plugin.website"
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      <v-icon>mdi-web</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="plugin.docs_url"
                      icon
                      :href="plugin.docs_url"
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      <v-icon>mdi-book-open-variant</v-icon>
                    </v-btn>
                    <v-btn
                      v-if="plugin.source_url"
                      icon
                      :href="plugin.source_url"
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      <v-icon>mdi-code-tags</v-icon>
                    </v-btn>
                    <v-tooltip v-if="plugin.license" bottom>
                      <template #activator="{ on, attrs }">
                        <v-icon v-bind="{ ...attrs, ...$attrs }" v-on="on">
                          mdi-license
                        </v-icon>
                      </template>
                      <span>License: {{ plugin.license }}</span>
                    </v-tooltip>
                  </v-row>
                  <v-row class="justify-space-between">
                    <v-btn color="primary" @click="showDetails(plugin)">
                      Details
                    </v-btn>
                    <v-btn color="error" @click="uninstallPlugin(plugin)"
                      >Uninstall</v-btn
                    >
                  </v-row>
                </v-container>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col v-if="!loading && $utils.isEmpty(plugins)">
            <p>No plugins found. Install some!</p>
          </v-col>
        </v-row>
        <p class="text-h4">Upload plugin</p>
        <v-file-input
          v-model="file"
          :rules="fileRules"
          label="Plugin file"
        ></v-file-input>
        <ManagementCommand
          title="Upload plugin"
          details="Installs a plugin from .bitcart file"
          btn-text="Start plugin installation process"
          command-prefix="plugins"
          what="install"
          file-attr="plugin"
          class="pb-3"
          :file="true"
          :file-to-upload="file"
          :postprocess="postprocess"
        />
      </v-tab-item>
      <v-tab-item>
        <div>
          <div
            v-if="sortedMarketplacePlugins.some((p) => p.pinned)"
            class="mb-8"
          >
            <h3 class="text-h5 mb-4 font-weight-medium">
              <v-icon color="amber-darken-2" class="mr-2">mdi-star</v-icon>
              Featured Plugins
            </h3>
            <v-row>
              <v-col
                v-for="plugin in sortedMarketplacePlugins.filter(
                  (p) => p.pinned
                )"
                :key="plugin.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
                class="pa-2 ma-2"
              >
                <plugin-card
                  :plugin="plugin"
                  :plugins="plugins"
                  :license-keys="licenseKeys"
                  @plugin-installed="handlePluginInstalled"
                />
              </v-col>
            </v-row>
          </div>
          <div>
            <h3 class="text-h5 mb-4 font-weight-medium">
              <v-icon class="mr-2">mdi-puzzle</v-icon>
              All Plugins
            </h3>
            <v-row>
              <v-col
                v-for="plugin in sortedMarketplacePlugins"
                :key="plugin.id"
                cols="12"
                sm="6"
                md="4"
                lg="3"
                class="pa-2 ma-2"
              >
                <plugin-card
                  :plugin="plugin"
                  :plugins="plugins"
                  :license-keys="licenseKeys"
                  @plugin-installed="handlePluginInstalled"
                />
              </v-col>

              <v-col
                v-if="!marketplaceLoading && $utils.isEmpty(marketplacePlugins)"
              >
                <v-alert type="info" variant="tonal">
                  <div class="d-flex align-center">
                    <div>
                      <p class="text-h6 mb-1">No plugins available</p>
                      <p class="mb-0">Check back later for new plugins</p>
                    </div>
                  </div>
                </v-alert>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-tab-item>
    </v-tabs-items>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="2500"
      bottom
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script>
import PluginCard from "@/components/PluginCard.vue"
import ManagementCommand from "@/components/ManagementCommand.vue"
import { LICENSING_SERVER } from "@/version"

export default {
  components: {
    ManagementCommand,
    PluginCard,
  },
  middleware: "superuserOnly",
  data() {
    return {
      activeTab: 0,
      plugins: [],
      failed: false,
      file: null,
      loading: true,
      pluginManifest: "",
      fileRules: [
        (value) =>
          !value ||
          value.size < 50 * 1024 * 1024 ||
          "Backup size should be less than 50 MB!",
      ],
      marketplacePlugins: [],
      marketplaceLoading: true,
      showDialog: false,
      needsReload: false,
      reloading: false,
      expandedPanel: 0,
      licenseDialog: false,
      licensesLoading: true,
      licenseKeys: [],
      editedLicense: {
        license_key: "",
      },
      snackbar: {
        show: false,
        text: "",
        color: "error",
      },
      licenseHeaders: [
        { text: "Plugin", value: "plugin_name" },
        { text: "Author", value: "plugin_author" },
        { text: "Description", value: "plugin_description" },
        { text: "License Key", value: "license_key" },
        {
          text: "Next Billing",
          value: "next_billing_date",
          format: (v) => new Date(v).toLocaleDateString(),
        },
        {
          text: "Status",
          value: "active",
          format: (v) => (v ? "Active" : "Inactive"),
        },
        { text: "Actions", value: "actions", sortable: false },
      ],
    }
  },
  computed: {
    sortedMarketplacePlugins() {
      return [...this.marketplacePlugins].sort((a, b) => {
        if (a.pinned === b.pinned) {
          return 0
        }
        return a.pinned ? -1 : 1
      })
    },
  },
  beforeMount() {
    this.fetchPlugins()
    this.fetchMarketplacePlugins()
    this.fetchLicenses()
  },
  methods: {
    fetchPlugins() {
      this.$axios.get("/plugins").then((resp) => {
        this.plugins = resp.data.plugins
        this.failed = !resp.data.success
        this.loading = false
      })
    },
    showDetails(plugin) {
      this.pluginManifest = plugin
      this.showDialog = true
    },
    uninstallPlugin(plugin) {
      this.$axios
        .post("/plugins/uninstall", {
          name: plugin.name,
          author: plugin.author,
        })
        .then(() => {
          this.plugins = this.plugins.filter(
            (p) => p.name !== plugin.name || p.author !== plugin.author
          )
          this.needsReload = true
        })
    },
    postprocess(data) {
      this.fetchPlugins()
      this.needsReload = true
    },
    fetchMarketplacePlugins() {
      this.$axios.get(`${LICENSING_SERVER}/plugins`).then((resp) => {
        this.marketplacePlugins = resp.data
        this.marketplaceLoading = false
      })
    },
    handlePluginInstalled() {
      this.fetchPlugins()
      this.needsReload = true
    },
    reloadPlugins() {
      this.reloading = true
      this.$axios
        .post("/manage/plugin-reload")
        .then(() => {
          this.needsReload = false
        })
        .finally(() => {
          this.reloading = false
        })
    },
    fetchLicenses() {
      this.licensesLoading = true
      this.$axios
        .get("/plugins/licenses")
        .then((response) => {
          this.licenseKeys = response.data
        })
        .finally(() => {
          this.licensesLoading = false
        })
    },
    closeLicenseDialog() {
      this.licenseDialog = false
      this.editedLicense = {
        license_key: "",
      }
    },
    saveLicense() {
      this.$axios
        .post("/plugins/licenses", this.editedLicense)
        .then(() => {
          this.fetchLicenses()
          this.closeLicenseDialog()
          this.snackbar = {
            show: true,
            text: "License key added successfully",
            color: "success",
          }
        })
        .catch((error) => {
          this.snackbar = {
            show: true,
            text: error.response?.data?.detail || "Failed to add license key",
            color: "error",
          }
        })
    },
    deleteLicense(item) {
      console.log(item)
      this.$axios.delete(`/plugins/licenses/${item.license_key}`).then(() => {
        this.fetchLicenses()
      })
    },
  },
}
</script>
