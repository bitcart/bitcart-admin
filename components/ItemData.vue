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
      :page.sync="page"
      @page-count="pageCount = $event"
    >
      <slot />
      <!-- Pass child templates to v-datatable for extensibility -->
      <template v-for="(_, slot) of $scopedSlots" #[slot]="scope">
        <slot v-if="slot.startsWith('item.')" :name="slot" v-bind="scope" />
      </template>
      <template #top>
        <v-dialog
          v-model="showTabDialog"
          :fullscreen="$vuetify.breakpoint.mobile"
          max-width="400px"
        >
          <TabbedCheckout
            :show-prop="showTabDialog"
            :invoice="tabbedDialogItem"
            class="pa-0"
            @closedialog="showTabDialog = false"
          />
        </v-dialog>
        <v-dialog v-model="showImageDialog" max-width="500px">
          <v-card>
            <v-card-title>Image preview</v-card-title>
            <v-img
              v-if="showImageItem.image"
              :src="imageURL(showImageItem.image)"
            />
            <v-card-text v-else class="text-h6"> No image </v-card-text>
          </v-card>
        </v-dialog>
        <component :is="toolbarComponent" flat class="mb-3">
          <v-toolbar-title>
            <mobile-wrap>{{ title + "s" }}</mobile-wrap>
          </v-toolbar-title>
          <div class="flex-grow-1" />
          <mobile-wrap>
            <v-text-field
              v-model="searchProp"
              append-icon="search"
              label="Search"
              single-line
              hide-details
            />
          </mobile-wrap>
          <v-spacer />
          <mobile-wrap>
            <menu-dropdown
              :items="batchActions.concat(customBatchActions)"
              :process="processBatchCommand"
              title="Actions"
            />
          </mobile-wrap>
          <mobile-wrap v-if="$slots['before-toolbar']" :wrap="true">
            <slot name="before-toolbar" />
          </mobile-wrap>
          <mobile-wrap>
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
              <template #dialog>
                <slot name="dialog" />
              </template>
            </edit-card>
          </mobile-wrap>
          <mobile-wrap v-if="$slots['after-toolbar']" :wrap="true">
            <slot name="after-toolbar" />
          </mobile-wrap>
          <mobile-wrap>
            <RefreshButton :func="triggerReload" />
          </mobile-wrap>
        </component>
      </template>
      <template #expanded-item="{ item }">
        <div
          v-for="header in toExpand"
          :key="header.text"
          style="white-space: pre"
        >
          <component
            :is="header.component"
            v-if="header.component"
            :data="item[header.value]"
          />
          <p v-else>{{ header.text }}: <br />{{ item[header.value] }}</p>
        </div>
      </template>
      <template #item.created="{ item }">
        {{ new Date(item.created).toLocaleString() }}
      </template>
      <template #item.end_date="{ item }">
        {{ new Date(item.end_date).toLocaleString() }}
      </template>
      <template
        v-for="(slotNameCopy, key) in copiableSlotNames"
        #[slotNameCopy]="{ item }"
      >
        <copy-text :key="slotNameCopy" :value="item[copiableNames[key]]" />
      </template>
      <template
        v-for="(slotName, key) in dropdownSlotNames"
        #[slotName]="{ item }"
      >
        <v-menu :key="slotName" offset-y allow-overflow max-height="300">
          <template #activator="{ on }">
            <v-btn color="primary" v-on="on"> Show </v-btn>
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
      <template #[tabbedSlotName]="{ item }">
        <v-btn color="primary" @click="showTabbedDialog(item, item.id)">
          Show
        </v-btn>
      </template>
      <template #[imageSlotName]="{ item }">
        <v-btn color="primary" @click="showImage(item)"> Show </v-btn>
      </template>
      <template #item.action="{ item }">
        <v-icon small class="mr-2" @click="copyText(item.id)">
          mdi-content-copy
        </v-icon>
        <v-icon small class="mr-2" @click="editItem(item)"> edit </v-icon>
        <v-icon
          v-for="action in actions"
          :key="action.icon"
          small
          class="mr-2"
          @click="action.process(item, items.indexOf(item))"
        >
          {{ action.icon }}
        </v-icon>
        <v-icon small class="mr-2" @click="deleteItem(item)"> delete </v-icon>
      </template>
    </v-data-table>
    <div class="text-center pt-2">
      <v-pagination v-model="page" :length="pageCount" :total-visible="11" />
    </div>
    <v-snackbar v-model="showSnackbar" :timeout="2500" color="success" bottom>
      <v-icon>mdi-content-copy</v-icon>
      Successfully copied {{ whatToCopy }} to clipboard!
    </v-snackbar>
  </div>
