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
    <v-form ref="changePasswordForm" @submit.prevent="sendChangePassword">
      <h1>Change password</h1>
      <v-text-field
        v-model="old_password"
        label="Old password"
        :rules="[rules.required, rules.min]"
        type="password"
      />
      <v-text-field
        v-model="new_password"
        label="New password"
        :rules="[rules.required, rules.min]"
        type="password"
      />
      <v-text-field
        v-model="new_password2"
        label="Confirm new password"
        :rules="[rules.required, rules.min, rules.match]"
        type="password"
      />
      <v-switch v-model="logoutAll" label="Logout all devices?" />
      <p
        v-if="changePassword.detail"
        :class="{
          'red--text': changePassword.error,
          'green--text': !changePassword.error,
        }"
      >
        {{ changePassword.detail }}
      </p>
      <v-btn
        color="primary"
        class="mb-3"
        type="submit"
        :loading="changePassword.loading"
        >Change password</v-btn
      >
    </v-form>
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
import PolicySetting from "~/components/PolicySetting.vue"

export default {
  components: {
    PolicySetting,
  },
  layout: "profile",
  data() {
    return {
      policyURL: "/users/me/settings",
      loading: false,
      detail: "",
      old_password: "",
      new_password: "",
      new_password2: "",
      logoutAll: false,
      changePassword: {
        loading: false,
        error: false,
        detail: "",
      },
      rules: {
        ...this.$utils.rules,
        match: (v) =>
          this.new_password === this.new_password2 || "Passwords must match",
      },
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
        })
        .then((r) => {
          this.loading = false
          this.detail = "Verification email sent"
        })
    },
    sendChangePassword() {
      if (this.$refs.changePasswordForm.validate()) {
        this.changePassword.loading = true
        this.changePassword.detail = ""
        this.changePassword.error = false
        this.$axios
          .post("/users/password", {
            old_password: this.old_password,
            password: this.new_password,
            logout_all: this.logoutAll,
          })
          .then((r) => {
            this.changePassword.loading = false
            this.changePassword.detail = "Successfully changed password"
            this.changePassword.error = false
          })
          .catch((e) => {
            this.changePassword.loading = false
            this.changePassword.detail = e.response.data.detail
            this.changePassword.error = true
          })
      }
    },
  },
}
</script>
