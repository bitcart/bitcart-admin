<template>
  <div>
    <v-toolbar class="mb-3 hidden-sm-and-down">
      <v-toolbar-items>
        <v-btn v-for="item in items" :key="item.text" :to="item.to" exact text>
          <v-icon v-if="item.icon">{{ item.icon }}</v-icon>
          {{ item.text }}
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <div class="mb-3 hidden-md-and-up">
      <v-divider />
      <NavToolbarMobile :items="items" />
      <v-divider />
    </div>
  </div>
</template>

<script>
import NavToolbarMobile from "@/components/NavToolbarMobile"
export default {
  components: {
    NavToolbarMobile,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
}
</script>
