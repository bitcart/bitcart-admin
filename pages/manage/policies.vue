<template>
  <div>
    <PolicySetting
      v-for="(value, policy) in policies"
      :key="policy"
      :title="titles[policy]"
      :detail="details[policy]"
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
      titles: this.$utils.getExtendSetting.call(this, "policy_descriptions", {
        disable_registration: "Disable user registration",
        require_verified_email: "Require verified email address for all users",
        discourage_index: "Discourage search engines from indexing this site",
        check_updates: "Check for updates once a day",
        staging_updates: "Install updates from staging branch directly",
        allow_anonymous_configurator:
          "Allow access to configurator for unauthorized users",
        captcha_sitekey: "HCaptcha site key",
        captcha_secretkey: "HCaptcha secret key",
        enable_captcha: "Enable captcha on login page",
        explorer_urls: "Block explorer URLs",
        rpc_urls: "WalletConnect RPC URLs",
        email_settings: "Email server settings",
      }),
      details: this.$utils.getExtendSetting.call(this, "policy_details", {
        staging_updates:
          "Note: update process will take longer than usual. Requires at least 2GB RAM on the server to re-build docker images.",
      }),
      types: this.$utils.getExtendSetting.call(this, "policy_types", {
        captcha_sitekey: "string",
        captcha_secretkey: "string",
        explorer_urls: "exploreredit",
        rpc_urls: "exploreredit",
        email_settings: "emailsettings",
      }),
      urls: this.$utils.getExtendSetting.call(this, "policy_urls", {
        explorer_urls: "/cryptos/explorer",
        rpc_urls: "/cryptos/rpc",
      }),
    }
  },
  beforeMount() {
    this.$axios
      .get("/manage/policies")
      .then((resp) => (this.policies = resp.data))
  },
}
</script>
