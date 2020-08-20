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
        { text: 'Balance', value: 'balance', mode: 'display' },
        { text: 'Currency', value: 'currency', default: 'btc' },
        { text: 'Xpub', value: 'xpub', expand: true, rules: ['required'], errors: { 'Wallet key invalid': 'Invalid xpub' } },
        { text: 'Created date', value: 'created', mode: 'display' },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      url: 'wallets',
      title: 'Wallet'
    }
  }
}
</script>
