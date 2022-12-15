<template>
  <Dashboard>
    <UIExtensionSlot name="server_management_nav" :items="items">
      <nav-toolbar :items="items" />
    </UIExtensionSlot>
  </Dashboard>
</template>
<script>
import Dashboard from "@/layouts/dashboard"
import NavToolbar from "@/components/NavToolbar.vue"
import UIExtensionSlot from "@/components/UIExtensionSlot.vue"
export default {
  components: {
    Dashboard,
    NavToolbar,
    UIExtensionSlot,
  },
  data() {
    return {
      drawer: true,
      items: this.$utils.getExtendSetting.call(this, "server_management_nav", [
        { text: "User management", to: "/manage" },
        { text: "Server logs", to: "/manage/logs" },
        { text: "Maintenance commands", to: "/manage/maintenance" },
        { text: "Backups", to: "/manage/backups" },
        { text: "Policies", to: "/manage/policies" },
        { text: "Store Policies", to: "/manage/stores" },
        { text: "Daemons management", to: "/manage/daemons" },
      ]),
    }
  },
}
</script>
