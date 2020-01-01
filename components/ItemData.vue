<template>
  <v-container>
    <v-data-table
      :headers="defaultHeaders"
      :items="items"
      :items-per-page="5"
      :server-items-length="numItems"
      :options.sync="options"
      :loading="loading"
      :show-expand="shouldExpand"
      loading-text="Loading..."
      class="elevation-1"
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
                <qrcode :options="{width: 500}" :value="qrItem[forQR.value]" tag="v-img" class="image-preview" />
              </div>
              <v-card-actions class="justify-center">
                <v-btn @click="copyText(qrItem[forQR.value], forQR.text.toUpperCase())" class="justify-center" color="primary">
                  <v-icon left="left">
                    mdi-content-copy
                  </v-icon><span>Copy</span>
                </v-btn>
                <v-btn @click="checkout()" class="justify-center" color="primary">
                  <v-icon left="left">
                    mdi-open-in-new
                  </v-icon><span>Open checkout</span>
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="showTabDialog" max-width="500px">
            <TabbedCheckout :showProp="showTabDialog" :tabitem="tabbedDialogItem[tabbedName]" :invoice="tabbedDialogItem" />
          </v-dialog>
          <v-dialog v-model="showImageDialog" max-width="500px">
            <v-card>
              <v-card-title>Image preview</v-card-title>
              <v-img v-if="showImageItem.image" :src="imageURL(showImageItem.image)" />
              <v-card-text v-else class="title">
                No image
              </v-card-text>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialog" max-width="650px">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" color="primary" dark>
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
                        :cols="header.input === 'image' ? 12: 6"
                      >
                        <v-text-field
                          v-if="header.input === 'text' || typeof header.input === 'undefined'"
                          :rules="header.rules"
                          :error-messages="errors[header.text]"
                          :label="header.text"
                          :value="editedItem[header.value]"
                          @input="update(header.value, $event)"
                        />
                        <v-switch v-else-if="header.input === 'switch'" v-model="editedItem[header.value]" :rules="header.rules" :error-messages="errors[header.text]" :label="header.text" />
                        <v-autocomplete
                          v-else-if="header.input === 'autocomplete'"
                          v-model="editedItem[header.value]"
                          :loading="loadingSearches[header.value]"
                          :items="searchItems[header.value]"
                          :search-input.sync="autosearches[header.value]"
                          :multiple="header.multiple"
                          :chips="header.multiple"
                          :rules="header.rules"
                          :error-messages="errors[header.text]"
                          :label="header.text"
                          color="blue-grey lighten-2"
                          item-text="name"
                          item-value="id"
                        >
                          <template v-if="header.multiple" v-slot:selection="data">
                            <v-chip
                              v-bind="data.attrs"
                              :input-value="data.selected"
                              @click="data.select"
                              @click:close="removeMultiple(editedItem[header.value], data.item)"
                              close
                            >
                              {{ data.item.name }}
                            </v-chip>
                          </template>
                          <template v-slot:item="data">
                            <template v-if="typeof data.item !== 'object'">
                              <v-list-item-content v-text="data.item" />
                            </template>
                            <template v-else>
                              <v-list-item-content>
                                <v-list-item-title>
                                  {{ data.item.name }}
                                </v-list-item-title>
                              </v-list-item-content>
                            </template>
                          </template>
                        </v-autocomplete>
                        <v-image-input
                          ref="imageInput"
                          v-else-if="header.input === 'image'"
                          v-model="editedItem[header.value]"
                          :image-height="400"
                          :image-width="400"
                          :image-max-scaling="2"
                          clearable
                          image-min-scaling="contain"
                        />
                        <div v-else-if="header.input === 'tabbed'" />
                        <v-datetime-picker v-else-if="header.input === 'datetime'" :label="header.txt" v-model="editedItem[header.value]" date-format="dd.MM.yyyy" />
                        <v-text-field
                          v-else
                          v-model="editedItem[header.value]"
                          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                          :rules="header.rules"
                          :type="showPassword ? 'text' : 'password'"
                          :label="header.text"
                          :hint="header.hint"
                          @click:append="showPassword = !showPassword"
                          name="input-10-1"
                          counter
                        />
                      </v-col>
                    </v-row>
                  </v-container>
                </v-form>
              </v-card-text>

              <v-card-actions>
                <div class="flex-grow-1" />
                <v-btn @click="close" color="blue darken-1" text>
                  Cancel
                </v-btn>
                <v-btn @click="save" color="blue darken-1" text>
                  Save
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>

      <template v-slot:expanded-item="{ item }">
        <td v-for="header in toExpand" :key="header.text">
          {{ header.text }}: {{ item[header.value] }}
        </td>
      </template>
      <template v-slot:item.date="{ item }">
        {{ new Date(item.date).toLocaleString() }}
      </template>
      <template v-slot:item.end_date="{ item }">
        {{ new Date(item.end_date).toLocaleString() }}
      </template>
      <template v-slot:item.is_superuser="{item}">
        <v-switch v-model="item.is_superuser" @change="updateSuperuser(item)" />
      </template>
      <template v-for="(slotName, key) in dropdownSlotNames" v-slot:[slotName]="{ item }">
        <v-menu :key="slotName" offset-y allow-overflow max-height="300">
          <template v-slot:activator="{ on }">
            <v-btn
              v-on="on"
              color="primary"
            >
              Show
            </v-btn>
          </template>
          <v-list v-if="item[dropdownNames[key]].length > 0">
            <v-list-item
              v-for="(itemv, index) in item[dropdownNames[key]]"
              :key="index"
              @click="copyText(itemv)"
            >
              <v-list-item-title>{{ itemv }}</v-list-item-title>
            </v-list-item>
          </v-list>
          <v-list v-else>
            <v-list-item>
              <v-list-item-title>No entries</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <template v-slot:[tabbedSlotName]="{ item }">
        <v-btn @click="showTabbedDialog(item, item.id)" color="primary">
          Show
        </v-btn>
      </template>
      <template v-slot:[imageSlotName]="{ item }">
        <v-btn @click="showImage(item)" color="primary">
          Show
        </v-btn>
      </template>
      <template v-slot:item.action="{ item }">
        <v-icon
          @click="copyText(item.id)"
          small
          class="mr-2"
        >
          mdi-content-copy
        </v-icon>
        <v-icon
          @click="editItem(item)"
          small
          class="mr-2"
        >
          edit
        </v-icon>
        <v-icon
          v-if="!(Object.entries(forQR).length === 0 && forQR.constructor === Object)"
          @click="displayQR(item)"
          small
          class="mr-2"
        >
          mdi-qrcode
        </v-icon>
        <v-icon
          v-for="action in actions"
          :key="action.icon"
          @click="action.process(item, items.indexOf(item))"
          small
          class="mr-2"
        >
          {{ action.icon }}
        </v-icon>
        <v-icon
          @click="deleteItem(item)"
          small
          class="mr-2"
        >
          delete
        </v-icon>
      </template>
    </v-data-table>
    <v-snackbar
      v-model="showSnackbar"
      :timeout="2500"
      color="success"
      bottom
    >
      <v-icon>mdi-content-copy</v-icon>
      Successfully copied {{ whatToCopy }} to clipboard!
    </v-snackbar>
    <v-container />
  </v-container>
