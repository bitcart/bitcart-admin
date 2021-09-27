<template>
  <v-tooltip bottom>
    <template #activator="{ on, attrs }">
      <v-icon
        v-bind="{ ...attrs, ...$attrs }"
        v-on="on"
        @click="$emit('click')"
      >
        {{ icon }}
      </v-icon>
    </template>
    <span>{{ text }}</span>
  </v-tooltip>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    icon: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
}
</script>
