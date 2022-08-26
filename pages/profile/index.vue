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
      titles: {
        balance_currency: "Currency used for balance stats",
        fetch_balance: "Fetch and display total balance in admin panel",
      },
      types: { balance_currency: "autocomplete" },
      autocomplete_urls: { balance_currency: "cryptos/fiatlist" },
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
