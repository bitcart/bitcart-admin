<template>
  <v-card
    height="100%"
    class="plugin-card d-flex flex-column"
    :class="{ 'plugin-card-featured': plugin.pinned }"
    elevation="3"
  >
    <div v-if="plugin.pinned" class="featured-badge">
      <v-icon color="white" size="small" class="mr-1">mdi-star</v-icon>
      <span>Featured</span>
    </div>

    <v-card-item>
      <v-card-title class="plugin-title text-truncate">
        {{ plugin.name }}
      </v-card-title>
      <v-card-subtitle class="pt-2">
        <div class="d-flex align-center">
          <v-icon size="small" class="mr-1">mdi-account</v-icon>
          <span class="text-body-2">{{ plugin.author }}</span>
        </div>
        <div class="d-flex align-center mt-1">
          <v-icon size="small" class="mr-1">mdi-calendar</v-icon>
          <span class="text-body-2">{{ formatDate(plugin.created) }}</span>
        </div>
      </v-card-subtitle>
    </v-card-item>

    <v-card-text class="flex-grow-1">
      <p class="plugin-description text-body-1">{{ plugin.description }}</p>

      <v-divider class="my-3"></v-divider>

      <div class="pricing-section">
        <template v-if="plugin.pricing_info.fully_free">
          <v-chip color="success" size="small" variant="elevated" class="mb-2"
            >Free</v-chip
          >
        </template>
        <template v-else>
          <div class="d-flex align-center mb-2">
            <v-icon size="small" color="primary" class="mr-1"
              >mdi-currency-usd</v-icon
            >
            <span class="text-subtitle-1 font-weight-bold"
              >{{ formatPrice(plugin.pricing_info.base_amount) }}/month</span
            >
          </div>

          <div
            v-if="plugin.pricing_info.volume_threshold"
            class="text-body-2 text-medium-emphasis d-flex align-center mb-1"
          >
            <v-icon size="small" color="grey" class="mr-1"
              >mdi-information-outline</v-icon
            >
            <span
              >{{ plugin.pricing_info.percentage_rate }}% fee after
              {{ formatPrice(plugin.pricing_info.volume_threshold) }}
              volume</span
            >
          </div>

          <div
            v-if="plugin.pricing_info.yearly_discount"
            class="text-body-2 text-success d-flex align-center"
          >
            <v-icon size="small" color="success" class="mr-1">mdi-tag</v-icon>
            <span
              >Save {{ plugin.pricing_info.yearly_discount }}% with yearly
              billing</span
            >
          </div>
        </template>
      </div>
    </v-card-text>

    <v-card-actions class="pa-4 pt-0">
      <div v-if="isPluginInstalled(plugin)" class="d-flex align-center">
        <v-icon color="success" size="small" class="mr-1"
          >mdi-check-circle</v-icon
        >
        <span class="text-success font-weight-medium">Installed</span>
      </div>
      <v-btn
        v-else
        :color="
          plugin.pricing_info.fully_free || hasValidLicense(plugin)
            ? 'primary'
            : 'success'
        "
        variant="elevated"
        block
        class="text-button font-weight-bold"
        @click="
          plugin.pricing_info.fully_free || hasValidLicense(plugin)
            ? downloadPlugin(plugin)
            : purchasePlugin(plugin)
        "
      >
        <v-icon size="small" class="mr-1">
          {{
            plugin.pricing_info.fully_free || hasValidLicense(plugin)
              ? "mdi-download"
              : "mdi-cart"
          }}
        </v-icon>
        {{
          plugin.pricing_info.fully_free || hasValidLicense(plugin)
            ? "Install"
            : "Purchase"
        }}
      </v-btn>
    </v-card-actions>

    <v-dialog v-model="showPurchaseDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5 pa-4">
          <v-icon color="primary" class="mr-2">mdi-cart</v-icon>
          Purchase {{ plugin.name }}
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-4">
          <v-form ref="purchaseForm" v-model="purchaseFormValid">
            <v-text-field
              v-model="purchaseData.customer_email"
              label="Email"
              :rules="[rules.required, rules.email]"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              class="mb-4"
            />
            <v-checkbox
              v-model="purchaseData.agreeToTerms"
              :rules="[rules.required]"
              color="primary"
              hide-details="auto"
              class="mb-4"
            >
              <template #label>
                <div>
                  I agree to the Bitcart Paid Plugins
                  <a
                    href="https://bitcart.ai/plugins/tos"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary text-decoration-none"
                    @click.stop
                    >Terms of Service</a
                  >
                  and
                  <a
                    href="https://bitcart.ai/plugins/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary text-decoration-none"
                    @click.stop
                    >Privacy Policy</a
                  >
                </div>
              </template>
            </v-checkbox>
            <v-checkbox
              v-if="plugin.pricing_info.yearly_discount"
              v-model="purchaseData.yearly"
              :label="`Yearly subscription`"
              color="success"
              hide-details
              class="mb-2"
            />
            <v-chip
              v-if="plugin.pricing_info.yearly_discount"
              color="success"
              variant="flat"
              size="small"
              class="mb-4"
            >
              <v-icon start size="small">mdi-tag</v-icon>
              Save {{ plugin.pricing_info.yearly_discount }}% yearly
            </v-chip>

            <div
              v-if="plugin.pricing_info.yearly_discount && purchaseData.yearly"
              class="mt-4 pa-4 bg-success-lighten-5 rounded-lg"
            >
              <div class="d-flex align-center">
                <v-icon color="success" size="large" class="mr-2"
                  >mdi-cash-check</v-icon
                >
                <div>
                  <div class="text-h6 text-success font-weight-bold">
                    Save
                    {{
                      formatPrice(
                        ((plugin.pricing_info.base_amount || 0) *
                          12 *
                          (plugin.pricing_info.yearly_discount || 0)) /
                          100
                      )
                    }}
                  </div>
                  <div class="text-success">per year with annual billing</div>
                </div>
              </div>
            </div>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            color="error"
            variant="text"
            @click="showPurchaseDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="purchaseLoading"
            :disabled="!purchaseFormValid"
            @click="createLicense"
          >
            Complete Purchase
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { LICENSING_SERVER, LICENSING_CHECKOUT_URL } from "@/version"

