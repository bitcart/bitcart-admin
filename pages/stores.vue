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
        { text: 'Store name', value: 'name', rules: ['required'] },
        { text: 'Store domain', value: 'domain' },
        { text: 'Store template', value: 'template' },
        { text: 'Store email', value: 'email', rules: ['email'] },
        { text: 'Wallet', value: 'wallet_id', rules: ['required'], input: 'autocomplete', url: 'wallets' },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      url: 'stores',
      title: 'Store'
    }
  }
}
</script>
