<template>
  <edit-card
    :url="url"
    :on.sync="showCopy"
    :headers="[]"
    :body="body"
    :item.sync="itemCopy"
    :item-index="itemIndex"
    :show-new="false"
    :edit-mode="true"
    :dialog-watch.sync="dialogWatch"
    :title="title"
  >
    <template v-if="dialogWatch" #dialog="{ item: itemd }">
      <v-col v-for="template in defaultTemplates" :key="template" cols="6">
        <auto-complete
          :value="itemd.templates[template]"
          :label="template"
          :initial-items="initialTemplates"
          url="templates"
          clearable
          @input="updateTemplates(template, $event)"
        />
      </v-col>
    </template>
  </edit-card>
</template>
<script>
import EditCard from "@/components/EditCard.vue"
import AutoComplete from "@/components/AutoComplete.vue"
export default {
  components: {
    EditCard,
    AutoComplete,
  },
  props: {
    name: {
      type: String,
      required: true,
    },
    item: {
      type: Object,
      required: true,
    },
    itemIndex: {
      type: Number,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
    body: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogWatch: false,
      initialTemplates: [],
      defaultTemplates: [],
    }
  },
  computed: {
    url() {
      return this.name + "s"
    },
    title() {
      return `${this.name} default templates`
    },
    showCopy: {
      get() {
        return this.show
      },
      set(v) {
        this.$emit("update:show", v)
      },
    },
    itemCopy: {
      get() {
        return this.item
      },
      set(v) {
        this.$emit("update:item", v)
      },
    },
  },
  beforeMount() {
    this.$axios.get(`/templates/list?applicable_to=${this.name}`).then((r) => {
      this.defaultTemplates = r.data.result
    })
    this.$axios.get("/templates").then((r) => {
      this.initialTemplates = r.data.result
    })
  },
  methods: {
    updateTemplates(template, value) {
      if (value === null) this.$delete(this.itemCopy.templates, template)
      else this.itemCopy.templates[template] = value
    },
  },
}
</script>
