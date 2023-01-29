<template>
  <div>
    <v-list class="mb-5 mt-0 py-0">
      <v-container class="py-0">
        <v-row>
          <v-list-item v-for="(item, index) in data" :key="index" class="pl-0">
            <v-list-item-content>
              <v-col v-if="!listOnly" cols="4">
                <v-text-field
                  v-model="item.key"
                  label="Name"
                  :rules="[rules.required]"
                  @input="sendInput"
                />
              </v-col>
              <v-col cols="4">
                <v-text-field
                  v-model="item.value"
                  label="Value"
                  :rules="[rules.required]"
                  @input="sendInput"
                />
              </v-col>
              <v-col cols="1">
                <v-btn icon @click="deleteItem(index)">
                  <tooltip-icon icon="mdi-delete" text="Delete" />
                </v-btn>
              </v-col>
            </v-list-item-content>
          </v-list-item>
        </v-row>
      </v-container>
    </v-list>
    <v-btn color="primary" class="pt-0 mt-0" @click="addItem"> Add new </v-btn>
  </div>
</template>

<script>
import TooltipIcon from "@/components/TooltipIcon"
export default {
  components: {
    TooltipIcon,
  },
  props: {
    initialValue: {
      type: Array,
      default: () => [],
    },
    listOnly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      data: this.initialValue,
      rules: {
        required: (value) =>
          (typeof value !== "undefined" && !!value) || "Required.",
      },
    }
  },
  methods: {
    addItem() {
      this.data.push({
        key: "",
        value: "",
      })
    },
    sendInput() {
      if (this.listOnly) {
        this.$emit(
          "input",
          this.data.map((item) => item.value)
        )
      } else {
        this.$emit("input", this.data)
      }
    },
    deleteItem(index) {
      this.data.splice(index, 1)
      this.sendInput()
    },
  },
}
</script>
