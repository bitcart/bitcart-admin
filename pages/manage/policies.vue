<template>
  <div>
    <PolicySetting
      v-for="(value, policy) in policies"
      :key="policy"
      :title="titles[policy]"
      :type="types[policy] || 'checkbox'"
      :what="policy"
      :url="urls[policy] || ''"
      :initial-value="value"
    />
  </div>
</template>
<script>
import PolicySetting from "@/components/PolicySetting.vue"
export default {
  components: {
    PolicySetting,
  },
  layout: "admin",
  middleware: "superuserOnly",
  data() {
    return {
      policies: {},
      titles: {
        disable_registration: "Disable user registration",
        discourage_index: "Discourage search engines from indexing this site",
        check_updates: "Check for updates once a day",
        allow_anonymous_configurator:
          "Allow access to configurator for unauthorized users",
        explorer_urls: "Block explorer URLs",
        rpc_urls: "WalletConnect RPC URLs",
      },
      types: { explorer_urls: "exploreredit", rpc_urls: "exploreredit" },
      urls: {
        explorer_urls: "/cryptos/explorer",
        rpc_urls: "/cryptos/rpc",
      },
    }
  },
  beforeMount() {
    this.$axios
      .get("/manage/policies")
      .then((resp) => (this.policies = resp.data))
  },
}
</script>
