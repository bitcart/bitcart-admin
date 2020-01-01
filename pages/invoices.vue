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
        { text: 'Amount', value: 'amount', rules: ['required'] },
        { text: 'Products', value: 'products', rules: ['required'], input: 'autocomplete', url: 'products', multiple: true, sortable: false },
        { text: 'Promocode', value: 'promocode' },
        { text: 'Discount', value: 'discount', mode: 'edit' },
        { text: 'Status', value: 'status', mode: 'edit' },
        { text: 'Date', value: 'date', mode: 'display' },
        { text: 'Payment methods', value: 'payments', input: 'tabbed', mode: 'display', sortable: false },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      url: 'invoices',
      title: 'Invoice'
    }
  }
}
</script>
