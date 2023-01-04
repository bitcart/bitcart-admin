<template>
  <div>
    <div v-if="done">
      <!-- prettier-ignore -->
      <p
        :class="{ 'red--text': error, 'green--text': !error }"
        style="white-space: pre"
      >{{ detail }}</p>
    </div>
    <p class="text-h6">
      {{ title }}
    </p>
    <p>{{ details }}</p>
    <v-btn color="primary" :loading="loading" @click="manage(what)">
      {{ btnText }}
    </v-btn>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    details: {
      type: String,
      default: "",
    },
    btnText: {
      type: String,
      default: "",
    },
    what: {
      type: String,
      default: "",
    },
    fileToUpload: {
      type: null,
      default: null,
    },
    file: {
      type: Boolean,
      default: false,
    },
    commandPrefix: {
      type: String,
      default: "manage",
    },
    fileAttr: {
      type: String,
      default: "backup",
    },
    postprocess: {
      type: Function,
      default: (data) => {},
    },
  },
  data() {
    return {
      done: false,
      error: false,
      detail: false,
      loading: false,
    }
  },
  methods: {
    manage(what) {
      let data = null
      let headers = null
      if (this.file) {
        data = new FormData()
        if (!this.fileToUpload) {
          this.done = true
          this.error = true
          this.detail = "No file selected"
          return
        }
        if (this.fileToUpload.size >= 50 * 1024 * 1024) {
          this.done = true
          this.error = true
          this.detail = "File size should be less than 50 MB!"
          return
        }
        data.append(this.fileAttr, this.fileToUpload)
        headers = {
          "Content-Type": "multipart/form-data",
        }
      }
      this.loading = true
      this.$axios
        .post(`/${this.commandPrefix}/${what}`, data, headers)
        .then((resp) => {
          this.done = true
          this.error = resp.data.status === "error"
          this.detail = resp.data.message
          this.loading = false
          this.postprocess(resp.data)
        })
        .catch((err) => {
          this.done = true
          this.error = true
          this.loading = false
          if (typeof err.response === "undefined") {
            this.detail =
              "Network error. Possibly the upload file has been changed"
            return
          }
          this.detail = err.response.data.detail
        })
    },
  },
}
</script>
