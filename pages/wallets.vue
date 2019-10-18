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
        { text: 'Wallet name', value: 'name' },
        { text: 'Balance', value: 'balance', mode: 'display' },
        { text: 'User', value: 'user_id' },
        { text: 'Xpub', value: 'xpub', expand: true },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      url: 'wallets',
      title: 'Wallet'
    }
  }
}
</script>
