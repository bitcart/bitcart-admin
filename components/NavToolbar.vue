<template>
  <div>
    <v-card raised class="mb-3 hidden-sm-and-down">
      <v-slide-group>
        <v-slide-item
          v-for="item in items"
          :key="item.text"
          v-slot="{ active, toggle }"
          style="min-height: 64px"
        >
          <v-btn
            class="mx-2"
            :input-value="active"
            :to="item.to"
            exact
            text
            @click="toggle"
          >
            <v-icon v-if="item.icon">{{ item.icon }}</v-icon>
            {{ item.text }}
          </v-btn>
        </v-slide-item>
      </v-slide-group>
    </v-card>
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
