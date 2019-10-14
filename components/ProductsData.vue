<template>
  <v-data-table
    :headers="headers"
    :items="products"
    :items-per-page="5"
    :server-items-length="numProducts"
    :options.sync="options"
    :loading="loading"
    loading-text="Loading..."
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar flat>
        <v-toolbar-title>Products</v-toolbar-title>
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
              New Item
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">{{ formTitle }}</span>
            </v-card-title>

            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.title" label="Product name" />
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.amount" label="Amount" />
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.quantity" label="Quantity" />
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field v-model="editedItem.store_id" label="Store ID" />
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
  data () {
    return {
      search: '',
      options: {},
      numProducts: 0,
      dialog: false,
      loading: true,
      headers: [
        { text: 'Store name', value: 'store_name' },
        { text: 'Status', value: 'status' },
        { text: 'Amount', value: 'amount' },
        { text: 'Actions', value: 'action', sortable: false }
      ],
      editedIndex: -1,
      editedItem:
      {
        title: '',
        amount: '',
        quantity: '',
        store_id: ''
      },
      productsVal: []
    }
  },
  computed: {
    products: {
      get () { return this.productsVal },
      set (val) {
        for (const product in val) {
          this.$axios.get(`http://localhost:8000/stores/${val[product].store_id}`).then(resp => (this.$set(val[product], 'store_name', resp.data.name)))
        }
        this.productsVal = val
      }
    },
    formTitle () {
      return this.editedIndex === -1 ? 'New Product' : 'Edit Product'
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
      const { page, itemsPerPage } = this.options
      this.getItems(page, itemsPerPage, this.search)
    }
  },
  methods: {
    getItems: debounce(function (sortBy, sortDesc, page, itemsPerPage, search) {
      this.loading = true
      let url = `http://localhost:8000/products?offset=${(page - 1) * itemsPerPage}&limit=${itemsPerPage}&query=${search}`
      if (sortBy.length === 1 && sortDesc.length === 1) { url += `&sort=${sortBy[0]}&desc=${sortDesc[0]}` }
      this.$axios.get(url).then((resp) => { this.products = resp.data.result; this.numProducts = resp.data.count; this.loading = false })
    }, 250),
    addItem (item) {
      this.$axios.get(`http://localhost:8000/stores/${item.store_id}`).then((resp) => { item.store_name = resp.data.name; this.productsVal.push(item) })
    },
    editItem (item) {
      this.editedIndex = this.productsVal.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    deleteItem (item) {
      const index = this.productsVal.indexOf(item)
      this.$axios.delete(`http://localhost:8000/products/${item.id}`).then(resp => (this.productsVal.splice(index, 1)))
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
        this.$axios.patch(`http://localhost:8000/products/${this.editedItem.id}`, this.editedItem).then((resp) => { if (resp.status === 200) { Object.assign(this.products[this.editedIndex], this.editedItem); this.$axios.get(`http://localhost:8000/stores/${this.editedItem.store_id}`).then((resp) => { this.editedItem.store_name = resp.data.name }) } })
      } else {
        this.$axios.post('http://localhost:8000/products', this.editedItem).then((resp) => { if (resp.status === 200) { this.addItem(this.editedItem) } })
      }
      this.close()
    }
  }
}
</script>
