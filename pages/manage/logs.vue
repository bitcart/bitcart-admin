<template>
  <div v-if="logs.length === 0">No logs found</div>
  <div v-else>
    <div class="row">
      <div class="col-md-2 col-12">
        <v-list>
          <v-list-item-group v-model="model">
            <v-list-item v-for="log in logs" :key="log">
              <v-list-item-content>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item-title
                      v-bind="attrs"
                      v-on="on"
                      v-text="log"
                    ></v-list-item-title>
                  </template>
                  <span>{{ log }}</span>
                </v-tooltip>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </div>
      <div class="col-md-10 col-12">
        <div class="row">
          <v-textarea
            readonly
            no-resize
            :rows="10"
            :value="selectedLog"
          ></v-textarea>
        </div>
        <div class="row">
          <div class="col text-right">
            <v-btn
              color="primary"
              :disabled="model === null"
              @click="downloadLog(logs[model], selectedLog)"
              ><v-icon>mdi-download</v-icon> Download</v-btn
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: "admin",
  middleware: "superuserOnly",
  data() {
    return {
      logs: [],
      model: null,
      selectedLog: "",
    }
  },
  watch: {
    model() {
      this.$axios
        .get(`/manage/logs/${this.logs[this.model]}`)
        .then((resp) => (this.selectedLog = resp.data))
    },
  },
  beforeMount() {
    this.$axios.get("/manage/logs").then((resp) => (this.logs = resp.data))
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
  },
}
</script>
