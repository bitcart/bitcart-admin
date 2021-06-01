<template>
  <div>
    <p class="text-h6">
      {{ title }}
    </p>
    <v-checkbox
      v-if="type === 'checkbox'"
      v-model="data"
      @change="updatePolicy"
    />
    <v-text-field
      v-else
      v-model="data"
      hide-details
      single-line
      @change="updatePolicy"
    />
  </div>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    what: {
      type: String,
      default: "",
    },
    initialValue: {
      type: null,
      default: "",
    },
    type: {
      type: String,
      default: "checkbox",
    },
    policyUrl: {
      type: String,
      default: "/manage/policies",
    },
  },
  data() {
    return {
      data: this.initialValue,
    }
  },
  methods: {
    updatePolicy(value) {
      this.$axios.post(this.policyUrl, { [this.what]: value })
    },
  },
}
</script>
