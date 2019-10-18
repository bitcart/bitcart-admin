<template>
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
              <v-container>
                <v-row>
                  <v-col
                    v-for="header in toEdit"
                    :key="header.value"
                    cols="12"
                    sm="6"
                    md="4"
                  >
                    <v-text-field :label="header.text" :value="editedItem[header.value]" @input="update(header.value, $event)" />
                  </v-col>
                </v-row>
              </v-container>
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
      {{ Date(item).toLocaleString() }}
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
        @click="editItem(item)"
      >
        edit
      </v-icon>
      <v-icon
        small
        @click="deleteItem(item)"
      >
        delete
      </v-icon>
    </template>
  </v-data-table>
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
      search: '',
      options: {},
      numItems: 0,
      dialog: false,
      loading: true,
      editedIndex: -1,
      editedItem: Object.assign(...Array.from(this.headers, x => x.value).map((k, i) => ({ [k]: '' }))),
      itemsVal: []
    }
  },
  computed: {
    items: {
      get () { return this.itemsVal },
      set (val) {
        this.itemsVal = val
      }
    },
    shouldExpand () {
      return this.headers.some(header => header.expand)
    },
    formTitle () {
      return this.editedIndex === -1 ? `New ${this.title}` : `Edit ${this.title}`
    },
    toEdit () {
      return this.headers.filter(item => (item.value !== 'action' && (item.mode === 'edit' || item.mode === 'all' || typeof item.mode === 'undefined')))
    },
    defaultHeaders () {
      return this.headers.filter(item => !item.expand)
    },
    toExpand () {
      return this.headers.filter(item => item.expand)
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
    }
  },
  methods: {
    update (key, value) {
      this.editedItem[key] = value
    },
    getItems: debounce(function (sortBy, sortDesc, page, itemsPerPage, search) {
      this.loading = true
      let url = `http://localhost:8000/${this.url}?offset=${(page - 1) * itemsPerPage}&limit=${itemsPerPage}&query=${search}`
      if (sortBy.length === 1 && sortDesc.length === 1) { url += `&sort=${sortBy[0]}&desc=${sortDesc[0]}` }
      this.$axios.get(url).then((resp) => { this.items = resp.data.result; this.numItems = resp.data.count; this.loading = false })
    }, 250),
    addItem (item) {
      this.itemsVal.push(item)
    },
    editItem (item) {
      this.editedIndex = this.itemsVal.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem (item) {
      const index = this.itemsVal.indexOf(item)
      this.$axios.delete(`http://localhost:8000/${this.url}/${item.id}`).then(resp => (this.itemsVal.splice(index, 1)))
    },
    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      }, 300)
    },
    save () {
      if (this.editedIndex > -1) {
        this.$axios.patch(`http://localhost:8000/${this.url}/${this.editedItem.id}`, this.editedItem).then((resp) => { if (resp.status === 200) { Object.assign(this.items[this.editedIndex], this.editedItem) } })
      } else {
        this.$axios.post(`http://localhost:8000/${this.url}`, this.editedItem).then((resp) => { if (resp.status === 200) { this.addItem(this.editedItem) } })
      }
      this.close()
    }
  }
}
</script>
