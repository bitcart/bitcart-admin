<template>
  <v-list>
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
  },
}
</script>
