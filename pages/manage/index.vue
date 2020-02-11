<template>
  <item-data :headers="headers" :url="url" :title="title" />
</template>
<script>
import ItemData from '@/components/ItemData.vue'
export default {
  layout: 'admin',
  middleware: 'superuserOnly',
  components: {
    ItemData
  },
  data () {
    return {
      headers: [
        { text: 'Email', value: 'email', rules: ['email'] },
        { text: 'Password', value: 'password', mode: 'nodisplay', input: 'password', rules: ['required', 'min'], hint: 'At least 8 characters' },
        { text: 'Superuser', value: 'is_superuser', input: 'switch', default: false },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      url: 'users',
      title: 'User'
    }
  }
}
</script>
