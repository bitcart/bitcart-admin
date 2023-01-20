<template>
  <div>
    <div>
      Email:
      <span v-if="!$auth.user.is_verified" class="error--text"
        >(Unverified)</span
      >
    </div>
    <v-text-field disabled filled dense :value="$auth.user.email" />
    <p v-if="detail" class="green--text">
      {{ detail }}
    </p>
    <v-btn
      v-if="!$auth.user.is_verified"
      color="primary"
      class="mb-3"
      :loading="loading"
      @click="resendVerificationEmail"
      >Re-send verification email</v-btn
    >
    <div>2FA status: {{ $auth.user.tfa_enabled ? "Enabled" : "Disabled" }}</div>
    <v-btn
      v-if="!$auth.user.tfa_enabled"
      color="primary"
      to="/profile/2fa/setup"
      class="my-2"
    >
      Setup 2FA
    </v-btn>
    <v-btn v-else color="error" class="my-2" @click="disable2FA">
      Disable 2FA
    </v-btn>
    <v-btn to="/profile/2fa/fido2" color="primary">FIDO2 Devices</v-btn>
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
  </div>
</template>
<script>
import isHTTPS from "is-https"
import PolicySetting from "~/components/PolicySetting.vue"

export default {
  components: {
    PolicySetting,
  },
  layout: "profile",
  asyncData({ req }) {
    let url = ""
    if (req) {
      url = req.headers.host
      if (isHTTPS(req)) {
        url = "https://" + url
      } else {
        url = "http://" + url
      }
    } else {
      url = window.location.origin
    }
    return { url }
  },
  data() {
    return {
      policyURL: "/users/me/settings",
      loading: false,
      detail: "",
      titles: this.$utils.getExtendSetting.call(
        this,
        "user_policy_descriptions",
        {
          balance_currency: "Currency used for balance stats",
          fetch_balance: "Fetch and display total balance in admin panel",
        }
      ),
      types: this.$utils.getExtendSetting.call(this, "user_policy_types", {
        balance_currency: "autocomplete",
      }),
      autocomplete_urls: this.$utils.getExtendSetting.call(
        this,
        "user_policy_autocomplete_urls",
        { balance_currency: "cryptos/fiatlist" }
      ),
    }
  },
  methods: {
    updateUser() {
      this.$auth
        .fetchUser()
        .then((r) => this.$store.dispatch("syncStats", false))
    },
    disable2FA() {
      this.$axios.post("/users/2fa/disable").then((r) => {
        this.$auth.fetchUser()
      })
    },
    resendVerificationEmail() {
      this.loading = true
      this.detail = ""
      this.$axios
        .post("/users/verify", {
          email: this.$auth.user.email,
          next_url: new URL("login/email", this.url).href,
        })
        .then((r) => {
          this.loading = false
          this.detail = "Verification email sent"
        })
    },
  },
}
</script>
