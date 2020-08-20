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
        { text: 'Price', value: 'price', rules: ['required'] },
        { text: 'Currency', value: 'currency', input: 'autocomplete', url: 'fiatlist', body: true },
        { text: 'Store', value: 'store_id', rules: ['required'], input: 'autocomplete', url: 'stores', errors: { 'No wallet linked': 'No wallet linked' } },
        { text: 'Products', value: 'products', input: 'autocomplete', url: 'products', multiple: true, sortable: false },
        { text: 'Promocode', value: 'promocode' },
        { text: 'Notification url', value: 'notification_url', rules: ['url'] },
        { text: 'Redirect url', value: 'redirect_url', rules: ['url'] },
        { text: 'Buyer email', value: 'buyer_email', rules: ['email'] },
        { text: 'Order', value: 'order_id' },
        { text: 'Discount', value: 'discount', mode: 'edit' },
        { text: 'Status', value: 'status', mode: 'edit' },
        { text: 'Created date', value: 'created', mode: 'display' },
        { text: 'Payment methods', value: 'payments', input: 'tabbed', mode: 'display', sortable: false },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      url: 'invoices',
      title: 'Invoice'
    }
  },
  head () {
    return {
      script: [
        { src: '/modal/bitcart.js' }
      ]
    }
  }
}
</script>
