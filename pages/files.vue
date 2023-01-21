<template>
  <div>
    <v-snackbar v-model="showSnackbar" :timeout="2500" color="success" bottom>
      <v-icon>mdi-content-copy</v-icon>
      Successfully copied file URL to clipboard!
    </v-snackbar>
    <item-data
      :headers="headers"
      :url="url"
      :title="title"
      :actions="actions"
    />
  </div>
</template>
<script>
import ItemData from "@/components/ItemData.vue"
export default {
  components: {
    ItemData,
  },
  layout: "dashboard",
  data() {
    return {
      headers: [
        { text: "ID", value: "id", mode: "display", copy: true },
        {
          text: "File",
          value: "file",
          input: "file",
          default: null,
          mode: "nodisplay",
        },
        { text: "File name", value: "filename", mode: "display" },
        { text: "Created date", value: "created", mode: "display" },
        { text: "Actions", value: "action", sortable: false },
      ],
      actions: [
        {
          icon: "mdi-download",
          text: "Download URL",
          process: this.getDownloadURL,
        },
      ],
      showSnackbar: false,
      url: "files",
      title: "File",
    }
  },
  methods: {
    combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "")
        : baseURL
    },
    getDownloadURL(item, itemIndex) {
      this.$utils.copyToClipboard(
        this.combineURLs(this.$store.getters.apiURL, `/files/handle/${item.id}`)
      )
      this.showSnackbar = true
    },
  },
}
</script>
