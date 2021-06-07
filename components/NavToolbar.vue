<template>
  <div>
    <v-toolbar class="mb-3 hidden-sm-and-down">
      <v-toolbar-items>
        <v-btn v-for="item in items" :key="item.text" :to="item.to" exact text>
          {{ item.text }}
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <div class="mb-3 hidden-md-and-up">
      <v-divider />
      <v-list>
        <v-list-item v-for="item in items" :key="item.text" :to="item.to" exact>
          <v-list-item-content>
            <v-list-item-title v-text="item.text" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider />
    </div>
  </div>
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
