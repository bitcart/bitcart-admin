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
        { text: 'Wallet name', value: 'name', rules: ['required'] },
        { text: 'Balance', value: 'balance', mode: 'display' },
        { text: 'User', value: 'user_id', mode: 'display' },
        { text: 'Xpub', value: 'xpub', expand: true, rules: ['required'], errors: { 'Wallet key invalid': 'Invalid xpub' } },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      url: 'wallets',
      title: 'Wallet'
    }
  }
}
</script>
