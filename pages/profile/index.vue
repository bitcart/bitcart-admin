<template>
  <div>
    <PolicySetting
      v-for="(value, policy) in $auth.user.settings"
      :key="policy"
      :title="titles[policy]"
      :type="types[policy] || 'checkbox'"
      :what="policy"
      :initial-value="value"
      :url="autocomplete_urls[policy] || ''"
      policy-url="/users/me/settings"
      @updated="updateUser"
    />
  </div>
</template>
<script>
import PolicySetting from "~/components/PolicySetting.vue"
export default {
  components: {
    PolicySetting,
  },
  layout: "profile",
  data() {
    return {
      policyURL: "/users/me/settings",
      titles: Object.assign(
        {},
        {
          balance_currency: "Currency used for balance stats",
          fetch_balance: "Fetch and display total balance in admin panel",
        },
        this.$store.state.dictionaries.user_policy_descriptions || {}
      ),
      types: Object.assign(
        {},
        { balance_currency: "autocomplete" },
        this.$store.state.dictionaries.user_policy_types || {}
      ),
      autocomplete_urls: Object.assign(
        {},
        { balance_currency: "cryptos/fiatlist" },
        this.$store.state.dictionaries.user_policy_autocomplete_urls || {}
      ),
    }
  },
  methods: {
    updateUser() {
      this.$auth
        .fetchUser()
        .then((r) => this.$store.dispatch("syncStats", false))
    },
  },
}
</script>
