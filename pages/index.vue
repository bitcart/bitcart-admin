<template>
  <v-container>
    <v-row>
      <v-col>
        <item-data :headers="headers" :url="url" :title="title" />
      </v-col>
    </v-row>
  </v-container>
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
        { text: 'Status', value: 'status' },
        { text: 'Store', value: 'store_id' },
        { text: 'Date', value: 'date' },
        { text: 'Description', value: 'description', expand: true },
        { text: 'Quantity', value: 'quantity' },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      url: 'products',
      title: 'Product'
    }
  }
}
</script>
