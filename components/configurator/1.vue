<template>
  <v-container>
    <v-row>
      <v-col
        v-for="(card, index) in availableCards"
        :key="index"
        cols="12"
        md="3"
        :class="getClass(index)"
      >
        <v-card height="100%" @click.native="modeSettings.name = card.id">
          <v-card-text>
            <v-icon size="50px" class="mb-5 d-flex justify-center">
              {{ card.icon }}
            </v-icon>
            <p class="text-h4 font-weight-medium text-center">
              {{ card.title }}
            </p>
            <v-card-subtitle class="text-h6 font-weight-regular">
              {{ card.text }}
            </v-card-subtitle>
          </v-card-text>
          <v-checkbox
            :input-value="card.id === modeSettings.name"
            readonly
            class="check-icon"
          />
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="modeSettings.name === 'Remote'">
      <v-col cols="12" md="3" class="mx-auto">
        <v-card height="100%">
          <v-card-text>
            <p class="text-h5 font-weight-medium text-center">
              Remote Machine SSH Details
            </p>
            <v-text-field
              v-model="modeSettings.sshSettings.host"
              label="Host"
            />
            <v-text-field
              v-model="modeSettings.sshSettings.username"
              label="Username"
            />
            <v-text-field
              v-model="modeSettings.sshSettings.password"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              @click:append="showPassword = !showPassword"
            />
            <v-text-field
              v-model="modeSettings.sshSettings.root_password"
              :append-icon="showRootPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showRootPassword ? 'text' : 'password'"
              label="Root password (if ssh user is not root)"
              @click:append="showRootPassword = !showRootPassword"
            />
          </v-card-text>
          <v-card-actions class="justify-center mb-3">
            <v-btn color="primary" @click="$emit('refresh')"
              >Load settings</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <UIExtensionSlot name="configurator_deploy_methods" />
  </v-container>
</template>

<script>
import UIExtensionSlot from "@/components/UIExtensionSlot.vue"
export default {
  components: { UIExtensionSlot },
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      showPassword: false,
      showRootPassword: false,
      modeSettings: this.value,
      cards: this.$utils.getExtendSetting.call(
        this,
        "configurator_deploy_methods",
        [
          {
            title: "A remote machine",
            text: "A remote machine that you can provide the SSH connectivity details to so that the configurator automagically sets it up for you",
            icon: "mdi-remote",
            id: "Remote",
          },
          {
            title: "Manual",
            text: "We'll generate a bash script that you run on the server without ever providing us access.",
            icon: "mdi-console",
            id: "Manual",
          },
        ]
      ),
      currentInstance: {
        title: "Current instance",
        text: "Change current instance's settings",
        icon: "mdi-cogs",
        id: "Current",
      },
    }
  },
  computed: {
    isServerAdmin() {
      return this.$auth.loggedIn && this.$auth.user.is_superuser
    },
    availableCards() {
      return this.isServerAdmin
        ? this.cards.concat(this.currentInstance)
        : this.cards
    },
  },
  watch: {
    value(v) {
      // TODO: not sure why is reactivity not working and requiring a watcher
      // same applies to all configurator/x.vue files
      this.modeSettings = v
    },
  },
  methods: {
    getClass(index) {
      if (index === 0) return "ml-auto"
      if (index === this.availableCards.length - 1) return "mr-auto"
    },
  },
}
</script>

<style scoped>
.check-icon {
  font-size: 40px;
  position: absolute;
  right: 2rem;
  top: 0.5rem;
  text-align: center;
}
</style>
