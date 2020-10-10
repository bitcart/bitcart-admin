<template>
  <v-list>
    <div v-for="(daemon, currency) in daemons" :key="currency">
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title
            class="display-1"
            v-text="currency.toUpperCase()"
          />
          <v-list-item-subtitle class="text--primary">
            <p class="display-1">Credentials</p>
            <p class="title">URL</p>
            <p class="subtitle">
              {{ daemon.credentials.rpc_url }}
            </p>
            <p class="title">Username</p>
            <p class="subtitle">
              {{ daemon.credentials.rpc_user }}
            </p>
            <p class="title">Password</p>
            <p class="subtitle">
              {{ daemon.credentials.rpc_pass }}
            </p>
            <p class="display-1">Network</p>
            <p class="title">
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
