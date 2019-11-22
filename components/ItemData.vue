<template>
  <v-container>
    <v-data-table
      :headers="defaultHeaders"
      :items="items"
      :items-per-page="5"
      :server-items-length="numItems"
      :options.sync="options"
      :loading="loading"
      loading-text="Loading..."
      class="elevation-1"
      :show-expand="shouldExpand"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>{{ title+'s' }}</v-toolbar-title>
          <div class="flex-grow-1" />
          <v-text-field
            v-model="search"
            append-icon="search"
            label="Search"
            single-line
            hide-details
          />
          <v-spacer />
          <v-dialog v-model="showQR" max-width="500px">
            <v-card class="accent--border" raised="raised">
              <v-card-title class="justify-center">
                QR code
              </v-card-title>
              <div class="d-flex justify-center">
                <qrcode tag="v-img" :options="{width: 500}" class="image-preview" :value="qrItem[forQR.value]" />
              </div>
              <v-card-actions class="justify-center">
                <v-btn class="justify-center" color="primary" @click="copyText(qrItem[forQR.value])">
                  <v-icon left="left">
                    mdi-content-copy
                  </v-icon><span>Copy</span>
                </v-btn>
                <v-btn class="justify-center" color="primary" @click="checkout()">
                  <v-icon left="left">
                    mdi-open-in-new
                  </v-icon><span>Open checkout</span>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on }">
              <v-btn color="primary" dark v-on="on">
                New {{ title }}
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-form ref="form" v-model="formValid">
                  <v-container>
                    <v-row>
                      <v-col
                        v-for="header in dialogData"
                        :key="header.value"
                        cols="12"
                        sm="6"
                        md="4"
                      >
                        <v-text-field v-if="header.input === 'text' || typeof header.input === 'undefined'" :rules="header.rules" :label="header.text" :value="editedItem[header.value]" @input="update(header.value, $event)" />
                        <v-switch v-else-if="header.input === 'switch'" v-model="editedItem[header.value]" :rules="header.rules" :label="header.text" />
                        <v-text-field
                          v-else
                          v-model="editedItem[header.value]"
                          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                          :rules="header.rules"
                          :type="showPassword ? 'text' : 'password'"
                          name="input-10-1"
                          :label="header.text"
                          :hint="header.hint"
                          counter
                          @click:append="showPassword = !showPassword"
                        />
                      </v-col>
                    </v-row>
                  </v-container>
                </v-form>
              </v-card-text>

              <v-card-actions>
                <div class="flex-grow-1" />
                <v-btn color="blue darken-1" text @click="close">
                  Cancel
                </v-btn>
                <v-btn color="blue darken-1" text @click="save">
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:expanded-item="{ item, headers }">
        <td v-for="header in toExpand" :key="header.text">
          {{ header.text }}: {{ item[header.value] }}
        </td>
      </template>
      <template v-slot:item.date="{ item }">
        {{ new Date(item.date).toLocaleString() }}
      </template>
      <template v-slot:item.is_superuser="{item}">
        <v-switch v-model="item.is_superuser" @change="updateSuperuser(item)" />
      </template>
      <template v-slot:item.products="{ item }">
        <td v-for="product in item.products" :key="product">
          {{ product }}
        </td>
      </template>
      <template v-slot:item.action="{ item }">
        <v-icon
          small
          class="mr-2"
          @click="copyText(item.id)"
        >
          mdi-content-copy
        </v-icon>
        <v-icon
          small
          class="mr-2"
          @click="editItem(item)"
        >
          edit
        </v-icon>
        <v-icon
          v-if="!(Object.entries(forQR).length === 0 && forQR.constructor === Object)"
          small
          class="mr-2"
          @click="displayQR(item)"
        >
          mdi-qrcode
        </v-icon>
        <v-icon
          small
          @click="deleteItem(item)"
        >
          delete
        </v-icon>
      </template>
    </v-data-table>
    <v-snackbar
      v-model="showSnackbar"
      color="success"
      bottom
      :timeout="2500"
    >
      <v-icon>mdi-content-copy</v-icon>
      Successfully copied {{ whatToCopy }} to clipboard!
    </v-snackbar>
    <v-container />
  </v-container>
</template>

