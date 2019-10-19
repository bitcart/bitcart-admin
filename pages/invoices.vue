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
        { text: 'Amount', value: 'amount' },
        { text: 'Products', value: 'products' },
        { text: 'Status', value: 'status', mode: 'edit' },
        { text: 'Date', value: 'date', mode: 'display' },
        { text: 'Address', value: 'bitcoin_address', mode: 'display' },
        { text: 'URL', value: 'bitcoin_url', qr: true, mode: 'display' },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      url: 'invoices',
      title: 'Invoice'
    }
  }
}
</script>
