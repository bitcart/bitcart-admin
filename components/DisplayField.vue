<template>
  <div>
    <p v-if="title" class="d-flex justify-center pt-3">{{ title }}</p>
    <div>
      <v-text-field
        single-line
        outlined
        dense
        flat
        solo
        readonly
        :value="value"
        class="copyField"
        @click="copyText(value)"
        @focus="$event.target.blur()"
      >
        <template #append>
          <v-fade-transition>
            <v-overlay v-if="displayOverlay" absolute color="white" opacity="1">
              <p class="text-h4 pt-4 black--text">Copied</p>
            </v-overlay>
          </v-fade-transition>
        </template>
      </v-text-field>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: null,
    },
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      displayOverlay: false,
    }
  },
  methods: {
    copyText(value) {
      this.$utils.copyToClipboard(value)
      this.displayOverlay = true
      setTimeout(() => (this.displayOverlay = false), 1000)
    },
  },
}
</script>

<style>
.copyField input {
  cursor: copy !important;
}
</style>
