<template>
  <v-btn icon :href="url">
    <OnionIcon />
  </v-btn>
</template>

<script>
import OnionIcon from "@/components/OnionIcon.vue"
export default {
  components: {
    OnionIcon,
  },
  props: {
    url: {
      type: String,
      default: "",
    },
  },
}
</script>
