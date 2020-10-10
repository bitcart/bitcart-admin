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
        { text: "Actions", value: "action", sortable: false },
      ],
      url: "discounts",
      title: "Discount",
    }
  },
}
</script>
