<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="4">
      <v-form ref="form" @submit.prevent="login">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-spacer />
            <v-toolbar-title>Two-factor authentication</v-toolbar-title>
            <div class="flex-grow-1" />
          </v-toolbar>
          <v-card-text>
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
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn type="submit" color="primary" :loading="loading">
              Login</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-form>
      <onion-text-field />
    </v-col>
  </v-row>
</template>

<script>
import OnionTextField from "@/components/OnionTextField"
import UIExtensionSlot from "@/components/UIExtensionSlot.vue"

export default {
  auth: "guest",
  components: {
    OnionTextField,
    UIExtensionSlot,
  },
  asyncData({ route }) {
    const code = route.query.code
    return { code }
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
            delete this.$route.query.code
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
