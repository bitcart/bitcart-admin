<template>
  <v-col cols="12" md="3">
    <v-card>
      <v-card-text>
        <v-select
          v-model="advancedSettings.installationPack"
          :items="installationPacks"
          label="Installation pack"
        />
        <v-combobox
          v-model="advancedSettings.additionalComponents"
          label="Additional components"
          multiple
          deletable-chips
          clearable
          chips
          @focus="advancedSettings.focusOn = true"
          @blur="advancedSettings.focusOn = false"
        ></v-combobox>
        <v-text-field
          v-model="advancedSettings.customRepoURL"
          label="Custom bitcart-docker repository"
        />
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      advancedSettings: this.value,
      installationPacks: ["all", "backend", "frontend", "none"],
    }
  },
  watch: {
    advancedSettings(v) {
      this.$emit("input", v)
    },
    value(v) {
      this.advancedSettings = v
    },
  },
}
</script>
