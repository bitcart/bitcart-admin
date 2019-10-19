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
        { text: 'Name', value: 'title' },
        { text: 'Amount', value: 'amount' },
        { text: 'Quantity', value: 'quantity' },
        { text: 'Status', value: 'status', mode: 'edit' },
        { text: 'Store', value: 'store_id' },
        { text: 'Date', value: 'date', mode: 'display' },
        { text: 'Description', value: 'description', expand: true },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      url: 'products',
      title: 'Product'
    }
  }
}
</script>
