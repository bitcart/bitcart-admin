<template>
  <div>
    <v-list class="mb-5 mt-0 py-0">
      <v-container class="py-0">
        <v-row>
          <v-list-item v-for="(item, key) in data" :key="key" class="pl-0">
            <v-list-item-content>
              <v-col cols="1">
                <p class="text-h6">{{ key.toUpperCase() }}</p>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="data[key]"
                  label="Value"
                  @input="sendInput"
                />
              </v-col>
              <v-col cols="1">
                <v-btn icon @click="resetItem(key)">
                  <tooltip-icon icon="mdi-restore" text="Restore to defaults" />
                </v-btn>
              </v-col>
            </v-list-item-content>
          </v-list-item>
        </v-row>
      </v-container>
    </v-list>
  </div>
</template>

<script>
import TooltipIcon from "@/components/TooltipIcon"
export default {
  components: {
    TooltipIcon,
  },
  props: {
    initialValue: {
      type: [Array, Object],
      default: () => [],
    },
    url: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      data: this.initialValue,
    }
  },
  methods: {
    sendInput() {
      this.$emit("input", this.data)
    },
    resetItem(key) {
      this.$axios.get(`${this.url}/${key}`).then((r) => {
        this.data[key] = r.data
        this.sendInput()
      })
    },
  },
}
</script>
