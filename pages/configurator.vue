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
            <v-row justify="center">
              <p class="text-h6">{{ title }}</p>
            </v-row>

            <v-row justify="center" class="mb-4">
              <component :is="currentComponent" v-model="passedProp" />
            </v-row>
            <v-row justify="center">
              <v-btn color="primary" @click="nextStep"> Continue </v-btn>
            </v-row>
          </v-stepper-content>
        </v-stepper-items>
      </v-stepper>
    </v-container>
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
export default {
  auth: false,
  layout: "basicadmin",
  middleware: "configurator",
  data() {
    return {
      showDialog: false,
      deploymentInfo: { finished: false },
      installData: {
        mode: { name: "Manual", sshSettings: { load_settings: true } },
        domainSettings: { domain: null, https: true },
        coins: { btc: { network: "mainnet", lightning: false, enabled: true } },
        additionalServices: { tor: false },
        advancedSettings: {
          installationPack: "all",
          additionalComponents: [],
          customRepoURL: null,
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
        "What BitcartCC instance are you configuring?",
        "How will you be accessing your BitcartCC?",
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
    passedProp: {
      get() {
        return this.installData[this.currentKey] || this.installData
      },
      set(v) {
        this.installData[this.currentKey] = v
      },
    },
    isManualDeployment() {
      return this.installData.mode.name === "Manual"
    },
    failedDeployment() {
      return !this.deploymentInfo.success
    },
    statusText() {
      return !this.failedDeployment
        ? "Successfully installed BitcartCC"
        : "Deployment failed"
    },
  },
  mounted() {
    this.handler = (e) => {
      if (e.keyCode === 13) this.nextStep()
    }
    window.addEventListener("keyup", this.handler)
  },
  beforeDestroy() {
    window.removeEventListener("keyup", this.handler)
  },
  methods: {
    nextStep() {
      if (this.currentStep === this.maxSteps) this.install()
      else this.currentStep++
    },
    install() {
      const additionalServices = Object.entries(
        this.installData.additionalServices
      )
        .filter(([k, v]) => v)
        .map(([k, v]) => k)
      const enabledCoins = Object.assign(
        {},
        ...Object.entries(this.installData.coins)
          .filter(([k, v]) => v.enabled)
          .map(([k, v]) => ({ [k]: v }))
      )
      this.deploymentInfo.finished = false
      this.showDialog = true
      this.$axios
        .post("/configurator/deploy", {
          mode: this.installData.mode.name,
          ssh_settings: this.installData.mode.sshSettings,
          domain_settings: this.installData.domainSettings,
          coins: enabledCoins,
          additional_services: additionalServices,
          advanced_settings: {
            installation_pack: this.installData.advancedSettings
              .installationPack,
            bitcart_docker_repository: this.installData.advancedSettings
              .customRepoURL,
            additional_components: this.installData.advancedSettings
              .additionalComponents,
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
