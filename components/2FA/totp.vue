<template>
  <div>
    <v-form ref="form" @submit.prevent="login">
      <h2 class="d-flex justify-center">TOTP Authentication</h2>
      <div>
        <v-text-field
          id="tfa_code"
          v-model="tfa_code"
          type="text"
          name="tfa_code"
          inputmode="numeric"
          pattern="[0-9]*"
          autocomplete="one-time-code"
          :rules="[rules.required]"
          :label="enterRecovery ? 'Recovery code' : 'Authenticator code'"
          :error-messages="errors"
        />
      </div>
      <UIExtensionSlot name="tfa_form_extra" :code="code" />
      <div v-if="!enterRecovery">
        Don't have access to your authenticator device? You can
        <a @click="enterRecovery = true">log in with a recovery code.</a>
      </div>
      <div v-else>
        <a @click="enterRecovery = false">Enter 2FA code instead</a>
      </div>
      <v-card-actions class="justify-center">
        <v-btn type="submit" color="primary" :loading="loading"> Login</v-btn>
      </v-card-actions>
    </v-form>
  </div>
</template>

<script>
import UIExtensionSlot from "@/components/UIExtensionSlot.vue"

export default {
  components: {
    UIExtensionSlot,
  },
  props: {
    code: {
      type: String,
      required: true,
    },
    resetQuery: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      tfa_code: "",
      enterRecovery: false,
      rules: this.$utils.rules,
      errors: [],
      loading: false,
    }
  },
  methods: {
    login() {
      if (this.$refs.form.validate()) {
        this.errors = []
        this.loading = true
        this.$axios
          .post(`/token/2fa/totp`, {
            token: this.code,
            code: this.tfa_code,
          })
          .then((r) => {
            this.loading = false
            this.resetQuery()
            this.$auth.setUserToken(r.data.access_token)
            this.$auth.fetchUser().then((r) => {
              this.$store.dispatch("fetchServices")
            })
          })
          .catch((e) => {
            this.loading = false
            if (e.response.data.detail === "Invalid code") {
              this.errors = ["Invalid code"]
            }
          })
      }
    },
  },
}
</script>
