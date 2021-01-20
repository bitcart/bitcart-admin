<template>
  <v-tooltip bottom>
    <template #activator="{ on, attrs }">
      <v-icon small v-bind="attrs" v-on="on" @click="$emit('click')">
        {{ icon }}
      </v-icon>
    </template>
    <span>{{ text }}</span>
  </v-tooltip>
</template>

<script>
export default {
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
