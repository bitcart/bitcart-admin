<template>
  <div>
    <p class="text-h6">
      {{ title }}
    </p>
    <p v-if="detail" class="text-body-1">
      {{ detail }}
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
      :url="url"
      @input="updatePolicy"
    />
    <v-select
      v-else-if="type === 'select'"
      :value="data"
      :items="items"
      :label="title"
      @input="updatePolicy"
    />
    <email-settings
      v-else-if="type === 'emailsettings'"
      :initial-value="data"
      :url="url"
      @input="updatePolicy"
    />
    <UIExtensionSlot
      v-else
      name="policy_setting_types"
      :data="data"
      :url="url"
      :update-policy="updatePolicy"
    >
      <v-text-field
        v-model="data"
        hide-details
        single-line
        class="mt-n6 pb-6"
        @change="updatePolicy"
      />
    </UIExtensionSlot>
  </div>
</template>
<script>
import AutoComplete from "@/components/AutoComplete"
import ListEdit from "@/components/ListEdit"
import ExplorerEdit from "@/components/ExplorerEdit"
import EmailSettings from "@/components/EmailSettings"
import UIExtensionSlot from "@/components/UIExtensionSlot"
export default {
  components: {
    UIExtensionSlot,
    AutoComplete,
    ListEdit,
    ExplorerEdit,
    EmailSettings,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    detail: {
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
    items: {
      type: Array,
      default: () => [],
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
