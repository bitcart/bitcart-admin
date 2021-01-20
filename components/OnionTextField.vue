<template>
  <div v-if="onionURL">
    <v-text-field
      :value="onionURL"
      readonly
      disabled
      filled
      dense
      class="pt-6"
      style="font-size: 0.8em"
    >
      <template #prepend-inner>
        <onion-button :url="onionURL" />
      </template>
    </v-text-field>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import OnionButton from "@/components/OnionButton"
export default {
  components: {
    OnionButton,
  },
  props: {
    url: {
      type: String,
      default: "",
    },
  },
  computed: {
    ...mapGetters(["onionURL"]),
  },
}
</script>
