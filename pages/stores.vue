<template>
  <div>
    <item-data :headers="headers" :url="url" :title="title" :actions="actions" />
    <edit-card
      :url="url"
      :on.sync="showDialog"
      :headers="emailHeaders"
      :item.sync="item"
      :custom-props="{loadingEmail, emailCheck, emailStatus}"
      title="store email settings"
      mode="edit"
      @reset-custom-props="resetCustomProps"
    />
  </div>
</template>
<script>
import ItemData from '@/components/ItemData.vue'
import EditCard from '@/components/EditCard.vue'
export default {
  layout: 'dashboard',
  components: {
    ItemData,
    EditCard
  },
  data () {
    return {
      item: {},
      loadingEmail: false,
      emailCheck: '',
      emailStatus: '',
      itemIndex: -1,
      headers: [
        { text: 'Name', value: 'name', rules: ['required'] },
        { text: 'Default currency', value: 'default_currency', default: 'USD', input: 'autocomplete', url: 'fiatlist', body: true },
        { text: 'Wallets', value: 'wallets', rules: ['required'], input: 'autocomplete', url: 'wallets', multiple: true, sortable: false },
        { text: 'Notifications', value: 'notifications', input: 'autocomplete', url: 'notifications', multiple: true, sortable: false },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      actions: [
        {
          icon: 'mdi-email',
          process: this.showEmail
        }
      ],
      emailHeaders: [
        { text: 'Store email', value: 'email', rules: ['email'] },
        { text: 'Email host', value: 'email_host' },
        { text: 'Email port', value: 'email_port', rules: ['int'] },
        { text: 'Email user', value: 'email_user' },
        { text: 'Email password', value: 'email_password', input: 'password' },
        { text: 'SSL/TLS', value: 'email_use_ssl', input: 'switch' },
        { text: 'Test ping', input: 'button', click: this.testping },
        { input: 'progress', text: 'emailCheck', loading: 'loadingEmail', status: 'emailStatus' }
      ],
      showDialog: false,
      url: 'stores',
      title: 'Store'
    }
  },
  watch:
  {
    item (val) {
      this.$bus.$emit('updateitem', val, this.itemIndex)
    }
  },
  methods: {
    setup (item, itemIndex) {
      this.item = item
      this.itemIndex = itemIndex
    },
    showEmail (item, itemIndex) {
      this.showDialog = true
      this.setup(item, itemIndex)
    },
    testping (item) {
      this.emailCheck = ''
      this.loadingEmail = true
      this.$axios.get(`/stores/${item.id}/ping`).then((resp) => {
        this.loadingEmail = false
        if (resp.status === 200 && resp.data === true) { this.emailCheck = 'Ping successful'; this.emailStatus = 'mdi-check' } else { this.emailCheck = 'Error pinging email server'; this.emailStatus = 'mdi-close' }
      })
    },
    resetCustomProps () {
      this.emailCheck = ''
      this.emailStatus = ''
      this.loadingEmail = false
    }
  }
}
</script>
