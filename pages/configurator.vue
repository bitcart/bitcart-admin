<template>
  <div>
    <v-container>
      <v-stepper v-model="currentStep" non-linear>
        <v-stepper-header>
          <template v-for="step in maxSteps">
            <v-stepper-step
              :key="`${step}-step`"
              :complete="currentStep > step"
              editable
              :step="step"
            >
              {{ headerTexts[step - 1] }}
            </v-stepper-step>
            <v-divider v-if="step !== maxSteps" :key="step"></v-divider>
          </template>
        </v-stepper-header>

        <v-stepper-items>
          <v-stepper-content
            v-for="step in maxSteps"
            :key="`${step}-content`"
            :step="step"
          >
            <v-container>
              <v-row justify="center">
                <p class="text-h6">{{ title }}</p>
              </v-row>

              <v-row justify="center" class="mb-4">
                <keep-alive>
                  <component
                    :is="currentComponent"
                    v-model="passedProp"
                    @refresh="fetchSettings()"
                  />
                </keep-alive>
              </v-row>
              <v-row justify="center">
                <v-btn color="primary" @click="nextStep"> Continue </v-btn>
              </v-row>
            </v-container>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-container>
    <v-dialog v-model="showInvalidDomainDialog" max-width="500px">
      <v-card>
        <v-card-title class="justify-center text-h4 font-weight-bold"
          >Invalid domain</v-card-title
        >
        <v-card-text class="text--primary"
          >DNS lookup failed on the domain. Without configured DNS records you
          won't be able to access your Bitcart instance. Do you want to
          proceed?</v-card-text
        >
        <v-card-text class="text-subtitle-1">
          <code>bitcart.local</code> domain is fine for local deployments, but
          our configurator can't access it, you would need to copy the script
          manually
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="success" class="mx-1" @click="startDeployment"
            >Yes</v-btn
          >
          <v-btn color="error" @click="showInvalidDomainDialog = false"
            >No, let me re-configure</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="showDialog">
      <v-card>
        <v-card-title class="justify-center text-h4 font-weight-bold"
          >Deployment result</v-card-title
        >
        <v-card-text class="text--primary">
          <div v-if="isManualDeployment">
            <p class="text-h6">Copy those commands to your terminal</p>
            <code
              style="white-space: pre-wrap"
              v-text="deploymentInfo.output"
            />
          </div>
          <div v-else>
            <div v-if="deploymentInfo.finished">
              <p class="text-h6">{{ statusText }}</p>
              <p class="text-h6">Output</p>
              <code
                v-if="deploymentInfo.output"
                style="white-space: pre-wrap"
                v-text="deploymentInfo.output"
              />
            </div>
            <div v-else>
              <p class="text-h6">
                We're sending the commands to the server and executing. This
                could take a few minutes!
              </p>
              <v-progress-linear
                indeterminate
                color="green"
              ></v-progress-linear>
            </div>
          </div>
        </v-card-text>
        <v-card-actions
          v-if="
            deploymentInfo.finished && !isManualDeployment && failedDeployment
          "
        >
          <v-btn color="primary" @click="install">Retry</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import merge from "lodash.merge"
