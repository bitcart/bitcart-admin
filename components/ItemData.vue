<template>
  <div>
    <v-data-table
      v-model="selected"
      :headers="defaultHeaders"
      :items="items"
      :items-per-page="5"
      :server-items-length="numItems"
      :options.sync="options"
      :loading="loading"
      :show-expand="shouldExpand"
      show-select
      loading-text="Loading..."
      class="elevation-1"
    >
      <slot />
      <!-- Pass child templates to v-datatable for extensibility -->
      <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope">
        <slot v-if="slot.startsWith('item.')" :name="slot" v-bind="scope" />
      </template>
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
          <v-dialog v-model="showTabDialog" :fullscreen="$vuetify.breakpoint.smAndDown" max-width="500px">
            <TabbedCheckout :show-prop="showTabDialog" :tabitem="tabbedDialogItem[tabbedName]" :invoice="tabbedDialogItem" class="pa-0" @closedialog="showTabDialog = false" />
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
          <menu-dropdown :items="batchActions.concat(customBatchActions)" :process="processBatchCommand" title="Actions" />
          <slot name="before-toolbar" />
          <edit-card
            :url="url"
            :headers="headers"
            :title="title"
            :on.sync="dialog"
            :item.sync="editedItem"
            :edit-mode="editing"
            :postprocess="postprocess"
            :postclose="postclose"
          >
            <template v-slot:dialog>
              <slot name="dialog" />
            </template>
          </edit-card>
          <slot name="after-toolbar" />
          <v-btn icon @click="triggerReload(false)">
            <v-icon>
              mdi-reload
            </v-icon>
          </v-btn>
        </v-toolbar>
      </template>
      <template v-slot:expanded-item="{ item }">
        <div v-for="header in toExpand" :key="header.text" style="white-space:pre;">
          <component :is="header.component" v-if="header.component" :data="item[header.value]" />
          <p v-else>
            {{ header.text }}: {{ item[header.value] }}
          </p>
        </div>
      </template>
      <template v-slot:item.created="{ item }">
        {{ new Date(item.created).toLocaleString() }}
      </template>
      <template v-slot:item.end_date="{ item }">
        {{ new Date(item.end_date).toLocaleString() }}
      </template>
      <template v-for="(slotName, key) in dropdownSlotNames" v-slot:[slotName]="{ item }">
        <v-menu :key="slotName" offset-y allow-overflow max-height="300">
          <template v-slot:activator="{ on }">
            <v-btn
              color="primary"
              v-on="on"
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
        <v-btn color="primary" @click="showTabbedDialog(item, item.id)">
          Show
        </v-btn>
      </template>
      <template v-slot:[imageSlotName]="{ item }">
        <v-btn color="primary" @click="showImage(item)">
          Show
        </v-btn>
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
          v-for="action in actions"
          :key="action.icon"
          small
          class="mr-2"
          @click="action.process(item, items.indexOf(item))"
        >
          {{ action.icon }}
        </v-icon>
        <v-icon
          small
          class="mr-2"
          @click="deleteItem(item)"
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
  </div>
</template>

