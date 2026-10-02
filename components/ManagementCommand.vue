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
    followJob: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      done: false,
      error: false,
      detail: false,
      loading: false,
      stopped: false,
    }
  },
  beforeDestroy() {
    this.stopped = true
  },
  methods: {
    finish(error, detail) {
      this.done = true
      this.error = error
      this.detail = detail
      this.loading = false
    },
    schedulePoll(jobId) {
      setTimeout(this.pollJob, 3000, jobId)
    },
    pollJob(jobId) {
      this.$axios
        .get(`/manage/jobs/${jobId}`)
        .then((resp) => {
          if (this.stopped) return
          if (resp.data.state === "running") {
            this.schedulePoll(jobId)
            return
          }
          const ok = resp.data.state === "done"
          this.finish(
            !ok,
            ok
              ? "Finished successfully!"
              : `Failed (${resp.data.state}):\n${resp.data.log}`
          )
          return Promise.resolve()
            .then(() => this.postprocess(resp.data))
            .catch((err) => this.finish(true, err.message))
        })
        .catch((err) => {
          if (this.stopped) return
          if (!err.response || err.response.status >= 500) {
            this.schedulePoll(jobId)
            return
          }
          this.finish(true, err.response.data.detail)
        })
    },
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
          if (
            this.followJob &&
            resp.data.status === "success" &&
            resp.data.job_id
          ) {
            this.pollJob(resp.data.job_id)
            return
          }
          this.finish(resp.data.status === "error", resp.data.message)
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
