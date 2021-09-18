<template>
  <div>
    <p class="text-h4">Perform backup</p>
    <ManagementCommand
      title="Perform backup manually"
      details="Performs a backup using existing settings without waiting for schedule"
      btn-text="Start backup process"
      what="backups/backup"
      class="pb-3"
    />
    <p class="text-h4">Backup settings</p>
    <v-alert outlined text type="info"
      >All backup providers, except for local, require environment variables to
      be set. Check
      <a href="https://docs.bitcartcc.com/guides/backups" target="_blank"
        >the docs</a
      >
      for more information
    </v-alert>
    <PolicySetting
      v-for="(value, policy) in policies"
      :key="policy"
      :title="descriptions[policy].title"
      :what="policy"
      :type="descriptions[policy].type"
      :initial-value="value"
      :url="descriptions[policy].url"
      policy-url="manage/backups"
    />
  </div>
</template>
<script>
import PolicySetting from "@/components/PolicySetting.vue"
import ManagementCommand from "@/components/ManagementCommand.vue"
export default {
  components: {
    PolicySetting,
    ManagementCommand,
  },
  layout: "admin",
  middleware: "superuserOnly",
  data() {
    return {
      policies: {},
      descriptions: {
        provider: {
          title: "Backup provider",
          type: "autocomplete",
          url: "manage/backups/providers",
        },
        scheduled: {
          title: "Scheduled backups",
          type: "checkbox",
        },
        frequency: {
          title: "Backup frequency",
          type: "autocomplete",
          url: "manage/backups/frequencies",
        },
        environment_variables: {
          title: "Environment variables",
          type: "listedit",
        },
      },
      rules: {
        required: (value) =>
          (typeof value !== "undefined" && !!value) || "Required.",
      },
    }
  },
  beforeMount() {
    this.$axios.get("/manage/backups").then((resp) => {
      const policies = resp.data
      policies.environment_variables = Object.keys(
        policies.environment_variables
      ).map((k) => ({
        key: k,
        value: policies.environment_variables[k],
      }))
      this.policies = policies
    })
  },
}
</script>
