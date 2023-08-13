<template>
  <item-data :headers="headers" :url="url" :title="title" />
</template>
<script>
import ItemData from "@/components/ItemData.vue"
import JSONField from "@/components/JSONField.vue"
export default {
  components: {
    ItemData,
  },
  layout: "dashboard",
  data() {
    return {
      headers: [
        { text: "ID", value: "id", mode: "display", copy: true },
        {
          text: "Name",
          value: "name",
          input: "autocomplete",
          component: "v-combobox",
          url: "templates/list?show_all=true",
          errors: {
            'duplicate key value violates unique constraint "templates_user_id_key"':
              "This template already exists",
          },
          rules: ["required"],
        },
        {
          text: "Text",
          value: "text",
          input: "textarea",
          expand: true,
          help: "https://docs.bitcart.ai/bitcart-basics/walkthrough#templates",
          rules: ["required"],
        },
        { text: "Created date", value: "created", mode: "display" },
        {
          text: "Metadata",
          value: "metadata",
          input: "metadata",
          expand: true,
          component: JSONField,
        },
        { text: "Actions", value: "action", sortable: false },
      ],
      url: "templates",
      title: "Template",
    }
  },
}
</script>
