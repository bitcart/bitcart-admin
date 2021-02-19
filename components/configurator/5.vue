<template>
  <v-col cols="3">
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
  },
}
</script>
