<template>
  <div>
    <p class="text-h4">Perform backup</p>
    <ManagementCommand
      title="Perform backup manually"
      details="Performs a backup using existing settings without waiting for schedule"
      btn-text="Start backup process"
      what="backups/backup"
      :postprocess="downloadBackup"
      follow-job
      class="pb-3"
    />
    <p class="text-h4">Restore backup</p>
    <v-file-input
      v-model="file"
      :rules="fileRules"
      label="Backup file"
    ></v-file-input>
    <ManagementCommand
      title="Restore backup"
      details="Restores a backup from a .tar.zst or .tar.gz file, optionally encrypted (.enc). Maximum 50 MB"
      btn-text="Start restore process"
      what="backups/restore"
      class="pb-3"
      :file="true"
      :file-to-upload="file"
    />
    <p class="text-h4">Backup settings</p>
    <v-alert outlined text type="info"
      >All backup providers, except for local, require environment variables to
      be set. Check
      <a href="https://docs.bitcart.ai/guides/backups" target="_blank"
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
      file: null,
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
      fileRules: [
        (value) =>
          !value ||
          value.size < 50 * 1024 * 1024 ||
          "Backup size should be less than 50 MB!",
      ],
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
  methods: {
    downloadBackup(job) {
      if (job.state === "done" && job.result?.provider === "local") {
        return this.$axios
          .get(`/manage/backups/download/${job.id}`, {
            responseType: "blob",
          })
          .then((resp) => {
            this.$utils.downloadFile(resp)
          })
          .catch((err) => {
            if (!err.response) throw new Error("Download failed: network error")
            return err.response.data.text().then((text) => {
              let detail
              try {
                detail = JSON.parse(text).detail
              } catch (e) {
                detail = text
              }
              throw new Error(`Download failed: ${detail}`)
            })
          })
      }
    },
  },
}
</script>
