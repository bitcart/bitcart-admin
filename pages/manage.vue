<template>
  <item-data :headers="headers" :url="url" :title="title" />
</template>
<script>
import ItemData from '@/components/ItemData.vue'
export default {
  layout: 'dashboard',
  middleware: 'superuserOnly',
  components: {
    ItemData
  },
  data () {
    return {
      headers: [
        { text: 'Password', value: 'password', mode: 'nodisplay', input: 'password', rules: ['required', 'min'], hint: 'At least 8 characters' },
        { text: 'Email', value: 'email', rules: ['email'] },
        { text: 'Superuser', value: 'is_superuser', input: 'switch' },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      url: 'users',
      title: 'User'
    }
  }
}
</script>
