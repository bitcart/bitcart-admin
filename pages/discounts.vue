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
        { text: "Percent", value: "percent", rules: ["required", "int"] },
        { text: "Description", value: "description", expand: true },
        { text: "Promocode", value: "promocode" },
        { text: "Currencies", value: "currencies" },
        {
          text: "End date",
          value: "end_date",
          input: "datetime",
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
      url: "discounts",
      title: "Discount",
    }
  },
}
</script>
