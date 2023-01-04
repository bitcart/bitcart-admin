<template>
  <div>
    <item-data
      :headers="headers"
      :url="url"
      :title="title"
      :actions="actions"
    />
    <template-edit
      name="product"
      :item.sync="item"
      :item-index="itemIndex"
      :body="true"
      :show.sync="showTemplates"
    />
  </div>
</template>
<script>
import ItemData from "@/components/ItemData.vue"
import TemplateEdit from "@/components/TemplateEdit.vue"
import JSONField from "@/components/JSONField.vue"
export default {
  components: {
    ItemData,
    TemplateEdit,
  },
  layout: "dashboard",
  data() {
    return {
      headers: [
        { text: "ID", value: "id", mode: "display", copy: true },
        { text: "Name", value: "name", rules: ["required"] },
        { text: "Price", value: "price", rules: ["required", "positive"] },
        {
          text: "Quantity",
          value: "quantity",
          rules: ["required", "quantity"],
          hint: "Use -1 for unlimited quantity",
        },
        { text: "Category", value: "category" },
        {
          text: "Discounts",
          value: "discounts",
          input: "autocomplete",
          url: "discounts",
          multiple: true,
          sortable: false,
        },
        { text: "Status", value: "status", mode: "edit" },
        { text: "Download URL", value: "download_url" },
        {
          text: "Store",
          value: "store_id",
          rules: ["required"],
          input: "autocomplete",
          url: "stores",
          copy: true,
        },
        { text: "Created date", value: "created", mode: "display" },
        {
          text: "Description",
          value: "description",
          input: "textarea",
          rows: 3,
          expand: true,
        },
        { text: "Image", value: "image", input: "image" },
        {
          text: "Metadata",
          value: "metadata",
          input: "metadata",
          expand: true,
          component: JSONField,
        },
        { text: "Actions", value: "action", sortable: false },
      ],
      actions: [
        {
          icon: "mdi-text-box",
          text: "Configure templates",
          process: this.showTemplate,
        },
      ],
      item: {},
      itemIndex: -1,
      showTemplates: false,
      url: "products",
      title: "Product",
    }
  },
  methods: {
    showTemplate(item, itemIndex) {
      this.showTemplates = true
      this.item = JSON.parse(JSON.stringify(item))
      this.itemIndex = itemIndex
    },
  },
}
</script>
