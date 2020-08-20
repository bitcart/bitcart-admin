<template>
  <div>
    <item-data :headers="headers" :url="url" :title="title" :actions="actions" />
    <edit-card
      :url="url"
      :on.sync="showDialog"
      :headers="emailHeaders"
      :item.sync="item"
      :item-index="itemIndex"
      :custom-props="{loadingEmail, emailCheck, emailStatus}"
      :show-new="false"
      :edit-mode="true"
      title="store email settings"
      @reset-custom-props="resetCustomProps"
    />
    <edit-card
      :url="url"
      :on.sync="showSettingsDialog"
      :headers="settingsHeaders"
      :item.sync="item"
      :item-index="itemIndex"
      :show-new="false"
      :edit-mode="true"
      title="store checkout settings"
    />
    <template-edit name="store" :item.sync="item" :item-index="itemIndex" :show.sync="showTemplates" />
  </div>
</template>
<script>
import ItemData from '@/components/ItemData.vue'
import EditCard from '@/components/EditCard.vue'
import TemplateEdit from '@/components/TemplateEdit.vue'
export default {
  layout: 'dashboard',
  components: {
    ItemData,
    EditCard,
    TemplateEdit
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
        { text: 'Created date', value: 'created', mode: 'display' },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      actions: [
        {
          icon: 'mdi-email',
          process: this.showEmail
        },
        {
          icon: 'mdi-cog-outline',
          process: this.showSettings
        },
        {
          icon: 'mdi-text-box',
          process: this.showTemplate
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
      settingsHeaders: [
        { text: 'Invoice expiration', value: 'expiration', rules: ['int'], hint: 'In minutes' }
      ],
      showDialog: false,
      showSettingsDialog: false,
      showTemplates: false,
      url: 'stores',
      title: 'Store'
    }
  },
  beforeMount () {
    this.$bus.$on('updateitem', (item, index) => { this.item = item })
  },
  methods: {
    setup (item, itemIndex) {
      this.item = JSON.parse(JSON.stringify(item))
      this.itemIndex = itemIndex
    },
    showEmail (item, itemIndex) {
      this.showDialog = true
      this.setup(item, itemIndex)
    },
    showSettings (item, itemIndex) {
      this.showSettingsDialog = true
      this.setup(item, itemIndex)
    },
    showTemplate (item, itemIndex) {
      this.showTemplates = true
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
