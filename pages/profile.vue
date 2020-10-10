<template>
  <div>
    <item-data
      :headers="headers"
      :url="url"
      :title="title"
      :postprocess="postprocess"
      :postsave="postsave"
      :postclose="postclose"
      :dialog-watch.sync="dialogWatch"
      :edit-mode.sync="editMode"
    >
      <template v-slot:item.current="{ item }">
        <v-switch :input-value="check(item.id)" readonly />
      </template>
      <template v-slot:dialog>
        <permission-set v-show="dialogWatch && !editMode" ref="set" />
      </template>
    </item-data>
    <v-snackbar v-model="showSnackbar" :timeout="2500" color="success" bottom>
      <v-icon>mdi-content-copy</v-icon>
      Successfully copied {{ whatToCopy }} to clipboard!
    </v-snackbar>
    <v-snackbar v-model="showSnackbar2" :timeout="2500" color="success" bottom>
      API key generated and copied to clipboard!
    </v-snackbar>
  </div>
</template>
<script>
import ItemData from "@/components/ItemData"
import PermissionSet from "@/components/PermissionSet"
export default {
  layout: "dashboard",
  components: {
    ItemData,
    PermissionSet,
  },
  data() {
    return {
      headers: [
        { text: "Key", value: "id", mode: "display" },
        { text: "App ID", value: "app_id", readonly: true },
        { text: "App Domain", value: "redirect_url" },
        { text: "Permissions", value: "permissions", mode: "display" },
        {
          text: "Current Key",
          value: "current",
          input: "switch",
          default: false,
          mode: "display",
          sortable: false,
        },
        { text: "Created date", value: "created", mode: "display" },
        { text: "Actions", value: "action", sortable: false },
      ],
      url: "token",
      title: "API Key",
      whatToCopy: "ID",
      showSnackbar: false,
      showSnackbar2: false,
      dialogWatch: false,
      editMode: false,
    }
  },
  computed: {
    token() {
      return this.$auth.getToken("local")
    },
  },
  methods: {
    check(id) {
      return `Bearer ${id}` === this.token
    },
    postprocess(data) {
      return this.$refs.set.postprocess(data)
    },
    copyToClipboard(text) {
      const el = document.createElement("textarea")
      el.addEventListener("focusin", (e) => e.stopPropagation())
      el.value = text
      el.setAttribute("readonly", "")
      el.style.position = "absolute"
      el.style.left = "-9999px"
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
    },
    copyText(text, desc, hideSnackbar) {
      this.copyToClipboard(text)
      this.whatToCopy = desc || "ID"
      if (!hideSnackbar) {
        this.showSnackbar = true
      }
    },
    postsave(item) {
      this.showSnackbar2 = true
      this.copyText(item.access_token, null, true)
    },
    postclose() {
      this.$refs.set.postclose()
    },
  },
}
</script>
