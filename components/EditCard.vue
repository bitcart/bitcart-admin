<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <v-dialog
      v-model="dialog"
      max-width="650px"
      :fullscreen="$vuetify.breakpoint.mobile"
    >
      <template v-if="showNew" #activator="{ on: show }">
        <v-btn color="primary" dark v-on="show"> New {{ title }} </v-btn>
      </template>
      <v-dialog v-model="showCreateWalletDialog" max-width="650px">
        <v-card>
          <v-card-title class="justify-center"
            >Create a new wallet</v-card-title
          >
          <v-card-text v-if="!walletSeed">
            Select wallet type
            <v-radio-group v-model="walletType">
              <v-radio
                key="watchonly"
                label="Watch-only (no private keys stored)"
                value="watchonly"
              />
              <v-radio
                key="seed"
                label="Hot wallet (private keys on server)"
                value="seed"
              />
            </v-radio-group>
          </v-card-text>
          <v-card-text v-else>
            Write down this seed in a secure place. This won't be shown anymore.
            If you loose your seed, you'll loose your funds.<br />
            <code v-text="walletSeed" />
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn v-if="!walletSeed" color="primary" @click="createWallet"
              >Create</v-btn
            >
            <v-btn
              v-else
              color="primary"
              @click="showCreateWalletDialog = false"
            >
              Close</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-form ref="form" v-model="formValid" @submit.prevent="save">
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ formTitle }}</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <component
                  :is="
                    header.input !== 'dynamic' && header.input !== 'metadata'
                      ? 'v-col'
                      : 'v-container'
                  "
                  v-for="header in dialogData"
                  :key="header.value"
                  :cols="['image', 'textarea'].includes(header.input) ? 12 : 6"
                >
                  <v-text-field
                    v-if="
                      header.input === 'text' ||
                      typeof header.input === 'undefined'
                    "
                    :rules="header.rules"
                    :error-messages="errors[header.text]"
                    :label="header.text"
                    :hint="header.hint"
                    persistent-hint
                    :value="item[header.value]"
                    :readonly="editMode && header.readonly"
                    @input="update(header.value, $event)"
                  >
                    <template #append>
                      <v-tooltip v-if="header.value === 'xpub'" bottom>
                        <template #activator="{ on: onAttr, attrs }">
                          <v-btn
                            icon
                            v-bind="attrs"
                            v-on="onAttr"
                            @click="showCreateWalletDialog = true"
                          >
                            <v-icon medium>mdi-plus</v-icon>
                          </v-btn>
                        </template>
                        <span>Create a new wallet</span>
                      </v-tooltip>
                      <v-btn
                        v-if="header.help"
                        icon
                        target="_blank"
                        :href="header.help"
                      >
                        <v-icon medium> mdi-help-circle-outline </v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                  <v-textarea
                    v-else-if="header.input === 'textarea'"
                    :rows="header.rows || 10"
                    :rules="header.rules"
                    :error-messages="errors[header.text]"
                    :label="header.text"
                    :value="item[header.value]"
                    @input="update(header.value, $event)"
                  >
                    <template v-if="header.help" #append>
                      <v-btn icon target="_blank" :href="header.help">
                        <v-icon medium> mdi-help-circle-outline </v-icon>
                      </v-btn>
                    </template>
                  </v-textarea>
                  <v-file-input
                    v-else-if="header.input === 'file'"
                    v-model="item[header.value]"
                    :label="header.text"
                    :rules="[
                      (value) =>
                        !value ||
                        value.size < 50 * 1024 * 1024 ||
                        'File size should be less than 50 MB!',
                    ]"
                  />
                  <template v-else-if="header.input === 'dynamic'">
                    <v-row>
                      <v-col
                        v-for="field in getFields(header, item)"
                        :key="field"
                        :cols="6"
                      >
                        <v-text-field
                          v-model="item[header.value][field]"
                          :label="$utils.toTitleCase(field)"
                          :rules="
                            isRequiredField(header, item, field)
                              ? [rules.required]
                              : []
                          "
                        />
                      </v-col>
                    </v-row>
                  </template>
                  <template v-else-if="header.input === 'metadata'">
                    <v-row>
                      <v-col
                        v-for="field in Object.keys(item[header.value])"
                        :key="field"
                        :cols="6"
                      >
                        <v-text-field
                          v-model="item[header.value][field]"
                          :label="
                            header.useTitle
                              ? header.text
                              : $utils.toTitleCase(field)
                          "
                        />
                      </v-col>
                    </v-row>
                  </template>
                  <v-switch
                    v-else-if="header.input === 'switch'"
                    v-model="item[header.value]"
                    :rules="header.rules"
                    :error-messages="errors[header.text]"
                    :label="header.text"
                    :append-icon="header.help ? 'mdi-help-circle-outline' : ''"
                    @click:append="$utils.redirectTo(header.help, true)"
                  />
                  <component
                    :is="header.component || 'v-autocomplete'"
                    v-else-if="header.input === 'autocomplete'"
                    ref="autocomplete"
                    :loading="loadingSearches[header.value]"
                    :items="searchItems[header.value]"
                    :search-input.sync="autosearches[header.value]"
                    :cache-items="header.multiple"
                    :multiple="header.multiple"
                    :chips="header.multiple"
                    :rules="header.rules"
                    :error-messages="errors[header.text]"
                    :label="header.text"
                    color="#90a4ae"
                    item-text="name"
                    item-value="id"
                    :value="item[header.value]"
                    @change="handleAutocomplete(header.value, $event)"
                  >
                    <template v-if="header.multiple" #selection="data">
                      <v-chip
                        v-bind="data.attrs"
                        :input-value="data.selected"
                        close
                        @click="data.select"
                        @click:close="
                          removeMultiple(item[header.value], data.item)
                        "
                      >
                        {{ data.item.name ? data.item.name : data.item }}
                      </v-chip>
                    </template>
                    <template #item="data">
                      <template v-if="isNotObject(data)">
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
                  </component>
                  <v-image-input
                    v-else-if="header.input === 'image'"
                    ref="imageInput"
                    v-model="item[header.value]"
                    :image-height="400"
                    :image-width="400"
                    :image-max-scaling="2"
                    clearable
                    image-min-scaling="contain"
                  />
                  <div v-else-if="header.input === 'tabbed'" />
                  <v-select
                    v-else-if="header.input === 'select'"
                    :items="header.items"
                    :rules="header.rules"
                    :error-messages="errors[header.text]"
                    :label="header.text"
                    :value="item[header.value]"
                    @input="update(header.value, $event)"
                  />
                  <v-datetime-picker
                    v-else-if="header.input === 'datetime'"
                    ref="dateInput"
                    v-model="item[header.value]"
                    :time-picker-props="{ format: '24hr' }"
                    :text-field-props="{ rules: header.rules }"
                    :label="header.text"
                    date-format="dd.MM.yyyy"
                  />
                  <v-btn
                    v-else-if="header.input === 'button'"
                    color="primary"
                    @click="header.click(item)"
                  >
                    {{ header.text }}
                  </v-btn>
                  <div
                    v-else-if="header.input === 'progress'"
                    v-show="
                      customProps[header.loading] || customProps[header.status]
                    "
                  >
                    <v-progress-circular
                      v-if="customProps[header.loading]"
                      indeterminate
                    />
                    <div v-else>
                      <p>
                        {{ customProps[header.text] }}
                        <span>
                          <v-icon>
                            {{ customProps[header.status] }}
                          </v-icon>
                        </span>
                      </p>
                    </div>
                  </div>
                  <UIExtensionSlot
                    v-else
                    name="edit_card_input_types"
                    :item="item"
                    :header="header"
                    @update:item="item = $event"
                  >
                    <v-text-field
                      v-model="item[header.value]"
                      :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                      :rules="header.rules"
                      :type="showPassword ? 'text' : 'password'"
                      :label="header.text"
                      :hint="header.hint"
                      name="input-10-1"
                      counter
                      @click:append="showPassword = !showPassword"
                    />
                  </UIExtensionSlot>
                </component>
                <slot :item="item" name="dialog" />
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <div class="flex-grow-1" />
            <v-btn color="#1e88e5" text @click="dialog = false"> Cancel </v-btn>
            <v-btn color="#1e88e5" text type="submit"> Save </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script>
