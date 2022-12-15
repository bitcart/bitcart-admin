<template>
  <nav-toolbar :items="items" />
</template>
<script>
import NavToolbar from "@/components/NavToolbar.vue"
export default {
  components: {
    NavToolbar,
  },
  data() {
    return {
      drawer: true,
      items: [{ text: "test management", to: "/testpage" }],
    }
  },
}
</script>