<script>
import debounce from 'lodash.debounce'
import EditCard from '@/components/EditCard'
import TabbedCheckout from '@/components/TabbedCheckout'
import MenuDropdown from '@/components/MenuDropdown'
export default {
  components: {
    EditCard,
    TabbedCheckout,
    MenuDropdown
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
    },
    editMode: {
      type: Boolean,
      default: false
    },
    dialogWatch: {
      type: Boolean,
      default: false
    },
    customBatchActions: {
      type: Array,
      default () { return [] }
    },
    postprocess: {
      type: Function,
      default: (data) => { return data }
    },
    postsave: {
      type: Function,
      default: (data) => {}
    },
    postclose: {
      type: Function,
      default: () => {}
    }
  },
  data () {
    return {
      search: '',
      options: {},
      numItems: 0,
      dialog: false,
      showTabDialog: false,
      showImageDialog: false,
      showSnackbar: false,
      showImageItem: {},
      tabbedDialogItem: {},
      whatToCopy: '',
      loading: true,
      editedIndex: -1,
      editedItem: Object.assign(...Array.from(this.headers, x => [x.value, x.default]).map((k, i) => ({ [k[0]]: typeof k[1] === 'undefined' ? '' : k[1] }))),
      items: [],
      selected: [],
      batchActions: [{
        title: 'Delete',
        command: 'delete'
      }]
    }
  },
  computed: {
    shouldExpand () {
      return this.headers.some(header => header.expand)
    },
    editing () {
      return this.editedIndex !== -1
    },
    defaultHeaders () {
      return this.headers.filter(item => (!item.expand && item.mode !== 'nodisplay'))
    },
    toExpand () {
      return this.headers.filter(item => item.expand)
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
        this.triggerReload()
      },
      deep: true
    },
    search () {
      this.triggerReload(true)
    },
    dialog (val) {
      this.$emit('update:dialogWatch', val)
      if (!val) { this.close() }
    }
  },
  beforeMount () {
    this.$bus.$on('updateitem', (item, index) => { this.editItemObj(item, index) })
    this.$bus.$on('additem', (item) => { this.addItem(item) })
    this.getItems = debounce(this.getItemsNolimit, 250)
  },
  methods: {
    triggerReload (search = false) {
      const { sortBy, sortDesc, itemsPerPage } = this.options
      let page = this.options.page
      if (search) {
        page = this.options.page = 1
      }
      this.getItems(sortBy, sortDesc, page, itemsPerPage, this.search)
    },
    processBatchCommand (command) {
      this.$axios.post(`/${this.url}/batch`, { ids: this.selected.map(x => x.id), command }).then((r) => {
        this.triggerReload()
      })
      this.selected = []
    },
    editItemObj (item, index) {
      if (index === null) {
        if (!this.editing) { // fired too frequently
          return
        }
        index = this.editedIndex
      }
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
    getItemsNolimit (sortBy, sortDesc, page, itemsPerPage, search) {
      this.loading = true
      let url = `/${this.url}?offset=${(page - 1) * itemsPerPage}&limit=${itemsPerPage}&query=${search}`
      if (sortBy.length === 1 && sortDesc.length === 1) { url += `&sort=${sortBy[0]}&desc=${sortDesc[0]}` }
      this.$axios.get(url).then((resp) => {
        this.items = resp.data.result
        this.numItems = resp.data.count
        this.loading = false
      })
    },
    addItem (item) {
      this.triggerReload()
      this.postsave(item)
      this.$store.dispatch('syncStats', false)
    },
    combineURLs (baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL
    },
    loadImage (name) {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = this.imageURL(this.editedItem[name])
      this.editedItem[name] = ''
      const canvas = document.createElement('canvas')
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        this.editedItem[name] = canvas.toDataURL('image/png')
      }
    },
    editItem (item) {
      this.$emit('update:editMode', true)
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = JSON.parse(JSON.stringify(item))
      const dateH = this.headers.find(x => x.input === 'datetime')
      const imageH = this.headers.find(x => x.input === 'image')
      if (dateH) {
        this.editedItem[dateH.value] = new Date(this.editedItem[dateH.value])
      }
      if (imageH) {
        if (this.editedItem[imageH.value] === null) {
          this.editedItem[imageH.value] = ''
        }
        if (this.editedItem[imageH.value]) {
          this.loadImage(imageH.value)
        }
      }
      this.dialog = true
    },
    deleteItem (item) {
      this.$axios.delete(`/${this.url}/${item.id}`).then((resp) => {
        if (this.items.length - 1 === 0 && this.options.page > 1) {
          this.options.page--
        } else { this.triggerReload() }
        this.$store.dispatch('syncStats', false)
      })
    },
    close () {
      this.$emit('update:editMode', false)
      this.editedIndex = -1
    },
    showTabbedDialog (item, id) {
      this.tabbedDialogItem = Object.assign({}, item)
      this.showTabDialog = true
    },
    imageURL (url) {
      return this.combineURLs(this.$store.getters.apiURL, url)
    },
    showImage (item) {
      this.showImageItem = item
      this.showImageDialog = true
    }
  }
}
</script>
