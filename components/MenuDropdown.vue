<template>
  <v-menu offset-y>
    <template #activator="{ on, attrs }">
      <v-btn color="primary" v-bind="attrs" class="mr-2" v-on="on">
        {{ title }} <v-icon>mdi-menu-down</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item
        v-for="(item, index) in items"
        :key="index"
        @click="process(item.command)"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      default() {
        return []
      },
    },
    process: {
      type: Function,
      default: (command) => {},
    },
  },
}
</script>