import debounce from "lodash.debounce"
import UIExtensionSlot from "@/components/UIExtensionSlot.vue"
let components = { UIExtensionSlot }
if (process.env.NODE_ENV === "production") {
  const VAutocomplete = require("vuetify/lib/components/VAutocomplete").default
  const VCombobox = require("vuetify/lib/components/VCombobox").default
  components = Object.assign({}, components, { VAutocomplete, VCombobox })
}
export default {
  components,
  props: {
    on: {
      type: Boolean,
      default: false,
    },
    headers: {
      type: Array,
      default() {
        return []
      },
    },
    item: {
      type: Object,
      default() {
        return {}
      },
    },
    itemIndex: {
      type: Number,
      default: null,
    },
    url: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    showNew: {
      type: Boolean,
      default: true,
    },
    editMode: {
      type: Boolean,
      default: false,
    },
    dialogWatch: {
      type: Boolean,
      default: false,
    },
    body: {
      type: Boolean,
      default: false,
    },
    getEditUrl: {
      type: Function,
      default: (item) => {},
    },
    postprocess: {
      type: Function,
      default: (data) => {
        return data
      },
    },
    postclose: {
      type: Function,
      default: () => {},
    },
    customProps: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    const autosearchA = Array.from(
      this.headers.filter((x) => x.input === "autocomplete"),
      (x) => x.value
    ).map((k, i) => ({ [k]: null }))
    const lsearchA = Array.from(
      this.headers.filter((x) => x.input === "autocomplete"),
      (x) => x.value
    ).map((k, i) => ({ [k]: false }))
    const dsearchA = Array.from(
      this.headers.filter((x) => x.input === "dynamic"),
      (x) => x.value
    ).map((k, i) => ({ [k]: {} }))
    const dt = {
      formValid: false,
      loadingSearches: lsearchA.length > 0 ? Object.assign(...lsearchA) : {},
      searchItems: {},
      autosearches: autosearchA.length > 0 ? Object.assign(...autosearchA) : {},
      errors: {},
      dynamicAutocompletes: false,
      fields: dsearchA.length > 0 ? Object.assign(...dsearchA) : {},
      defaultItem:
        this.headers.length > 0
          ? Object.assign(
              ...Array.from(this.headers, (x) => [x.value, x.default]).map(
                (k, i) => ({
                  [k[0]]: typeof k[1] === "undefined" ? "" : k[1],
                })
              )
            )
          : {},
      showPassword: false,
      showCreateWalletDialog: false,
      walletType: "watchonly",
      walletSeed: "",
      rules: this.$utils.rules,
      oldItem: Object.assign({}, this.item),
      cachedSchema: {},
      justOpened: false,
    }
    dt.oldAutosearches = Object.assign({}, dt.autosearches)
    return dt
  },
  computed: {
    dialog: {
      get() {
        return this.on
      },
      set(value) {
        this.$emit("update:on", value)
      },
    },
    editedHeaders() {
      return this.headers.map((x) => {
        if (x.rules && !x.rules.some((y) => typeof y === "undefined")) {
          return {
            ...x,
            rules: x.rules.map((y) => {
              return this.rules[y]
            }),
          }
        } else {
          return { ...x, rules: [] }
        }
      })
    },
    formTitle() {
      return this.editMode ? `Edit ${this.title}` : `New ${this.title}`
    },
    toEdit() {
      return this.editedHeaders.filter(
        (item) =>
          item.value !== "action" &&
          (item.mode === "edit" ||
            item.mode === "all" ||
            item.mode === "nodisplay" ||
            typeof item.mode === "undefined")
      )
    },
    toCreate() {
      return this.editedHeaders.filter(
        (item) =>
          item.value !== "action" &&
          (item.mode === "create" ||
            item.mode === "createonly" ||
            item.mode === "nodisplay" ||
            typeof item.mode === "undefined")
      )
    },
    dialogData() {
      return this.editMode ? this.toEdit : this.toCreate
    },
  },
  watch: {
    dialog(val) {
      this.$emit("update:dialogWatch", val)
      if (!val) {
        this.close()
      }
    },
    showCreateWalletDialog(val) {
      if (!val) {
        this.walletSeed = ""
        this.walletType = "watchonly"
      }
    },
    item: {
      handler(val) {
        if (val.currency !== this.oldItem.currency) {
          this.headers.forEach((header) => {
            if (header.dynamicText) {
              this.$set(
                header,
                "text",
                header.dynamicText(val, this.cachedSchema)
              )
            }
          })
        }
        if (this.dynamicAutocompletes && val.currency !== this.oldItem.currency)
          this.fetchAutocompletes()
        this.oldItem = Object.assign({}, val)
      },
      deep: true,
    },
    on(val) {
      // clever trick: load when user closed to hide loading times
      if (val === false) this.performInit()
      else this.justOpened = true
    },
    autosearches: {
      handler(val) {
        const vm = this
        const key = Object.keys(val).filter(function (p) {
          return val[p] !== vm.oldAutosearches[p]
        })[0]
        if (typeof key === "undefined") return // card closed
        val = val[key]
        this.oldAutosearches[key] = val
        if (this.justOpened || !this.on) {
          this.justOpened = false
          return
        }
        if (val === null || typeof val === "undefined") {
          val = ""
        }
        let limit = -1
        if (!val) {
          limit = 5
        }
        const header = this.headers.find((x) => x.value === key)
        this.getItems(
          header.value,
          header.value,
          header.url,
          [],
          [],
          1,
          limit,
          val,
          header.multiple || false,
          true,
          header.body
        )
      },
      deep: true,
    },
  },
  beforeMount() {
    if (this.url === "wallets") {
      this.$axios.get("/wallets/schema").then((r) => {
        this.cachedSchema = r.data
      })
    }
    this.getItems = debounce(this.getItemsNolimit, 250)
    this.performInit()
  },
  methods: {
    isNotObject(data) {
      return typeof data.item !== "object"
    },
    performInit() {
      this.fetchAutocompletes()
      for (const field of this.headers.filter((x) => x.input === "dynamic")) {
        this.fetchField(field)
      }
    },
    fetchAutocompletes() {
      for (const urlObj of this.headers.filter(
        (x) => x.input === "autocomplete"
      )) {
        if (typeof urlObj.url === "function") this.dynamicAutocompletes = true
        this.getItemsNolimit(
          urlObj.value,
          urlObj.value,
          urlObj.url,
          [],
          [],
          1,
          -1,
          "",
          false,
          true,
          urlObj.body
        )
      }
    },
    getProperties(header, item) {
      return this.fields[header.value][item[header.choice]]
    },
    getFields(header, item) {
      const properties = this.getProperties(header, item)
      const result = [...(properties ? properties[header.propertiesKey] : [])]
      result.sort((a, b) => a.localeCompare(b))
      result.sort((a, b) =>
        this.isRequiredField(header, item, a, properties) ? -1 : 1
      )
      return result
    },
    isRequiredField(header, item, field, propertiesPassed) {
      const properties = propertiesPassed || this.getProperties(header, item)
      return properties[header.requiredKey].includes(field)
    },
    fetchField(field) {
      this.$axios.get(field.url).then((resp) => {
        this.fields[field.value] = resp.data
      })
    },
    update(key, value) {
      // eslint-disable-next-line vue/no-mutating-props
      this.item[key] = value
    },
    getItemsNolimit(
      toSave,
      loadingVal,
      baseUrl,
      sortBy,
      sortDesc,
      page,
      itemsPerPage,
      search,
      multiple,
      autosearch,
      getBody
    ) {
      if (typeof baseUrl === "function") baseUrl = baseUrl(this.item)
      multiple = multiple || false
      if (autosearch) {
        this.loadingSearches[loadingVal] = true
      } else {
        this[loadingVal] = true
      }
      const paramString = baseUrl.includes("?") ? "&" : "?"
      let url = `/${baseUrl}${paramString}offset=${
        (page - 1) * itemsPerPage
      }&limit=${itemsPerPage}&query=${encodeURIComponent(
        search
      )}&multiple=${multiple}`
      if (sortBy.length === 1 && sortDesc.length === 1) {
        url += `&sort=${sortBy[0]}&desc=${sortDesc[0]}`
      }
      this.$axios.get(url).then((resp) => {
        let items
        if (getBody) {
          items = resp.data
        } else {
          items = resp.data.result
        }
        if (autosearch) {
          this.searchItems[toSave] = items
          this.loadingSearches[loadingVal] = false
        } else {
          this[toSave] = items
          this[loadingVal] = false
        }
      })
    },
    close() {
      const imageH = this.headers.find((x) => x.input === "image")
      const dateH = this.headers.find((x) => x.input === "datetime")
      if (imageH) {
        for (const imageInput of this.$refs.imageInput) {
          imageInput.clear()
        }
      }
      if (dateH) {
        for (const dateInput of this.$refs.dateInput) {
          dateInput.clearHandler()
        }
      }
      for (const key in this.autosearches) {
        this.autosearches[key] = null
      }
      this.$emit("update:item", Object.assign({}, this.defaultItem))
      this.errors = {}
      this.showPassword = false
      this.$refs.form.resetValidation()
      const item = this.headers.find((x) => x.input === "progress")
      if (item) {
        this.$emit("reset-custom-props")
      }
      this.postclose()
    },
    handleErr(err) {
      if (err.response) {
        const errText = err.response.data.detail
        for (const header of this.headers) {
          if (header.errors) {
            for (const [error, message] of Object.entries(header.errors)) {
              if (errText.includes(error)) {
                this.$set(this.errors, header.text, [message])
              }
            }
          }
        }
      }
    },
    dataURLtoBlob(dataurl) {
      if (!dataurl) {
        return new Blob([])
      }
      const arr = dataurl.split(",")
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new Blob([u8arr], { type: mime })
    },
    addItem(item) {
      this.$bus.$emit("additem", item)
    },
    save() {
      this.errors = {} // clean previous errors
      if (this.$refs.form.validate()) {
        let data = Object.assign({}, this.item)
        data = this.postprocess(data)
        let headers = {}
        if (
          this.body ||
          this.headers.some((x) => x.input === "image" || x.input === "file")
        ) {
          const header = this.headers.find(
            (x) => x.input === "image" || x.input === "file"
          )
          const dataForm = new FormData()
          if (header) {
            if (data[header.value]) {
              dataForm.append(
                header.value,
                header.input === "image"
                  ? this.dataURLtoBlob(data[header.value])
                  : data[header.value]
              )
            }
            delete data[header.value]
          }
          delete data.action
          dataForm.append("data", JSON.stringify(data))
          data = dataForm
          headers = { "content-type": "application/x-www-form-urlencoded" }
        }
        if (this.editMode) {
          const url =
            this.getEditUrl(this.item) || `/${this.url}/${this.item.id}`
          this.$axios
            .patch(url, data, headers)
            .then((resp) => {
              if (resp.status === 200) {
                resp.data.password = ""
                this.$bus.$emit("updateitem", resp.data, this.itemIndex)
                this.$emit("update:item", Object.assign({}, this.defaultItem))
                this.$store.dispatch("syncStats", false)
                this.dialog = false
              }
            })
            .catch((err) => this.handleErr(err))
        } else {
          this.$axios
            .post(`/${this.url}`, data, headers)
            .then((resp) => {
              if (resp.status === 200) {
                this.addItem(resp.data)
                this.$emit("update:item", Object.assign({}, this.defaultItem))
                this.dialog = false
              }
            })
            .catch((err) => this.handleErr(err))
        }
      }
    },
    removeMultiple(arr, item) {
      const index = arr.indexOf(item.id)
      if (index >= 0) {
        arr.splice(index, 1)
      }
    },
    handleAutocomplete(key, value) {
      const oldval = this.item[key]
      // TODO: find a more generic way of handling this
      if (key === "provider" && value !== oldval) {
        this.$set(this.item, "data", {})
      }
      this.$set(this.item, key, value)
    },
    createWallet() {
      this.$axios
        .post("/wallets/create", {
          currency: this.item.currency,
          hot_wallet: this.walletType === "seed",
        })
        .then((r) => {
          this.update("xpub", r.data.key)
          this.update("additional_xpub_data", r.data.additional_data)
          this.walletSeed = r.data.seed
        })
    },
  },
}
</script>
