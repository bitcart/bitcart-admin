<template>
  <Dashboard>
    <nav-toolbar :items="items" />
  </Dashboard>
</template>
<script>
import Dashboard from "@/layouts/dashboard"
import NavToolbar from "@/components/NavToolbar.vue"
export default {
  components: {
    Dashboard,
    NavToolbar,
  },
  data() {
    return {
      items: [
        { text: "Profile", to: "/profile" },
        { text: "API Keys", to: "/profile/access" },
      ],
    }
  },
}
</script>
