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
    <v-alert v-if="needsRestart" text type="info" class="mb-4">
      Server needs to be restarted for plugin changes to take effect
      <v-btn
        color="info"
        class="ml-4"
        :loading="restarting"
        @click="restartServer"
      >
        Restart Server
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
        <p class="text-h4">Available plugins</p>
        <v-row>
          <v-col
            v-for="plugin in marketplacePlugins"
            :key="plugin.id"
            md="3"
            cols="12"
          >
            <v-card
              height="100%"
              max-width="350"
              class="ml-1 d-flex flex-column"
            >
              <div class="flex-grow-1">
                <v-card-title>
                  {{ plugin.name }}<br />
                  Author: {{ plugin.author }}<br />
                  Announced: {{ new Date(plugin.created).toLocaleDateString() }}
                </v-card-title>
                <v-card-text class="py-0">
                  <p class="text-h6">
                    {{ plugin.description }}
                  </p>
                  <v-divider class="my-2" />
                  <div v-if="plugin.pricing_info">
                    <p
                      v-if="plugin.pricing_info.fully_free"
                      class="success--text"
                    >
                      Free plugin
                    </p>
                    <div v-else>
                      <p>
                        Base price: ${{ plugin.pricing_info.base_amount }}/mo
                      </p>
                      <p v-if="plugin.pricing_info.volume_threshold">
                        {{ plugin.pricing_info.percentage_rate }}% fee after ${{
                          plugin.pricing_info.volume_threshold
                        }}
                        volume
                      </p>
                      <p v-if="plugin.pricing_info.yearly_discount">
                        {{ plugin.pricing_info.yearly_discount }}% yearly
                        discount available
                      </p>
                    </div>
                  </div>
                </v-card-text>
              </div>
              <v-card-actions>
                <v-container>
                  <v-row class="justify-center align-center">
                    <div
                      v-if="isPluginInstalled(plugin)"
                      class="d-flex align-center"
                    >
                      <v-icon color="success" class="mr-2">
                        mdi-check-circle
                      </v-icon>
                      <span class="success--text">Installed</span>
                    </div>
                    <v-btn
                      v-else
                      color="primary"
                      @click="
                        plugin.pricing_info.fully_free ||
                        hasValidLicense(plugin)
                          ? downloadPlugin(plugin)
                          : purchasePlugin(plugin)
                      "
                    >
                      {{
                        plugin.pricing_info.fully_free ||
                        hasValidLicense(plugin)
                          ? "Install"
                          : "Purchase"
                      }}
                    </v-btn>
                  </v-row>
                </v-container>
              </v-card-actions>
            </v-card>
          </v-col>
          <v-col
            v-if="!marketplaceLoading && $utils.isEmpty(marketplacePlugins)"
          >
            <p>No plugins available.</p>
          </v-col>
        </v-row>
      </v-tab-item>
    </v-tabs-items>
    <v-dialog
      v-if="selectedPlugin"
      v-model="showPurchaseDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title class="text-h5"
          >Purchase {{ selectedPlugin.name }}</v-card-title
        >
        <v-card-text>
          <v-form ref="purchaseForm" v-model="purchaseFormValid">
            <v-text-field
              v-model="purchaseData.customer_email"
              label="Email"
              :rules="[rules.required, rules.email]"
            />
            <v-checkbox
              v-if="selectedPlugin.pricing_info.yearly_discount"
              v-model="purchaseData.yearly"
              :label="`Yearly subscription (${selectedPlugin.pricing_info.yearly_discount}% discount)`"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" text @click="showPurchaseDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="purchaseLoading"
            :disabled="!purchaseFormValid"
            @click="createLicense"
          >
            Purchase
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
import ManagementCommand from "@/components/ManagementCommand.vue"
import { LICENSING_SERVER, LICENSING_CHECKOUT_URL } from "@/version"

export default {
  components: {
    ManagementCommand,
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
      selectedPlugin: null,
      purchaseFormValid: false,
      purchaseLoading: false,
      purchaseData: {
        customer_email: "",
        yearly: false,
      },
      rules: this.$utils.rules,
      showDialog: false,
      showPurchaseDialog: false,
      needsRestart: false,
      restarting: false,
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
          this.needsRestart = true
        })
    },
    postprocess(data) {
      this.fetchPlugins()
      this.needsRestart = true
    },
    fetchMarketplacePlugins() {
      this.$axios.get(`${LICENSING_SERVER}/plugins`).then((resp) => {
        this.marketplacePlugins = resp.data
        this.marketplaceLoading = false
      })
    },
    purchasePlugin(plugin) {
      this.selectedPlugin = plugin
      this.showPurchaseDialog = true
    },
    downloadPlugin(plugin) {
      let licenseKey = ""
      if (!plugin.pricing_info.fully_free) {
        const license = this.licenseKeys.find(
          (l) =>
            l.plugin_name === plugin.name &&
            l.plugin_author === plugin.author &&
            l.active
        )
        licenseKey = license ? `?license_key=${license.license_key}` : ""
      }
      this.$axios
        .get(`${LICENSING_SERVER}/plugins/${plugin.id}/download${licenseKey}`, {
          responseType: "blob",
        })
        .then((resp) => {
          const pluginFile = new File([resp.data], `${plugin.name}.bitcart`, {
            type: "application/octet-stream",
          })
          const formData = new FormData()
          formData.append("plugin", pluginFile)
          this.$axios
            .post("/plugins/install", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then(() => {
              this.fetchPlugins()
              this.needsRestart = true
            })
        })
    },
    createLicense() {
      if (!this.$refs.purchaseForm.validate()) return
      this.purchaseLoading = true
      this.$axios
        .post(`${LICENSING_SERVER}/licenses`, {
          plugin_id: this.selectedPlugin.id,
          pricing_model: this.purchaseData.yearly ? "yearly" : "monthly",
          customer_email: this.purchaseData.customer_email,
        })
        .then((resp) => {
          this.showPurchaseDialog = false
          this.$router.push(
            `${LICENSING_CHECKOUT_URL}/i/${resp.data.invoice_id}`
          )
        })
        .finally(() => {
          this.purchaseLoading = false
        })
    },
    isPluginInstalled(marketplacePlugin) {
      return this.plugins.some(
        (p) =>
          p.name === marketplacePlugin.name &&
          p.author === marketplacePlugin.author
      )
    },
    restartServer() {
      this.restarting = true
      this.$axios
        .post("/manage/restart")
        .then(() => {
          this.needsRestart = false
        })
        .finally(() => {
          this.restarting = false
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
    hasValidLicense(plugin) {
      return this.licenseKeys.some(
        (license) =>
          license.plugin_name === plugin.name &&
          license.plugin_author === plugin.author &&
          license.active
      )
    },
  },
}
</script>