export default {
  auth: false,
  middleware: "configurator",
  data() {
    const dt = {
      showDialog: false,
      showInvalidDomainDialog: false,
      deploymentInfo: { finished: false },
      initialInstallData: {
        mode: { name: "Manual", sshSettings: {} },
        domainSettings: { domain: null, https: true },
        coins: {
          coins: {
            btc: { network: "mainnet", lightning: false, enabled: true },
          },
          titles: { btc: "Bitcoin" }, // fallback
        },
        additionalServices: this.$utils.getExtendSetting.call(
          this,
          "services",
          {
            cards: [
              {
                title: "Tor support",
                text: "Enables Tor and hidden services support.\nMakes all the public-facing services run under Tor,\nmaking it possible to run Bitcart in complex network conditions or without a domain",
                docs: "https://docs.bitcart.ai/guides/tor",
                service: "tor",
              },
            ],
            services: { tor: false },
          }
        ),
        advancedSettings: {
          installationPack: "all",
          additionalComponents: [],
          customRepoURL: null,
          focusOn: false, // used for enter key management, not for sending
        },
      },
      currentStep: 1,
      maxSteps: 6,
      headerTexts: [
        "Destination",
        "Domains",
        "Coins",
        "Additional",
        "Advanced",
        "Summary",
      ],
      titles: [
        "What Bitcart instance are you configuring?",
        "How will you be accessing your Bitcart?",
        "Which coins to enable?",
        "Something else?",
        "Advanced settings",
        "Does this look right to you?",
      ],
      keys: [
        "mode",
        "domainSettings",
        "coins",
        "additionalServices",
        "advancedSettings",
      ],
    }
    dt.installData = JSON.parse(JSON.stringify(dt.initialInstallData))
    return dt
  },
  computed: {
    title() {
      return this.titles[this.currentStep - 1]
    },
    currentComponent() {
      const name = `${this.currentStep}.vue`
      return () => import(`@/components/configurator/${name}`)
    },
    currentKey() {
      return this.keys[this.currentStep - 1]
    },
    currentMode() {
      return this.installData.mode.name
    },
    passedProp: {
      get() {
        return this.installData[this.currentKey] || this.installData
      },
      set(v) {
        this.installData[this.currentKey] = v
      },
    },
    isManualDeployment() {
      return this.currentMode === "Manual"
    },
    failedDeployment() {
      return !this.deploymentInfo.success
    },
    statusText() {
      return !this.failedDeployment
        ? "Successfully installed Bitcart"
        : "Deployment failed"
    },
  },
  watch: {
    currentMode(v) {
      if (v === "Current") this.fetchSettings()
    },
  },
  mounted() {
    this.handler = (e) => {
      if (e.keyCode === 13 && !this.installData.advancedSettings.focusOn)
        this.nextStep()
    }
    window.addEventListener("keyup", this.handler)
    this.$axios.get("/cryptos/supported").then((r) => {
      this.installData.coins.titles = r.data
      this.initialInstallData.coins.titles = r.data
    })
  },
  beforeDestroy() {
    window.removeEventListener("keyup", this.handler)
  },
  methods: {
    getAdditionalServices(enabledServices) {
      const services = {}
      for (const service of this.installData.additionalServices.cards) {
        services[service.service] = enabledServices.includes(service.service)
      }
      return services
    },
    fetchSettings() {
      let sshSettings = null
      if (this.currentMode === "Remote")
        sshSettings = this.installData.mode.sshSettings
      this.$axios
        .post("/configurator/server-settings", sshSettings)
        .then((r) => {
          const data = {
            domainSettings: {
              domain: r.data.domain_settings.domain,
              https: r.data.domain_settings.https,
            },
            coins: {
              coins: r.data.coins,
            },
            additionalServices: {
              services: this.getAdditionalServices(
                r.data.advanced_settings.additional_components
              ),
            },
            advancedSettings: {
              installationPack: r.data.advanced_settings.installation_pack,
              additionalComponents:
                r.data.advanced_settings.additional_components,
              customRepoURL: r.data.advanced_settings.bitcart_docker_repository,
            },
            mode: {
              name: this.currentMode,
              sshSettings: this.installData.mode.sshSettings,
            },
          }
          this.installData = merge({}, this.initialInstallData, data)
        })
    },
    nextStep() {
      if (this.currentStep === this.maxSteps) this.install()
      else this.currentStep++
    },
    install() {
      this.$axios
        .get(
          `/configurator/dns-resolve?name=${this.installData.domainSettings.domain}`
        )
        .then((r) => {
          if (r.data) this.startDeployment()
          else this.showInvalidDomainDialog = true
        })
    },
    startDeployment() {
      const additionalServices = Object.entries(
        this.installData.additionalServices.services
      )
        .filter(([k, v]) => v)
        .map(([k, v]) => k)
      const enabledCoins = Object.assign(
        {},
        ...Object.entries(this.installData.coins.coins)
          .filter(([k, v]) => v.enabled)
          .map(([k, v]) => ({ [k]: v }))
      )
      this.showInvalidDomainDialog = false
      this.deploymentInfo.finished = false
      this.showDialog = true
      this.$axios
        .post("/configurator/deploy", {
          mode: this.currentMode,
          ssh_settings: this.installData.mode.sshSettings,
          domain_settings: this.installData.domainSettings,
          coins: enabledCoins,
          additional_services: additionalServices,
          advanced_settings: {
            installation_pack:
              this.installData.advancedSettings.installationPack,
            bitcart_docker_repository:
              this.installData.advancedSettings.customRepoURL,
            additional_components:
              this.installData.advancedSettings.additionalComponents,
          },
        })
        .then((r) => {
          this.deploymentInfo = r.data
          if (!this.isManualDeployment) this.pollDeployment(r.data.id)
        })
    },
    pollDeployment(deployId) {
      this.$axios.get(`/configurator/deploy-result/${deployId}`).then((r) => {
        this.deploymentInfo = r.data
        if (!this.deploymentInfo.finished)
          setTimeout(this.pollDeployment, 3000, deployId)
      })
    },
  },
}
</script>
