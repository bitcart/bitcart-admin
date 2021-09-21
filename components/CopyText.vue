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
        <span v-if="error" class="text-left">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-icon v-if="error" color="error" v-bind="attrs" v-on="on">
                error
              </v-icon>
            </template>
            <span>{{ errorText }}</span>
          </v-tooltip>
        </span>
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
    error: {
      type: Boolean,
      default: false,
    },
    errorText: {
      type: String,
      default: "",
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
