<template>
  <Dashboard>
    <nav-toolbar :items="items" />
    <UIExtensionSlot name="profile_nav" />
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
      items: [
        { text: "Profile", to: "/profile" },
        { text: "API Keys", to: "/profile/access" },
        ...(this.$store.state.dictionaries.profile_nav || []),
      ],
    }
  },
}
</script>
