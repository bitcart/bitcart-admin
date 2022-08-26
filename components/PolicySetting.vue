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
    <auto-complete
      v-else-if="type === 'autocomplete'"
      v-model="data"
      :url="url"
      :label="title"
      :body="true"
      @input="updatePolicy"
    />
    <list-edit
      v-else-if="type === 'listedit'"
      :initial-value="data"
      @input="updateListEdit"
    />
    <explorer-edit
      v-else-if="type === 'exploreredit'"
      :initial-value="data"
      @input="updatePolicy"
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
import AutoComplete from "@/components/AutoComplete"
import ListEdit from "@/components/ListEdit"
import ExplorerEdit from "@/components/ExplorerEdit"
export default {
  components: {
    AutoComplete,
    ListEdit,
    ExplorerEdit,
  },
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
    url: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      data: this.initialValue,
    }
  },
  methods: {
    updatePolicy(value) {
      this.$axios
        .post(this.policyUrl, { [this.what]: value })
        .then((r) => this.$emit("updated"))
    },
    updateListEdit(value) {
      const obj = Object.fromEntries(
        value.map((item) => [item.key, item.value])
      )
      delete obj[""] // Remove empty value
      this.updatePolicy(obj)
    },
  },
}
</script>
