<template>
  <div>
    <v-dialog v-model="dialog" max-width="650px">
      <template v-if="showNew" v-slot:activator="{ on: show }">
        <v-btn color="primary" dark v-on="show"> New {{ title }} </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid">
            <v-container>
              <v-row>
                <component
                  :is="header.input !== 'dynamic' ? 'v-col' : 'div'"
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
                    <template v-if="header.help" v-slot:append>
                      <v-btn icon target="_blank" :href="header.help">
                        <v-icon medium> mdi-help-circle-outline </v-icon>
                      </v-btn>
                    </template>
                  </v-text-field>
                  <v-textarea
                    v-else-if="header.input === 'textarea'"
                    :rows="10"
                    :rules="header.rules"
                    :error-messages="errors[header.text]"
                    :label="header.text"
                    :value="item[header.value]"
                    @input="update(header.value, $event)"
                  >
                    <template v-if="header.help" v-slot:append>
                      <v-btn icon target="_blank" :href="header.help">
                        <v-icon medium> mdi-help-circle-outline </v-icon>
                      </v-btn>
                    </template>
                  </v-textarea>
                  <template v-else-if="header.input === 'dynamic'">
                    <v-container>
                      <v-row>
                        <v-col
                          v-for="field in getFields(header, item)"
                          :key="field"
                          :cols="6"
                        >
                          <v-text-field
                            v-model="item[header.value][field]"
                            :label="field"
                            :rules="
                              isRequiredField(header, item, field)
                                ? [rules.required]
                                : []
                            "
                          />
                        </v-col>
                      </v-row>
                    </v-container>
                  </template>
                  <v-switch
                    v-else-if="header.input === 'switch'"
                    v-model="item[header.value]"
                    :rules="header.rules"
                    :error-messages="errors[header.text]"
                    :label="header.text"
                  />
                  <component
                    :is="header.component || 'v-autocomplete'"
                    v-else-if="header.input === 'autocomplete'"
                    ref="autocomplete"
                    v-model="item[header.value]"
                    :loading="loadingSearches[header.value]"
                    :items="searchItems[header.value]"
                    :search-input.sync="autosearches[header.value]"
                    cache-items
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
                        close
                        @click="data.select"
                        @click:close="
                          removeMultiple(item[header.value], data.item)
                        "
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
                  <v-datetime-picker
                    v-else-if="header.input === 'datetime'"
                    ref="dateInput"
                    v-model="item[header.value]"
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
                  <v-text-field
                    v-else
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
                </component>
                <slot :item="item" name="dialog" />
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1" />
          <v-btn color="blue darken-1" text @click="dialog = false">
            Cancel
          </v-btn>
          <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import debounce from "lodash.debounce"
let components = {}
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
      rules: {
        required: (value) =>
          (typeof value !== "undefined" && !!value) || "Required.",
        min: (v) =>
          (typeof v !== "undefined" && v.length >= 8) || "Min 8 characters",
        email: (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return (
            typeof value === "undefined" ||
            value === "" ||
            value == null ||
            pattern.test(value) ||
            "Invalid e-mail."
          )
        },
        int: (v) => isFinite(v) || "Integer required",
        url: (value) => {
          if (typeof value === "undefined" || value === "" || value == null) {
            return true
          }
          try {
            new URL(value) // eslint-disable-line no-new
            return true
          } catch (_) {
            return "Invalid URL"
          }
        },
      },
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
    autosearches: {
      handler(val) {
        const vm = this
        const key = Object.keys(val).filter(function (p) {
          return val[p] !== vm.oldAutosearches[p]
        })[0]
        val = val[key]
        this.oldAutosearches[key] = val
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
    this.getItems = debounce(this.getItemsNolimit, 250)
    for (const urlObj of this.headers.filter(
      (x) => x.input === "autocomplete"
    )) {
      this.getItemsNolimit(
        urlObj.value,
        urlObj.value,
        urlObj.url,
        [],
        [],
        1,
        5,
        "",
        false,
        true,
        urlObj.body
      )
    }
    for (const field of this.headers.filter((x) => x.input === "dynamic")) {
      this.fetchField(field)
    }
  },
  methods: {
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
      multiple = multiple || false
      if (autosearch) {
        this.loadingSearches[loadingVal] = true
      } else {
        this[loadingVal] = true
      }
      const paramString = baseUrl.includes("?") ? "&" : "?"
      let url = `/${baseUrl}${paramString}offset=${
        (page - 1) * itemsPerPage
      }&limit=${itemsPerPage}&query=${search}&multiple=${multiple}`
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
          if (header.errors && errText in header.errors) {
            this.$set(this.errors, header.text, [header.errors[errText]])
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
        if (this.body || this.headers.some((x) => x.input === "image")) {
          const header = this.headers.find((x) => x.input === "image")
          const dataForm = new FormData()
          if (header) {
            if (data[header.value]) {
              dataForm.append(
                header.value,
                this.dataURLtoBlob(data[header.value])
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
          this.$axios
            .patch(`/${this.url}/${this.item.id}`, data, headers)
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
  },
}
</script>
