<template>
  <Dashboard>
    <UIExtensionSlot name="profile_nav" :items="items">
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
      items: this.$utils.getExtendSetting.call(this, "profile_nav", [
        { text: "Profile", to: "/profile" },
        { text: "API Keys", to: "/profile/access" },
      ]),
    }
  },
}
</script>
