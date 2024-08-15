<template>
  <v-data-table
    :headers="headers"
    :items="providers"
    :hide-default-footer="true"
    class="elevation-1"
  >
    <template #top>
      <v-toolbar flat>
        <v-dialog v-model="dialog" max-width="500px">
          <template #activator="{ on, attrs }">
            <v-btn color="primary" dark class="mb-2" v-bind="attrs" v-on="on">
              New Provider
            </v-btn>
          </template>
          <v-card>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.provider_name"
                      label="Provider name"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.client_id"
                      label="Client id"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" sm="6" md="4">
                    <v-text-field
                      v-model="editedItem.client_secret"
                      label="Client secret"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
              <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialogDelete" max-width="500px">
          <v-card>
            <v-card-title class="text-h5"
              >Are you sure you want to delete this item?</v-card-title
            >
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" text @click="closeDelete"
                >Cancel</v-btn
              >
              <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                >OK</v-btn
              >
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-toolbar>
    </template>
    <template #item.actions="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)"> mdi-pencil </v-icon>
      <v-icon small @click="deleteItem(item)"> mdi-delete </v-icon>
    </template>
  </v-data-table>
</template>
<script>
export default {
  data: () => ({
    dialog: false,
    dialogDelete: false,
    headers: [
      {
        text: "Provider name",
        align: "start",
        sortable: false,
        value: "provider_name",
      },
      { text: "Client id", value: "client_id" },
      { text: "Client secret", value: "client_secret" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    providers: [],
    editedIndex: -1,
    editedItem: {
      provider_name: "",
      client_id: 0,
      client_secret: 0,
    },
    defaultItem: {
      provider_name: "",
      client_id: 0,
      client_secret: 0,
    },
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "New Item" : "Edit Item"
    },
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
    dialogDelete(val) {
      val || this.closeDelete()
    },
  },

  beforeMount() {
    this.providers = this.$store.state.policies.enabled_providers
  },

  methods: {
    editItem(item) {
      this.editedIndex = this.providers.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialog = true
      this.$emit("input", this.providers)
    },
    deleteItem(item) {
      this.editedIndex = this.providers.indexOf(item)
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
      this.$emit("input", this.providers)
    },
    deleteItemConfirm() {
      this.providers.splice(this.editedIndex, 1)
      this.closeDelete()
      this.$emit("input", this.providers)
    },
    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    closeDelete() {
      this.dialogDelete = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },
    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.providers[this.editedIndex], this.editedItem)
      } else {
        this.providers.push(this.editedItem)
      }
      this.$emit("input", this.providers)
      this.close()
    },
  },
}
</script>
