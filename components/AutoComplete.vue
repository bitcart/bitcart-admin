<template>
  <v-autocomplete
    :value="value"
    :loading="loading"
    :items="items"
    :search-input.sync="autosearch"
    :multiple="multiple"
    :chips="multiple"
    :rules="rules"
    :error-messages="errors"
    :label="text"
    :item-text="displayProp"
    :clearable="clearable"
    color="#90a4ae"
    item-value="id"
    @input="updateValue"
  >
    <template v-if="multiple" #selection="data">
      <v-chip
        v-bind="data.attrs"
        :input-value="data.selected"
        close
        @click="data.select"
        @click:close="removeMultiple(data.item)"
      >
        {{ data.item[displayProp] }}
      </v-chip>
    </template>
    <template #item="data">
      <template v-if="isNotObject(data)">
        <v-list-item-content v-text="data.item" />
      </template>
      <template v-else>
        <v-list-item-content>
          <v-list-item-title>
            {{ data.item[displayProp] }}
          </v-list-item-title>
        </v-list-item-content>
      </template>
    </template>
  </v-autocomplete>
</template>

<script>
export default {
  props: {
    value: {
      type: null,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    clearable: {
      type: Boolean,
      default: false,
    },
    rules: {
      type: Array,
      default() {
        return []
      },
    },
    displayProp: {
      type: String,
      default: "name",
    },
    label: {
      type: String,
      default: null,
    },
    initialItems: {
      type: Array,
      default() {
        return []
      },
    },
    body: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      items: this.initialItems,
      autosearch: "",
      errors: [],
    }
  },
  computed: {
    text() {
      return this.label || this.url.charAt(0).toUpperCase() + this.url.slice(1)
    },
  },
  watch: {
    autosearch(val) {
      this.fetchData(val)
    },
  },
  methods: {
    isNotObject(data) {
      return typeof data.item !== "object"
    },
    updateValue(value) {
      this.$emit("input", value)
    },
    fetchData(val) {
      if (val === null || typeof val === "undefined") {
        val = ""
      }
      let limit = -1
      if (!val) {
        limit = 5
      }
      const url = `/${this.url}?limit=${limit}&query=${encodeURIComponent(
        val
      )}&multiple=${this.multiple}`
      this.$axios.get(url).then((resp) => {
        if (this.body) this.items = resp.data
        else this.items = resp.data.result
      })
    },
    removeMultiple(item) {
      const index = this.value.indexOf(item.id)
      if (index >= 0) {
        // eslint-disable-next-line vue/no-mutating-props
        this.value.splice(index, 1)
      }
    },
  },
}
</script>
