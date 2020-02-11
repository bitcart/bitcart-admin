<template>
  <div>
    <p class="title">
      {{ title }}
    </p>
    <v-checkbox v-model="data" @change="updatePolicy" />
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    what: {
      type: String,
      default: ''
    },
    initialValue: {
      type: null,
      default: ''
    }
  },
  data () {
    return {
      data: this.initialValue
    }
  },
  methods: {
    updatePolicy (value) {
      this.$axios.post('/manage/policies', { [this.what]: value })
    }
  }
}
</script>
