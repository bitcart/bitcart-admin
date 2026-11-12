<template>
  <div>
    <div class="pill-nav mb-5 hidden-sm-and-down">
      <v-btn
        v-for="item in items"
        :key="item.text"
        :to="item.to"
        exact
        text
        small
        height="36"
      >
        <v-icon v-if="item.icon" left small>{{ item.icon }}</v-icon>
        {{ item.text }}
      </v-btn>
    </div>
    <v-card flat outlined class="mb-4 hidden-md-and-up">
      <NavToolbarMobile :items="items" />
    </v-card>
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
