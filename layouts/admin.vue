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
      drawer: true,
      items: [
        { text: "User management", to: "/manage" },
        { text: "Server logs", to: "/manage/logs" },
        { text: "Maintenance commands", to: "/manage/maintenance" },
        { text: "Backups", to: "/manage/backups" },
        { text: "Policies", to: "/manage/policies" },
        { text: "Store Policies", to: "/manage/stores" },
        { text: "Daemons management", to: "/manage/daemons" },
      ],
    }
  },
}
</script>
