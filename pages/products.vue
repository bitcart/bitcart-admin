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
        { text: 'Status', value: 'status' },
        { text: 'Amount', value: 'amount' },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      url: 'products',
      title: 'Product'
    }
  }
}
</script>
