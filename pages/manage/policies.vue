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
      titles: Object.assign(
        {},
        {
          disable_registration: "Disable user registration",
          discourage_index: "Discourage search engines from indexing this site",
          check_updates: "Check for updates once a day",
          allow_anonymous_configurator:
            "Allow access to configurator for unauthorized users",
          captcha_sitekey: "HCaptcha site key",
          captcha_secretkey: "HCaptcha secret key",
          enable_captcha: "Enable captcha on login page",
          explorer_urls: "Block explorer URLs",
          rpc_urls: "WalletConnect RPC URLs",
        },
        this.$store.state.dictionaries.policy_descriptions || {}
      ),
      types: Object.assign(
        {},
        {
          captcha_sitekey: "string",
          captcha_secretkey: "string",
          explorer_urls: "exploreredit",
          rpc_urls: "exploreredit",
        },
        this.$store.state.dictionaries.policy_types || {}
      ),
      urls: Object.assign(
        {},
        {
          explorer_urls: "/cryptos/explorer",
          rpc_urls: "/cryptos/rpc",
        },
        this.$store.state.dictionaries.policy_urls || {}
      ),
    }
  },
  beforeMount() {
    this.$axios
      .get("/manage/policies")
      .then((resp) => (this.policies = resp.data))
  },
}
</script>
