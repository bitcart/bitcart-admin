<template>
  <v-container class="container">
    <div class="alerts">
      <v-alert
        v-if="!value.domainSettings.domain && !isEnabledService('tor')"
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
      <v-col cols="12" md="4">
        <v-card height="100%">
          <v-card-title class="text-h4 font-weight-bold"
            >Deployment</v-card-title
          >
          <v-card-text class="text--primary">
            <pretty-text text="Destination:" :value="value.mode.name" />
            <p class="text-h4 font-weight-bold">SSH Settings</p>
            <pretty-text text="Host:" :value="value.mode.sshSettings.host" />
            <pretty-text
              text="Username:"
              :value="value.mode.sshSettings.username"
            />
            <pretty-text
              text="Password:"
              :value="value.mode.sshSettings.password"
            />
            <pretty-text
              text="Root password:"
              :value="value.mode.sshSettings.root_password"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card height="100%">
          <v-card-title class="text-h4 font-weight-bold">Domains</v-card-title>
          <v-card-text class="text--primary">
            <pretty-text text="Domain:" :value="value.domainSettings.domain" />
            <v-checkbox
              :input-value="value.domainSettings.https"
              disabled
              label="HTTPS Enabled"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card height="100%">
          <v-card-title class="text-h4 font-weight-bold">Coins</v-card-title>
          <v-card-text v-if="!noCoins" class="text--primary">
            <div v-for="(coin, symbol) in availableCoins" :key="symbol">
              <p class="text-h5">{{ symbol.toUpperCase() }}</p>
              <pretty-text text="Network:" :value="coin.network" />
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
      <v-col cols="12" md="4">
        <v-card height="100%">
          <v-card-title class="text-h4 font-weight-bold"
            >Additional services</v-card-title
          >
          <v-card-text class="text--primary">
            <div
              v-for="(enabled, service) in value.additionalServices.services"
              :key="service"
            >
              <pretty-text
                :text="`${capitalize(service)}:`"
                :value="enabled ? 'Enabled' : 'Not enabled'"
                title-class="text-h5"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card height="100%">
          <v-card-title class="text-h4 font-weight-bold"
            >Advanced Settings</v-card-title
          >
          <v-card-text class="text--primary">
            <pretty-text
              text="Installation pack:"
              :value="value.advancedSettings.installationPack"
            />
            <pretty-text
              text="Additional components:"
              :value="value.advancedSettings.additionalComponents.join(', ')"
            />
            <pretty-text
              text="Custom bitcart-docker URL:"
              :value="value.advancedSettings.customRepoURL"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import PrettyText from "@/components/PrettyText"
export default {
  components: {
    PrettyText,
  },
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
        ...Object.entries(this.value.coins.coins)
          .filter(([k, v]) => v.enabled)
          .map(([k, v]) => ({ [k]: v }))
      )
    },
    noCoins() {
      return Object.keys(this.availableCoins).length <= 0
    },
  },
  methods: {
    capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1)
    },
    isEnabledService(service) {
      return (
        service in this.value.additionalServices.services &&
        this.value.additionalServices.services[service]
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
