<template>
  <item-data :headers="headers" :url="url" :title="title" />
</template>
<script>
import ItemData from "@/components/ItemData.vue"
export default {
  layout: "dashboard",
  components: {
    ItemData,
  },
  data() {
    return {
      headers: [
        { text: "ID", value: "id", mode: "display" },
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
          help:
            "https://docs.bitcartcc.com/bitcartcc-basics/walkthrough#templates",
          rules: ["required"],
        },
        { text: "Created date", value: "created", mode: "display" },
        { text: "Actions", value: "action", sortable: false },
      ],
      url: "templates",
      title: "Template",
    }
  },
}
</script>