</template>

<script>
import debounce from 'lodash.debounce'
import TabbedCheckout from '@/components/TabbedCheckout'
export default {
  components: {
    TabbedCheckout
  },
  props: {
    headers: {
      type: Array,
      default () { return [] }
    },
    actions: {
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
    const autosearchA = Array.from(this.headers.filter(x => x.input === 'autocomplete'), x => x.value).map((k, i) => ({ [k]: null }))
    const lsearchA = Array.from(this.headers.filter(x => x.input === 'autocomplete'), x => x.value).map((k, i) => ({ [k]: false }))
    const dt = {
      formValid: false,
      loadingSearches: lsearchA.length > 0 ? Object.assign(...lsearchA) : {},
      searchItems: {},
      autosearches: autosearchA.length > 0 ? Object.assign(...autosearchA) : {},
      errors: {},
      search: '',
      options: {},
      numItems: 0,
      dialog: false,
      showQR: false,
      showTabDialog: false,
      showImageDialog: false,
      showSnackbar: false,
      qrItem: {},
      showImageItem: {},
      tabbedDialogItem: {},
      whatToCopy: '',
      loading: true,
      editedIndex: -1,
      editedItem: Object.assign(...Array.from(this.headers, x => x.value).map((k, i) => ({ [k]: '' }))),
      defaultItem: Object.assign(...Array.from(this.headers, x => x.value).map((k, i) => ({ [k]: '' }))),
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
    dt.oldAutosearches = Object.assign({}, dt.autosearches)
    return dt
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
    },
    dropdownNames () {
      return this.headers.filter(x => x.input === 'autocomplete' && x.multiple).map(x => x.value)
    },
    dropdownSlotNames () {
      return this.dropdownNames.map(x => 'item.' + x)
    },
    tabbedName () {
      const header = this.headers.find(x => x.input === 'tabbed')
      return header ? header.value : ''
    },
    tabbedSlotName () {
      return this.tabbedName ? 'item.' + this.tabbedName : undefined
    },
    noTabs () {
      return Object.entries(this.tabbedDialogItem).length === 0 && this.tabbedDialogItem.constructor === Object
    },
    imageName () {
      const header = this.headers.find(x => x.input === 'image')
      return header ? header.value : ''
    },
    imageSlotName () {
      return this.imageName ? 'item.' + this.imageName : undefined
    }
  },
  watch: {
    options:
    {
      handler () {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options
        this.getItems('items', 'loading', this.url, sortBy, sortDesc, page, itemsPerPage, this.search, false)
      },
      deep: true
    },
    search () {
      const { sortBy, sortDesc, page, itemsPerPage } = this.options
      this.getItems('items', 'loading', this.url, sortBy, sortDesc, page, itemsPerPage, this.search, false)
    },
    dialog (val) {
      if (!val) { this.close() }
    },
    autosearches: {
      handler (val) {
        const vm = this
        const key = Object.keys(val).filter(function (p) {
          return val[p] !== vm.oldAutosearches[p]
        })[0]
        val = val[key]
        this.oldAutosearches[key] = val
        if (val === null || typeof val === 'undefined') { val = '' }
        let limit = -1
        if (!val) { limit = 5 }
        const header = this.headers.find(x => x.value === key)
        this.getItems(header.value, header.value, header.url, [], [], 1, limit, val, header.multiple || false, true)
      },
      deep: true
    }
  },
  beforeMount () {
    this.$bus.$on('updateitem', (item, index) => { this.editItemObj(item, index) })
    this.getItems = debounce(this.getItemsNolimit, 250)
    for (const urlObj of this.headers.filter(x => x.input === 'autocomplete')) {
      this.getItemsNolimit(urlObj.value, urlObj.value, urlObj.url, [], [], 1, 5, '', false, true)
    }
  },
  methods: {
    editItemObj (item, index) {
      Object.assign(this.items[index], item)
    },
    copyToClipboard (text) {
      const el = document.createElement('textarea')
      el.addEventListener('focusin', e => e.stopPropagation())
      el.value = text
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    },
    copyText (text, desc) {
      this.copyToClipboard(text)
      this.whatToCopy = desc || 'ID'
      this.showSnackbar = true
    },
    displayQR (item) {
      this.qrItem = Object.assign({}, item)
      this.showQR = true
    },
    update (key, value) {
      this.editedItem[key] = value
    },
    getItemsNolimit (toSave, loadingVal, baseUrl, sortBy, sortDesc, page, itemsPerPage, search, multiple, autosearch) {
      if (autosearch) { this.loadingSearches[loadingVal] = true } else { this[loadingVal] = true }
      let url = `/${baseUrl}?offset=${(page - 1) * itemsPerPage}&limit=${itemsPerPage}&query=${search}&multiple=${multiple}`
      if (sortBy.length === 1 && sortDesc.length === 1) { url += `&sort=${sortBy[0]}&desc=${sortDesc[0]}` }
      this.$axios.get(url).then((resp) => {
        if (autosearch) { this.searchItems[toSave] = resp.data.result } else { this[toSave] = resp.data.result }
        if (toSave === 'items') { this.numItems = resp.data.count }
        if (autosearch) { this.loadingSearches[loadingVal] = false } else { this[loadingVal] = false }
      })
    },
    addItem (item) {
      this.numItems++
      this.items.push(item)
      if (this.items.length > this.options.itemsPerPage * this.options.page) { this.options.page++ }
      this.$store.dispatch('syncStats', false)
    },
    combineURLs (baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL
    },
    editItem (item) {
      const urlObjs = this.headers.filter(x => x.input === 'autocomplete')
      const dateH = this.headers.find(x => x.input === 'datetime')
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = JSON.parse(JSON.stringify(item))
      for (const urlObj of urlObjs) {
        let limit = -1
        if (!this.editedItem[urlObj.value]) { limit = 5 }
        this.getItemsNolimit(urlObj.value, urlObj.value, urlObj.url, [], [], 1, limit, this.editedItem[urlObj.value], urlObj.multiple, true)
      }
      if (dateH) {
        this.editedItem[dateH.value] = new Date(this.editedItem[dateH.value])
      }
      const imageH = this.headers.find(x => x.input === 'image')
      if (imageH && this.editedItem[imageH.value] === null) { this.editedItem[imageH.value] = '' }
      if (imageH && this.editedItem[imageH.value]) {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.src = this.imageURL(this.editedItem[imageH.value])
        this.editedItem[imageH.value] = ''
        const canvas = document.createElement('canvas')
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)
          this.editedItem[imageH.value] = canvas.toDataURL('image/png')
        }
      }
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
        const imageH = this.headers.find(x => x.input === 'image')
        if (imageH) {
          for (const imageInput of this.$refs.imageInput) { imageInput.clear() }
        }
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
        this.errors = {}
        this.$refs.form.resetValidation()
      }, 300)
    },
    handleErr (err) {
      if (err.response) {
        const errText = err.response.data.detail
        for (const header of this.headers) {
          if (header.errors && errText in header.errors) {
            this.$set(this.errors, header.text, [header.errors[errText]])
          }
        }
      }
    },
    dataURLtoBlob (dataurl) {
      if (!dataurl) { return new Blob([]) }
      const arr = dataurl.split(','); const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1]); let n = bstr.length; const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    },
    save () {
      if (this.$refs.form.validate()) {
        let data = Object.assign({}, this.editedItem)
        let headers = {}
        if (this.headers.some(x => x.input === 'image')) {
          const header = this.headers.find(x => x.input === 'image')
          const dataForm = new FormData()
          if (data[header.value]) { dataForm.append(header.value, this.dataURLtoBlob(data[header.value])) }
          delete data[header.value]
          delete data.action
          dataForm.append('data', JSON.stringify(data))
          data = dataForm
          headers = { 'content-type': 'application/x-www-form-urlencoded' }
        }
        if (this.editedIndex > -1) {
          this.$axios.patch(`/${this.url}/${this.editedItem.id}`, data, headers).then((resp) => { if (resp.status === 200) { Object.assign(this.items[this.editedIndex], resp.data); this.items[this.editedIndex].password = ''; this.$store.dispatch('syncStats', false); this.close() } }).catch(err => this.handleErr(err))
        } else {
          this.$axios.post(`/${this.url}`, data, headers).then((resp) => { if (resp.status === 200) { this.addItem(resp.data); this.close() } }).catch(err => this.handleErr(err))
        }
      }
    },
    checkout (id) {
      if (!id) { id = this.qrItem.id }
      this.$router.replace({ path: `/i/${id}` })
    },
    updateSuperuser (item) {
      this.$axios.patch(`/${this.url}/${item.id}`, item)
    },
    removeMultiple (arr, item) {
      const index = arr.indexOf(item.id)
      if (index >= 0) { arr.splice(index, 1) }
    },
    showTabbedDialog (item, id) {
      this.tabbedDialogItem = Object.assign({}, item)
      this.showTabDialog = true
    },
    imageURL (url) {
      return this.combineURLs(this.$store.state.env.URL, url)
    },
    showImage (item) {
      this.showImageItem = item
      this.showImageDialog = true
    }
  }
}
</script>
