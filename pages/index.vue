<template>
  <item-data :headers="headers" :url="url" :title="title" />
</template>
<script>
import ItemData from '@/components/ItemData.vue'
export default {
  layout: 'dashboard',
  components: {
    ItemData
  },
  data () {
    return {
      headers: [
        { text: 'Name', value: 'name', rules: ['required'] },
        { text: 'Amount', value: 'amount', rules: ['required'] },
        { text: 'Quantity', value: 'quantity', rules: ['required'] },
        { text: 'Category', value: 'category' },
        { text: 'Discounts', value: 'discounts', rules: ['required'], input: 'autocomplete', url: 'discounts', multiple: true, sortable: false },
        { text: 'Status', value: 'status', mode: 'edit' },
        { text: 'Download URL', value: 'download_url' },
        { text: 'Store', value: 'store_id', rules: ['required'], input: 'autocomplete', url: 'stores' },
        { text: 'Date', value: 'date', mode: 'display' },
        { text: 'Description', value: 'description', expand: true },
        { text: 'Image', value: 'image', input: 'image' },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      url: 'products',
      title: 'Product'
    }
  }
}
</script>
