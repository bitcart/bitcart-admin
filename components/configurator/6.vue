<template>
  <v-container class="container">
    <div class="alerts">
      <v-alert
        v-if="isUnset(value.domainSettings.domain) && !isEnabledService('tor')"
        type="warning"
        >Warning: no domain specified. Please enter your domain or enable Tor
        support to be able to get a working installation</v-alert
      >
      <v-alert v-if="noCoins" type="warning"
        >Warning: no coins selected. Installation will break, please select at
        least one coin to install</v-alert
      >
    </div>
    <v-row>
      <v-col cols="4">
        <v-card height="100%">
          <v-card-title class="text-h4 font-weight-bold"
            >Deployment</v-card-title
          >
          <v-card-text class="text--primary">
            <v-row class="pa-0">
              <v-col cols="8" class="py-0">
                <p class="text-h6">Destination:</p>
              </v-col>
              <v-col cols="4" class="py-0">
                <p class="text-h6 font-weight-regular">
                  {{ value.mode }}
                </p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card height="100%">
          <v-card-title class="text-h4 font-weight-bold">Domains</v-card-title>
          <v-card-text class="text--primary">
            <v-row class="pa-0">
              <v-col cols="8" class="py-0">
                <p class="text-h6">Domain:</p>
              </v-col>
              <v-col cols="4" class="py-0">
                <p class="text-h6 font-weight-regular">
                  {{ getOrEmpty(value.domainSettings.domain) }}
                </p>
              </v-col>
            </v-row>
            <v-checkbox
              :input-value="value.domainSettings.https"
              disabled
              label="HTTPS Enabled"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card height="100%">
          <v-card-title class="text-h4 font-weight-bold">Coins</v-card-title>
          <v-card-text v-if="!noCoins" class="text--primary">
            <div v-for="(coin, symbol) in availableCoins" :key="symbol">
              <p class="text-h5">{{ symbol.toUpperCase() }}</p>
              <v-row class="pa-0">
                <v-col cols="8" class="py-0">
                  <p class="text-h6">Network:</p>
                </v-col>
                <v-col cols="4" class="py-0">
                  <p class="text-h6 font-weight-regular">
                    {{ coin.network }}
                  </p>
                </v-col>
              </v-row>
              <v-checkbox
                :input-value="coin.lightning"
                disabled
                label="Lightning Enabled"
              />
            </div>
          </v-card-text>
          <v-card-text v-else class="text--primary">
            <p class="text-h6 font-weight-regular">Not set</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-card height="100%">
          <v-card-title class="text-h4 font-weight-bold"
            >Additional services</v-card-title
          >
          <v-card-text class="text--primary">
            <div
              v-for="(enabled, service) in value.additionalServices"
              :key="service"
            >
              <v-row class="pa-0">
                <v-col cols="8" class="py-0">
                  <p class="text-h5">{{ capitalize(service) }}:</p>
                </v-col>
                <v-col cols="4" class="py-0">
                  <p class="text-h6 font-weight-regular">
                    {{ enabled ? "Enabled" : "Not enabled" }}
                  </p>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card height="100%">
          <v-card-title class="text-h4 font-weight-bold"
            >Advanced Settings</v-card-title
          >
          <v-card-text class="text--primary">
            <v-row class="pa-0">
              <v-col cols="8" class="py-0">
                <p class="text-h6">Installation pack:</p>
              </v-col>
              <v-col cols="4" class="py-0">
                <p class="text-h6 font-weight-regular">
                  {{ getOrEmpty(value.advancedSettings.installationPack) }}
                </p>
              </v-col>
            </v-row>
            <v-row class="pa-0">
              <v-col cols="8" class="py-0">
                <p class="text-h6">Additional components:</p>
              </v-col>
              <v-col cols="4" class="py-0">
                <p class="text-h6 font-weight-regular">
                  {{
                    getOrEmpty(
                      value.advancedSettings.additionalComponents.join(", ")
                    )
                  }}
                </p>
              </v-col>
            </v-row>
            <v-row class="pa-0">
              <v-col cols="8" class="py-0">
                <p class="text-h6">Custom bitcart-docker URL:</p>
              </v-col>
              <v-col cols="4" class="py-0">
                <p class="text-h6 font-weight-regular">
                  {{ getOrEmpty(value.advancedSettings.customRepoURL) }}
                </p>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  computed: {
    availableCoins() {
      return Object.assign(
        {},
        ...Object.entries(this.value.coins)
          .filter(([k, v]) => v.enabled)
          .map(([k, v]) => ({ [k]: v }))
      )
    },
    noCoins() {
      return Object.keys(this.availableCoins).length <= 0
    },
  },
  methods: {
    isUnset(val) {
      return !val
    },
    getOrEmpty(val) {
      if (this.isUnset(val)) return "Not set"
      return val
    },
    capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    },
    isEnabledService(service) {
      return (
        service in this.value.additionalServices &&
        this.value.additionalServices[service]
      )
    },
  },
}
</script>

<style scoped>
.v-application .text-h6 {
  line-height: 0.8 !important;
}
</style>