<script>
import debounce from 'lodash.debounce'
export default {
  props: {
    headers: {
      type: Array,
      default () { return [] }
    },
    url: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      formValid: false,
      search: '',
      options: {},
      numItems: 0,
      dialog: false,
      showQR: false,
      showSnackbar: false,
      qrItem: {},
      whatToCopy: '',
      loading: true,
      editedIndex: -1,
      editedItem: Object.assign(...Array.from(this.headers, x => x.value).map((k, i) => ({ [k]: '' }))),
      items: [],
      showPassword: false,
      rules: {
        required: value => (typeof value !== 'undefined' && !!value) || 'Required.',
        min: v => (typeof v !== 'undefined' && v.length >= 8) || 'Min 8 characters',
        email: (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return (typeof value === 'undefined' || value === '' || value == null || pattern.test(value)) || 'Invalid e-mail.'
        }
      }
    }
  },
  computed: {
    editedHeaders () {
      return this.headers.map((x) => { if (x.rules && !x.rules.some(y => typeof y === 'undefined')) { x.rules = x.rules.map((y) => { return this.rules[y] }) } else { x.rules = [] } return x })
    },
    forQR () {
      return this.editedHeaders.find(header => header.qr) || {}
    },
    shouldExpand () {
      return this.editedHeaders.some(header => header.expand)
    },
    formTitle () {
      return this.editedIndex === -1 ? `New ${this.title}` : `Edit ${this.title}`
    },
    toEdit () {
      return this.editedHeaders.filter(item => (item.value !== 'action' && (item.mode === 'edit' || item.mode === 'all' || item.mode === 'nodisplay' || typeof item.mode === 'undefined')))
    },
    toCreate () {
      return this.editedHeaders.filter(item => (item.value !== 'action' && (item.mode === 'create' || item.mode === 'nodisplay' || typeof item.mode === 'undefined')))
    },
    dialogData () {
      return this.editedIndex === -1 ? this.toCreate : this.toEdit
    },
    defaultHeaders () {
      return this.editedHeaders.filter(item => (!item.expand && item.mode !== 'nodisplay'))
    },
    toExpand () {
      return this.editedHeaders.filter(item => item.expand)
    }
  },
  watch: {
    options:
    {
      handler () {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options
        this.getItems(sortBy, sortDesc, page, itemsPerPage, this.search)
      },
      deep: true
    },
    search () {
      const { sortBy, sortDesc, page, itemsPerPage } = this.options
      this.getItems(sortBy, sortDesc, page, itemsPerPage, this.search)
    },
    dialog (val) {
      if (!val) { this.close() }
    }
  },
  methods: {
    copyToClipboard (text) {
      const el = document.createElement('textarea')
      el.value = text
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    },
    copyText (text) {
      this.copyToClipboard(text)
      this.whatToCopy = 'ID'
      this.showSnackbar = true
    },
    displayQR (item) {
      this.qrItem = item
      this.showQR = true
    },
    update (key, value) {
      this.editedItem[key] = value
    },
    getItems: debounce(function (sortBy, sortDesc, page, itemsPerPage, search) {
      this.loading = true
      let url = `/${this.url}?offset=${(page - 1) * itemsPerPage}&limit=${itemsPerPage}&query=${search}`
      if (sortBy.length === 1 && sortDesc.length === 1) { url += `&sort=${sortBy[0]}&desc=${sortDesc[0]}` }
      this.$axios.get(url).then((resp) => { this.items = resp.data.result; this.numItems = resp.data.count; this.loading = false })
    }, 250),
    addItem (item) {
      this.numItems++
      this.items.push(item)
      if (this.items.length > this.options.itemsPerPage * this.options.page) { this.options.page++ }
      this.$store.dispatch('syncStats', false)
    },
    editItem (item) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem (item) {
      const index = this.items.indexOf(item)
      const self = this
      this.$axios.delete(`/${this.url}/${item.id}`).then(function (resp) {
        self.items.splice(index, 1)
        self.numItems--
        if (self.items.length === 0 && self.options.page > 1) { self.options.page-- }
        self.$store.dispatch('syncStats', false)
      })
    },
    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
        this.$refs.form.resetValidation()
      }, 300)
    },
    save () {
      if ('products' in this.editedItem) { this.editedItem.products = this.editedItem.products.split(' ') }
      if (this.editedIndex > -1) {
        this.$axios.patch(`/${this.url}/${this.editedItem.id}`, this.editedItem).then((resp) => { if (resp.status === 200) { this.editedItem.password = ''; Object.assign(this.items[this.editedIndex], this.editedItem); this.$store.dispatch('syncStats', false); this.close() } })
      } else {
        this.$axios.post(`/${this.url}`, this.editedItem).then((resp) => { if (resp.status === 200) { this.addItem(resp.data); this.close() } })
      }
    },
    checkout () {
      this.$router.replace({ path: `/i/${this.qrItem.id}` })
    },
    updateSuperuser (item) {
      this.$axios.patch(`/${this.url}/${item.id}`, item)
    }
  }
}
</script>
