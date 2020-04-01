<template>
  <v-dialog v-model="dialog" max-width="500px">
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
                  :loading="loadingSearch"
                  :items="searchItems"
                  :search-input.sync="autosearch"
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
                      @click:close="removeMultiple(editedItem[header.value], data.item)"
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
                <v-btn v-else-if="header.input === 'button'" color="primary" @click="header.click(editedItem)">
                  {{ header.text }}
                </v-btn>
                <div v-else-if="header.input === 'progress'" v-show="(customProps[header.loading] || customProps[header.status])">
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
                  v-model="editedItem[header.value]"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  :rules="header.rules"
                  :type="showPassword ? 'text' : 'password'"
                  :label="header.text"
                  :hint="header.hint"
                  name="input-10-1"
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
</template>

<script>
export default {
  props: {
    on: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    mode: {
      type: String,
      default: 'new'
    },
    headers: {
      type: Array,
      default () { return [] }
    },
    item: {
      type: Object,
      default () { return {} }
    },
    url: {
      type: String,
      default: ''
    },
    customProps: {
      type: Object,
      default () { return {} }
    }
  },
  data () {
    return {
      formValid: false,
      showPassword: false,
      errors: {},
      loadingSearch: false,
      searchItems: [],
      autosearch: null,
      originalItem: {},
      editedItem: {},
      rules: {
        required: value => (typeof value !== 'undefined' && !!value) || 'Required.',
        min: v => (typeof v !== 'undefined' && v.length >= 8) || 'Min 8 characters',
        email: (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return (typeof value === 'undefined' || value === '' || value == null || pattern.test(value)) || 'Invalid e-mail.'
        },
        int: v => isFinite(v) || 'Integer required'
      }
    }
  },
  computed: {
    dialog: {
      get () {
        return this.on
      },
      set (value) {
        this.$emit('update:on', value)
      }

    },
    formTitle () {
      return this.mode === 'new' ? `New ${this.title}` : `Edit ${this.title}`
    },
    editedHeaders () {
      return this.headers.map((x) => { if (x.rules && !x.rules.some(y => typeof y === 'undefined')) { x.rules = x.rules.map((y) => { return this.rules[y] }) } else { x.rules = [] } return x })
    },
    toEdit () {
      return this.editedHeaders.filter(item => (item.value !== 'action' && (item.mode === 'edit' || item.mode === 'all' || item.mode === 'nodisplay' || typeof item.mode === 'undefined')))
    },
    toCreate () {
      return this.editedHeaders.filter(item => (item.value !== 'action' && (item.mode === 'create' || item.mode === 'nodisplay' || typeof item.mode === 'undefined')))
    },
    dialogData () {
      return this.mode === 'new' ? this.toCreate : this.toEdit
    },
    loadingVal () {
      const item = this.headers.find(x => x.input === 'progress')
      return item ? this[item.loading] : undefined
    },
    emailText () {
      const item = this.headers.find(x => x.input === 'progress')
      return item ? this[item.text] : undefined
    }
  },
  watch: {
    item (val) {
      this.originalItem = Object.assign({}, val)
      this.editedItem = Object.assign({}, val)
    }
  },
  methods: {
    update (key, value) {
      this.editedItem[key] = value
    },
    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.originalItem)
        const item = this.headers.find(x => x.input === 'progress')
        if (item) {
          this.$emit('reset-custom-props')
        }
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
    save () {
      if (this.$refs.form.validate()) {
        if (this.mode === 'edit') {
          this.$axios.patch(`/${this.url}/${this.editedItem.id}`, this.editedItem).then((resp) => { if (resp.status === 200) { this.editedItem.password = ''; this.$emit('update:item', resp.data); this.$store.dispatch('syncStats', false); this.close() } }).catch(err => this.handleErr(err))
        } else {
          this.$axios.post(`/${this.url}`, this.editedItem).then((resp) => { if (resp.status === 200) { this.addItem(resp.data); this.close() } }).catch(err => this.handleErr(err))
        }
      }
    }
  }
}
</script>
