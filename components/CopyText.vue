<template>
  <div @click="copyText(value)">
    <v-fade-transition mode="out-in">
      <p
        v-if="displayCopied"
        key="copy"
        class="font-weight-bold text-h6 ma-0 pa-0"
      >
        Copied
      </p>
      <p v-else key="value" class="ma-0 pa-0" style="user-select: all">
        {{ $utils.truncate(value) }}
      </p>
    </v-fade-transition>
  </div>
</template>
<script>
export default {
  props: {
    value: {
      type: null,
      required: true,
    },
  },
  data() {
    return {
      displayCopied: false,
    }
  },
  methods: {
    copyText(value) {
      this.$utils.copyToClipboard(value)
      this.displayCopied = true
      setTimeout(() => (this.displayCopied = false), 1000)
    },
  },
}
</script>
