<template>
  <div>
    <v-snackbar v-model="showSnackbar" :timeout="2500" color="success" bottom>
      <v-icon>mdi-content-copy</v-icon>
      Successfully copied {{ logs[model] }} to clipboard!
    </v-snackbar>
    <v-dialog v-model="showDialog">
      <v-card>
        <v-card-title class="justify-center text-h4 font-weight-bold">{{
          logs[model]
        }}</v-card-title>
        <v-card-text class="text--primary">
          <code style="white-space: pre-wrap" v-text="selectedLog" />
        </v-card-text>
        <v-card-actions class="d-flex justify-center">
          <v-btn color="primary" @click="copyText">Copy</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div v-if="loading">
      <v-progress-circular indeterminate></v-progress-circular>
    </div>
    <div v-else-if="logs.length === 0">No logs found</div>
    <div v-else>
      <div class="row">
        <div class="col-md-2 col-12">
          <v-list class="overflow-y-auto" style="max-height: 300px">
            <v-list-item-group v-model="model">
              <v-list-item v-for="log in logs" :key="log">
                <v-list-item-content>
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-list-item-title
                        v-bind="attrs"
                        v-on="on"
                        v-text="log"
                      ></v-list-item-title>
                    </template>
                    <span>{{ log }}</span>
                  </v-tooltip>
                </v-list-item-content>
                <v-list-item-action v-if="log !== $config.LOG_FILE_NAME">
                  <v-btn icon @click="deleteLog(log)">
                    <tooltip-icon icon="close" text="Delete" />
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </div>
        <div class="col-md-10 col-12">
          <div class="row">
            <v-textarea readonly no-resize :rows="10" :value="selectedLog" />
          </div>
          <div class="row">
            <div class="col text-right">
              <v-btn v-if="selectedLog" icon @click="showDialog = true">
                <v-icon>mdi-arrow-expand-all</v-icon>
              </v-btn>
              <v-btn
                color="primary"
                :disabled="!selectedLog"
                @click="downloadLog(logs[model], selectedLog)"
                ><v-icon>mdi-download</v-icon> Download</v-btn
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TooltipIcon from "@/components/TooltipIcon.vue"

export default {
  components: {
    TooltipIcon,
  },
  component: {
    TooltipIcon,
  },
  layout: "admin",
  middleware: "superuserOnly",
  data() {
    return {
      logs: [],
      loading: true,
      showDialog: false,
      showSnackbar: false,
      model: null,
      selectedLog: "",
    }
  },
  watch: {
    model() {
      if (typeof this.model === "undefined") {
        this.selectedLog = ""
        return
      }
      this.$axios
        .get(`/manage/logs/${this.logs[this.model]}`)
        .then((resp) => (this.selectedLog = resp.data))
    },
  },
  beforeMount() {
    this.$axios.get("/manage/logs").then((resp) => {
      this.logs = resp.data
      this.loading = false
    })
  },
  methods: {
    downloadLog(filename, log) {
      if (filename && log) {
        const element = document.createElement("a")
        element.setAttribute(
          "href",
          "data:text/plain;charset=utf-8," + encodeURIComponent(log)
        )
        element.setAttribute("download", filename)
        element.style.display = "none"
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
      }
    },
    deleteLog(log) {
      this.$axios.delete(`/manage/logs/${log}`).then((r) => {
        const index = this.logs.indexOf(log)
        if (index >= 0) {
          this.logs.splice(index, 1)
        }
      })
    },
    copyText() {
      this.$utils.copyToClipboard(this.selectedLog)
      this.showSnackbar = true
    },
  },
}
</script>
