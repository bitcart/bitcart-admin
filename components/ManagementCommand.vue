<template>
  <div>
    <div v-if="done">
      <p :class="{'red--text':error,'green--text':!error}">
        {{ detail }}
      </p>
    </div>
    <p class="title">
      {{ title }}
    </p>
    <p>{{ details }}</p>
    <v-btn color="primary" @click="manage(what)">
      {{ btnText }}
    </v-btn>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    details: {
      type: String,
      default: ''
    },
    btnText: {
      type: String,
      default: ''
    },
    what: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      done: false,
      error: false,
      detail: false
    }
  },
  methods: {
    manage (what) {
      this.$axios.post(`/manage/${what}`).then((resp) => {
        this.done = true
        this.error = resp.data.status === 'error'
        this.detail = resp.data.message
      }).catch((err) => {
        this.done = true
        this.error = true
        this.detail = err.response.data.detail
      })
    }
  }
}
</script>
