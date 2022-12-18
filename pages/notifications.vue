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
        { text: "Name", value: "name", rules: ["required"] },
        {
          text: "Provider",
          value: "provider",
          input: "autocomplete",
          rules: ["required"],
          url: "notifications/list",
        },
        {
          text: "Data",
          value: "data",
          input: "dynamic",
          url: "/notifications/schema",
          choice: "provider",
          default: {},
          expand: true,
          component: JSONField,
          requiredKey: "required",
          propertiesKey: "properties",
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
      url: "notifications",
      title: "Notification Provider",
    }
  },
}
</script>