export default {
  props: {
    plugin: {
      type: Object,
      required: true,
    },
    plugins: {
      type: Array,
      required: true,
    },
    licenseKeys: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      showPurchaseDialog: false,
      purchaseFormValid: false,
      purchaseLoading: false,
      purchaseData: {
        customer_email: "",
        yearly: false,
        agreeToTerms: false,
      },
      rules: {
        required: (v) => !!v || "This field is required",
        email: (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
      },
    }
  },
  methods: {
    isPluginInstalled(marketplacePlugin) {
      return this.plugins.some(
        (p) =>
          p.name === marketplacePlugin.name &&
          p.author === marketplacePlugin.author
      )
    },
    hasValidLicense(plugin) {
      return this.licenseKeys.some(
        (license) =>
          license.plugin_name === plugin.name &&
          license.plugin_author === plugin.author &&
          license.active
      )
    },
    purchasePlugin() {
      this.showPurchaseDialog = true
    },
    downloadPlugin() {
      let licenseKey = ""
      if (!this.plugin.pricing_info.fully_free) {
        const license = this.licenseKeys.find(
          (l) =>
            l.plugin_name === this.plugin.name &&
            l.plugin_author === this.plugin.author &&
            l.active
        )
        licenseKey = license ? `?license_key=${license.license_key}` : ""
      }
      this.$axios
        .get(
          `${LICENSING_SERVER}/plugins/${this.plugin.id}/download${licenseKey}`,
          {
            responseType: "blob",
          }
        )
        .then((resp) => {
          const pluginFile = new File(
            [resp.data],
            `${this.plugin.name}.bitcart`,
            {
              type: "application/octet-stream",
            }
          )
          const formData = new FormData()
          formData.append("plugin", pluginFile)
          this.$axios
            .post("/plugins/install", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then(() => {
              this.$emit("plugin-installed")
            })
        })
    },
    createLicense() {
      if (!this.$refs.purchaseForm.validate()) return
      this.purchaseLoading = true
      this.$axios
        .post(`${LICENSING_SERVER}/licenses`, {
          plugin_id: this.plugin.id,
          pricing_model: this.purchaseData.yearly ? "yearly" : "monthly",
          customer_email: this.purchaseData.customer_email,
        })
        .then((resp) => {
          this.showPurchaseDialog = false
          window.location.href = `${LICENSING_CHECKOUT_URL}/i/${resp.data.invoice_id}`
        })
        .finally(() => {
          this.purchaseLoading = false
        })
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      const options = { year: "numeric", month: "short", day: "numeric" }
      return date.toLocaleDateString(undefined, options)
    },
    formatPrice(price) {
      if (!price) return ""
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price)
    },
  },
}
</script>

<style scoped>
.plugin-card {
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  border-radius: 12px;
  overflow: hidden;
}

.plugin-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.plugin-card-featured {
  border-top: 3px solid var(--v-primary-base);
}

.featured-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--v-primary-base);
  color: white;
  padding: 4px 8px;
  border-radius: 0 8px 0 8px;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  z-index: 1;
}

.plugin-title {
  font-weight: 700;
  font-size: 1.25rem;
  line-height: 1.4;
}

.plugin-description {
  min-height: 4.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  opacity: 0.8;
}

.pricing-section {
  min-height: 5rem;
}

.pricing-detail {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
}

.pricing-detail.discount {
  color: var(--v-success-base);
}
</style>
