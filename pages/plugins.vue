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
        :key="plugin.author + plugin.name"
        md="3"
        cols="12"
      >
        <v-card height="100%" max-width="350" class="ml-1">
          <div style="overflow-y: auto; height: 250px">
            <v-card-title
              >{{ plugin.name }}<br />
              Version: {{ plugin.version }}<br />
              Author: {{ plugin.author }}</v-card-title
            >
            <v-card-text class="py-0">
              <p class="text-h6">
                {{ plugin.description }}
              </p>
            </v-card-text>
          </div>
          <v-card-actions>
            <v-container>
              <v-row class="pb-2">
                <v-btn
                  v-if="plugin.website"
                  icon
                  :href="plugin.website"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  <v-icon>mdi-web</v-icon>
                </v-btn>
                <v-btn
                  v-if="plugin.docs_url"
                  icon
                  :href="plugin.docs_url"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  <v-icon>mdi-book-open-variant</v-icon>
                </v-btn>
                <v-btn
                  v-if="plugin.source_url"
                  icon
                  :href="plugin.source_url"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  <v-icon>mdi-code-tags</v-icon>
                </v-btn>
                <v-tooltip v-if="plugin.license" bottom>
                  <template #activator="{ on, attrs }">
                    <v-icon v-bind="{ ...attrs, ...$attrs }" v-on="on">
                      mdi-license
                    </v-icon>
                  </template>
                  <span>License: {{ plugin.license }}</span>
                </v-tooltip>
              </v-row>
              <v-row class="justify-space-between">
                <v-btn color="primary" @click="showDetails(plugin)">
                  Details
                </v-btn>
                <v-btn color="error" @click="uninstallPlugin(plugin)"
                  >Uninstall</v-btn
                >
              </v-row>
            </v-container>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col v-if="!loading && $utils.isEmpty(plugins)">
        <p>No plugins found. Install some!</p>
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
      details="Installs a plugin from .bitcart file"
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
      loading: true,
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
        this.loading = false
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
          author: plugin.author,
        })
        .then(() => {
          this.plugins = this.plugins.filter(
            (p) => p.name !== plugin.name || p.author !== plugin.author
          )
        })
    },
    postprocess(data) {
      this.fetchPlugins()
    },
  },
}
</script>
