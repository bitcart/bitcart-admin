<template>
  <v-toolbar>
    <v-toolbar-items>
      <v-btn v-for="item in items" :key="item.text" :to="item.to" text>
        <v-icon v-if="item.icon" left> {{ item.icon }} </v-icon>
        <component :is="item.component" v-else></component>
        {{ item.text }}
      </v-btn>
    </v-toolbar-items>
  </v-toolbar>
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