</template>

<script>
import debounce from "lodash.debounce"
import EditCard from "@/components/EditCard"
import TabbedCheckout from "@/components/TabbedCheckout"
import MenuDropdown from "@/components/MenuDropdown"
import CopyText from "@/components/CopyText"
import RefreshButton from "@/components/RefreshButton"
import MobileWrap from "@/components/MobileWrap"
export default {
  components: {
    EditCard,
    TabbedCheckout,
    MenuDropdown,
    CopyText,
    RefreshButton,
    MobileWrap,
  },
  props: {
    headers: {
      type: Array,
      default() {
        return []
      },
    },
    actions: {
      type: Array,
      default() {
        return []
      },
    },
    url: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    editMode: {
      type: Boolean,
      default: false,
    },
    dialogWatch: {
      type: Boolean,
      default: false,
    },
    search: {
      type: String,
      default: "",
    },
    customBatchActions: {
      type: Array,
      default() {
        return []
      },
    },
    postprocess: {
      type: Function,
      default: (data) => {
        return data
      },
    },
    postsave: {
      type: Function,
      default: (data) => {},
    },
    postclose: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      page: 1,
      pageCount: 0,
      searchProp: this.search,
      options: {},
      numItems: 0,
      dialog: false,
      showTabDialog: false,
      showImageDialog: false,
      showSnackbar: false,
      showImageItem: {},
      tabbedDialogItem: {},
      whatToCopy: "",
      loading: true,
      editedIndex: -1,
      editedItem: Object.assign(
        ...Array.from(this.headers, (x) => [x.value, x.default]).map(
          (k, i) => ({ [k[0]]: typeof k[1] === "undefined" ? "" : k[1] })
        )
      ),
      items: [],
      selected: [],
      batchActions: [
        {
          title: "Delete",
          command: "delete",
        },
      ],
    }
  },
  computed: {
    shouldExpand() {
      return this.headers.some((header) => header.expand)
    },
    editing() {
      return this.editedIndex !== -1
    },
    defaultHeaders() {
      return this.headers.filter(
        (item) => !item.expand && item.mode !== "nodisplay"
      )
    },
    toExpand() {
      return this.headers.filter((item) => item.expand)
    },
    dropdownNames() {
      return this.headers
        .filter((x) => x.input === "autocomplete" && x.multiple)
        .map((x) => x.value)
    },
    dropdownSlotNames() {
      return this.dropdownNames.map((x) => "item." + x)
    },
    copiableNames() {
      return this.headers.filter((x) => x.copy).map((x) => x.value)
    },
    copiableSlotNames() {
      return this.copiableNames.map((x) => "item." + x)
    },
    tabbedName() {
      const header = this.headers.find((x) => x.input === "tabbed")
      return header ? header.value : ""
    },
    tabbedSlotName() {
      return this.tabbedName ? "item." + this.tabbedName : undefined
    },
    noTabs() {
      return (
        Object.entries(this.tabbedDialogItem).length === 0 &&
        this.tabbedDialogItem.constructor === Object
      )
    },
    imageName() {
      const header = this.headers.find((x) => x.input === "image")
      return header ? header.value : ""
    },
    imageSlotName() {
      return this.imageName ? "item." + this.imageName : undefined
    },
    toolbarComponent() {
      return this.$vuetify.breakpoint.mobile ? "v-list" : "v-toolbar"
    },
  },
  watch: {
    options: {
      handler() {
        this.triggerReload(false, false)
      },
      deep: true,
    },
    search(val) {
      this.searchProp = val
    },
    searchProp(val) {
      this.$emit("update:search", val)
      this.triggerReload(true, false)
    },
    dialog(val) {
      this.$emit("update:dialogWatch", val)
      if (!val) {
        this.close()
      }
    },
  },
  beforeMount() {
    this.$bus.$on("updateitem", (item, index) => {
      this.editItemObj(item, index)
    })
    this.$bus.$on("additem", (item) => {
      this.addItem(item)
    })
    this.getItems = debounce(this.getItemsNolimit, 250)
  },
  beforeDestroy() {
    this.$bus.$off("updateitem")
    this.$bus.$off("additem")
  },
  methods: {
    triggerReload(search = false, refreshStats = true) {
      const { sortBy, sortDesc, itemsPerPage } = this.options
      let page = this.options.page
      if (search) {
        page = this.options.page = 1
      }
      this.getItems(sortBy, sortDesc, page, itemsPerPage, this.searchProp)
      if (refreshStats) this.$store.dispatch("syncStats", false)
    },
    processBatchCommand(command) {
      this.$axios
        .post(`/${this.url}/batch`, {
          ids: this.selected.map((x) => x.id),
          command,
        })
        .then((r) => {
          this.triggerReload()
        })
      this.selected = []
    },
    editItemObj(item, index) {
      if (index === null) {
        if (!this.editing) {
          // fired too frequently
          return
        }
        index = this.editedIndex
      }
      Object.assign(this.items[index], item)
    },
    copyText(text, desc) {
      this.$utils.copyToClipboard(text)
      this.whatToCopy = desc || "ID"
      this.showSnackbar = true
    },
    getItemsNolimit(sortBy, sortDesc, page, itemsPerPage, search) {
      this.loading = true
      let url = `/${this.url}?offset=${
        (page - 1) * itemsPerPage
      }&limit=${itemsPerPage}&query=${search}`
      if (sortBy.length === 1 && sortDesc.length === 1) {
        url += `&sort=${sortBy[0]}&desc=${sortDesc[0]}`
      }
      this.$axios.get(url).then((resp) => {
        this.items = resp.data.result
        this.numItems = resp.data.count
        this.loading = false
      })
    },
    addItem(item) {
      this.triggerReload()
      this.postsave(item)
    },
    combineURLs(baseURL, relativeURL) {
      return relativeURL
        ? baseURL.replace(/\/+$/, "") + "/" + relativeURL.replace(/^\/+/, "")
        : baseURL
    },
    loadImage(name) {
      const img = new Image()
      img.crossOrigin = "Anonymous"
      img.src = this.imageURL(this.editedItem[name])
      this.editedItem[name] = ""
      const canvas = document.createElement("canvas")
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")
        ctx.drawImage(img, 0, 0)
        this.editedItem[name] = canvas.toDataURL("image/png")
      }
    },
    editItem(item) {
      this.$emit("update:editMode", true)
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = JSON.parse(JSON.stringify(item))
      const dateH = this.headers.find((x) => x.input === "datetime")
      const imageH = this.headers.find((x) => x.input === "image")
      if (dateH) {
        this.editedItem[dateH.value] = new Date(this.editedItem[dateH.value])
      }
      if (imageH) {
        if (this.editedItem[imageH.value] === null) {
          this.editedItem[imageH.value] = ""
        }
        if (this.editedItem[imageH.value]) {
          this.loadImage(imageH.value)
        }
      }
      this.dialog = true
    },
    deleteItem(item) {
      this.$axios.delete(`/${this.url}/${item.id}`).then((resp) => {
        if (this.items.length - 1 === 0 && this.options.page > 1) {
          this.options.page--
        } else {
          this.triggerReload(false, false)
        }
        this.$store.dispatch("syncStats", false)
      })
    },
    close() {
      this.$emit("update:editMode", false)
      this.editedIndex = -1
    },
    showTabbedDialog(item, id) {
      this.tabbedDialogItem = Object.assign({}, item)
      this.showTabDialog = true
    },
    imageURL(url) {
      return this.combineURLs(this.$store.getters.apiURL, url)
    },
    showImage(item) {
      this.showImageItem = item
      this.showImageDialog = true
    },
  },
}
</script>

<style>
.v-dialog--fullscreen {
  background-color: #1e1e1e;
}
</style>
