<template>
  <div>
    <v-dialog v-model="showDateDialog" max-width="500px">
      <v-card>
        <v-card-title>Filter {{ title }} by custom date range </v-card-title>
        <v-card-text>
          <v-datetime-picker
            ref="dateInput1"
            v-model="startDate"
            :time-picker-props="{ format: '24hr' }"
            label="Start date"
          />
          <v-datetime-picker
            ref="dateInput2"
            v-model="endDate"
            :time-picker-props="{ format: '24hr' }"
            label="End date"
          />
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" @click="applyDateFilter">Apply</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <menu-dropdown
      :items="filterItems"
      :process="applyFilter"
      title="Filters"
    />
  </div>
</template>

<script>
import MenuDropdown from "@/components/MenuDropdown.vue"

export default {
  components: {
    MenuDropdown,
  },
  props: {
    title: {
      type: String,
      default: "invoices",
    },
    search: {
      type: String,
      required: true,
    },
    customFilters: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      searchProp: this.search,
      showDateDialog: false,
      startDate: null,
      endDate: null,
      filterItems: [
        ...this.customFilters,
        {
          title: "Last 24 hours",
          command: "start_date:-1d",
        },
        {
          title: "Last week",
          command: "start_date:-1w",
        },
        {
          title: "Last month",
          command: "start_date:-1m",
        },
        {
          title: "Custom range",
          command: { customRange: true },
        },
        {
          title: "Unfiltered",
          command: "",
        },
      ],
    }
  },
  watch: {
    search(val) {
      this.searchProp = val
    },
    searchProp(val) {
      this.$emit("update:search", val)
    },
  },
  methods: {
    applyFilter(filter) {
      if (filter.customRange) {
        if (this.$refs.dateInput1) {
          this.$refs.dateInput1.clearHandler()
        }
        if (this.$refs.dateInput2) {
          this.$refs.dateInput2.clearHandler()
        }
        this.showDateDialog = true
        return
      }
      this.searchProp = filter
    },
    applyDateFilter() {
      if (this.startDate && this.endDate) {
        this.searchProp = `start_date:${this.startDate.toISOString()} end_date:${this.endDate.toISOString()} ${
          this.searchProp
        }`
        this.showDateDialog = false
      }
    },
  },
}
</script>
