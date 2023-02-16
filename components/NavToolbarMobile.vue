<template>
  <v-list>
    <v-btn
      v-if="$device.isDesktop"
      icon
      class="d-flex ml-auto mr-0"
      @click="$emit('input', !value)"
    >
      <v-icon>{{
        value ? "keyboard_double_arrow_left" : "keyboard_double_arrow_right"
      }}</v-icon>
    </v-btn>
    <v-list-item v-for="item in items" :key="item.text" :to="item.to" exact>
      <v-list-item-action v-if="item.icon || item.component">
        <v-icon v-if="item.icon">{{ item.icon }}</v-icon>
        <component :is="item.component" v-else></component>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title v-text="item.text" />
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true,
    },
    value: {
      type: Boolean,
      default: false,
    },
  },
}
</script>
