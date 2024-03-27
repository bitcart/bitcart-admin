<template>
  <div>
    <PolicySetting
      v-for="(value, policy) in policies"
      :key="policy"
      :title="titles[policy]"
      :detail="details[policy]"
      :type="types[policy] || 'checkbox'"
      :what="policy"
      :items="items[policy]"
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
        allow_file_uploads: "Allow file uploads for non-superusers",
        discourage_index: "Discourage search engines from indexing this site",
        check_updates: "Check for updates once a day",
        staging_updates: "Install updates from staging branch directly",
        allow_anonymous_configurator:
          "Allow access to configurator for unauthorized users",
        captcha_sitekey: "Captcha site key",
        captcha_secretkey: "Captcha secret key",
        admin_theme_url: "Admin theme css URL",
        captcha_type: "Captcha type",
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
        admin_theme_url: "string",
        explorer_urls: "exploreredit",
        rpc_urls: "exploreredit",
        email_settings: "emailsettings",
        captcha_type: "select",
      }),
      urls: this.$utils.getExtendSetting.call(this, "policy_urls", {
        explorer_urls: "/cryptos/explorer",
        rpc_urls: "/cryptos/rpc",
      }),
      items: this.$utils.getExtendSetting.call(this, "policy_items", {
        captcha_type: ["none", "hcaptcha", "cloudflare_turnstile"],
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
