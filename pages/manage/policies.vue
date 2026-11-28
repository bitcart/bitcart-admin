<template>
  <div>
    <PolicySetting
      v-for="(value, policy) in availablePolicies"
      :key="policy"
      :title="titles[policy]"
      :detail="details[policy]"
      :type="types[policy] || 'checkbox'"
      :what="policy"
      :items="items[policy]"
      :url="urls[policy] || ''"
      :initial-value="value"
    />
    <div v-for="plugin in plugins" :key="plugin">
      <h2 class="text-h5 mt-6">Plugin: {{ plugin }}</h2>
      <PolicySetting
        v-for="(value, setting) in pluginSettings[plugin] || {}"
        :key="`${plugin}-${setting}`"
        :title="pluginFields[plugin][setting].title"
        :detail="pluginFields[plugin][setting].description"
        :type="pluginFields[plugin][setting].type || 'checkbox'"
        :what="setting"
        :items="pluginFields[plugin][setting].items"
        :policy-url="`/plugins/settings/${plugin}`"
        :initial-value="value"
      />
    </div>
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
      plugins: [],
      pluginSettings: {},
      pluginFields: this.$utils.getExtendSetting.call(
        this,
        "plugin_fields",
        {}
      ),
      titles: this.$utils.getExtendSetting.call(this, "policy_descriptions", {
        allow_powered_by_bitcart:
          "Enable powered by Bitcart section at checkout to help support the project adoption",
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
        captcha_type: "Captcha type",
        admin_theme_url: "Admin theme css URL",
        global_templates: "Global templates",
        explorer_urls: "Block explorer URLs",
        rpc_urls: "WalletConnect RPC URLs",
        health_check_store_id: "Health check store ID",
        allow_eth_plugin_info:
          "Allow information about ETH plugin to be displayed at checkout if it's not enabled",
        log_retention_days: "Logs retention period (days)",
        email_settings: "Email server settings",
        allowed_internal_hosts: "Allowed internal hosts",
      }),
      details: this.$utils.getExtendSetting.call(this, "policy_details", {
        staging_updates:
          "Note: update process will take longer than usual. Requires at least 2GB RAM on the server to re-build docker images.",
        allowed_internal_hosts:
          "Hosts in your local network or on this server which can be used in webhooks and plugins, by name or IP, optionally with a port. For example: n8n:5678 or 192.168.1.5. Note: anyone will be able to send webhooks to them, even without an account if a store allows anonymous invoices, so better add the port too. Store email servers and lightning peers are allowed per user in the users list.",
      }),
      types: this.$utils.getExtendSetting.call(this, "policy_types", {
        captcha_sitekey: "string",
        captcha_secretkey: "string",
        admin_theme_url: "string",
        global_templates: "exploreredit",
        explorer_urls: "exploreredit",
        rpc_urls: "exploreredit",
        email_settings: "emailsettings",
        allowed_internal_hosts: "stringlist",
        captcha_type: "select",
        health_check_store_id: "string",
        log_retention_days: "number",
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
  computed: {
    availablePolicies() {
      return Object.fromEntries(
        Object.keys(this.titles)
          .filter((policy) => this.titles[policy] && policy in this.policies)
          .map((policy) => [policy, this.policies[policy]])
      )
    },
  },
  async beforeMount() {
    const policiesResp = await this.$axios.get("/manage/policies")
    this.policies = policiesResp.data
    const pluginsResp = await this.$axios.get("/plugins/settings/list")
    this.plugins = pluginsResp.data
    await Promise.all(
      this.plugins.map(async (plugin) => {
        try {
          const settingsResp = await this.$axios.get(
            `/plugins/settings/${plugin}`
          )
          this.$set(this.pluginSettings, plugin, settingsResp.data)
        } catch (e) {
          console.error(`Failed to load settings for plugin ${plugin}:`, e)
        }
      })
    )
  },
}
</script>
