<template>
  <div>
    <auto-complete
      :value="$auth.user.settings.balance_currency"
      url="cryptos/fiatlist"
      label="Currency used for balance stats"
      :body="true"
      @input="updateUser('balance_currency', $event)"
    />
  </div>
</template>
<script>
import AutoComplete from "~/components/AutoComplete.vue"
export default {
  components: {
    AutoComplete,
  },
  layout: "profile",
  data() {
    return {
      policyURL: "/users/me/settings",
    }
  },
  methods: {
    updateUser(key, value) {
      this.$axios.patch(this.policyURL, { [key]: value }).then((r) => {
        this.$auth.fetchUser()
        this.$store.dispatch("syncStats", false)
      })
    },
  },
}
</script>
