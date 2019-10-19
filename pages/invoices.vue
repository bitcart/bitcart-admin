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
        { text: 'Amount', value: 'amount', mode: 'display' },
        { text: 'Products', value: 'products' },
        { text: 'Status', value: 'status' },
        { text: 'Date', value: 'date' },
        { text: 'Address', value: 'bitcoin_address' },
        { text: 'URL', value: 'bitcoin_url', qr: true },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      url: 'invoices',
      title: 'Invoice'
    }
  }
}
</script>
