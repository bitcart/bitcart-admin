<template>
  <v-list>
    <div v-for="(daemon, currency) in daemons" :key="currency">
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h4" v-text="currency.toUpperCase()" />
          <v-list-item-subtitle class="text--primary">
            <p class="text-h4">Credentials</p>
            <p class="text-h6">URL</p>
            <p class="subtitle">
              {{ daemon.credentials.rpc_url }}
            </p>
            <p class="text-h6">Username</p>
            <p class="subtitle">
              {{ daemon.credentials.rpc_user }}
            </p>
            <p class="text-h6">Password</p>
            <p class="subtitle">
              {{ daemon.credentials.rpc_pass }}
            </p>
            <p class="text-h4">Network</p>
            <p class="text-h6">
              {{ daemon.network }}
            </p>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <div>
            <v-list-item-action-text> Lightning </v-list-item-action-text>
            <v-checkbox v-model="daemon.lightning" readonly />
          </div>
        </v-list-item-action>
      </v-list-item>
      <v-divider />
    </div>
  </v-list>
</template>
<script>
export default {
  layout: "admin",
  middleware: "superuserOnly",
  data() {
    return {
      daemons: [],
    }
  },
  beforeMount() {
    this.$axios
      .get("/manage/daemons")
      .then((resp) => (this.daemons = resp.data))
  },
}
</script>
