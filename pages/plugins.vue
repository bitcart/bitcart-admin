<template>
  <v-container>
    <v-dialog v-model="showDialog">
      <v-card>
        <v-card-title class="justify-center text-h4 font-weight-bold"
          >Plugin manifest</v-card-title
        >
        <v-card-text class="text--primary">
          <div>
            <code style="white-space: pre-wrap" v-text="pluginManifest" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <v-alert v-if="failed" type="error"
      >Plugins installation failed. Images restored to original state. Please
      check and uninstall incorrect plugins</v-alert
    >
    <p class="text-h4">Installed plugins</p>
    <v-row>
      <v-col
        v-for="plugin in plugins"
        :key="plugin.organization + plugin.name"
        md="3"
        cols="12"
      >
        <v-card height="100%" max-width="350" class="ml-1">
          <v-card-title
            >{{ plugin.name }}<br />
            Version: {{ plugin.version }}<br />
            Author: {{ plugin.organization }}</v-card-title
          >
          <v-card-text>
            <p class="text-h6">
              {{ plugin.description }}
            </p>
          </v-card-text>
          <v-card-actions class="justify-space-between">
            <v-btn color="primary" @click="showDetails(plugin)">
              Details
            </v-btn>
            <v-btn color="error" @click="uninstallPlugin(plugin)"
              >Uninstall</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <p class="text-h4">Upload plugin</p>
    <v-file-input
      v-model="file"
      :rules="fileRules"
      label="Plugin file"
    ></v-file-input>
    <ManagementCommand
      title="Upload plugin"
      details="Installs a plugin from .bitcartcc file"
      btn-text="Start plugin installation process"
      command-prefix="plugins"
      what="install"
      file-attr="plugin"
      class="pb-3"
      :file="true"
      :file-to-upload="file"
      :postprocess="postprocess"
    />
  </v-container>
</template>
<script>
import ManagementCommand from "@/components/ManagementCommand.vue"
export default {
  components: {
    ManagementCommand,
  },
  middleware: "superuserOnly",
  data() {
    return {
      plugins: [],
      failed: false,
      file: null,
      showDialog: false,
      pluginManifest: "",
      fileRules: [
        (value) =>
          !value ||
          value.size < 50 * 1024 * 1024 ||
          "Backup size should be less than 50 MB!",
      ],
    }
  },
  beforeMount() {
    this.fetchPlugins()
  },
  methods: {
    fetchPlugins() {
      this.$axios.get("/plugins").then((resp) => {
        this.plugins = resp.data.plugins
        this.failed = !resp.data.success
      })
    },
    showDetails(plugin) {
      this.pluginManifest = plugin
      this.showDialog = true
    },
    uninstallPlugin(plugin) {
      this.$axios
        .post("/plugins/uninstall", {
          name: plugin.name,
          organization: plugin.organization,
        })
        .then(() => {
          this.plugins = this.plugins.filter(
            (p) =>
              p.name !== plugin.name || p.organization !== plugin.organization
          )
        })
    },
    postprocess(data) {
      this.fetchPlugins()
    },
  },
}
</script>
