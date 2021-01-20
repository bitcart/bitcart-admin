<template>
  <div>
    <v-checkbox
      :input-value="value"
      class="form-check-inline"
      :rules="rules"
      @change="$emit('input', $event)"
    >
      <template #label>
        <h3>
          {{
            customTitle
              ? customTitle
              : `The app will be able to create, modify and delete all your ${title}.`
          }}
        </h3>
      </template>
    </v-checkbox>
    <div v-if="selective">
      <button v-if="all" class="green--text" @click="updateAll(false)">
        Give permission to specific {{ title }} instead
      </button>
      <div v-else>
        <button class="green--text" @click="updateAll(true)">
          Give permission to all {{ title }} instead
        </button>
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Boolean,
      default: true,
    },
    all: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      required: true,
    },
    customTitle: {
      type: String,
      default: "",
    },
    selective: {
      type: Boolean,
      default: true,
    },
    rules: {
      type: Array,
      default: () => {
        return []
      },
    },
    strict: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    updateAll(value) {
      this.$emit("update:all", value)
    },
  },
}
</script>
