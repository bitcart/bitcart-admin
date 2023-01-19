<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="4">
      <v-form ref="form" @submit.prevent="login">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-spacer />
            <v-toolbar-title>Sign in</v-toolbar-title>
            <div class="flex-grow-1" />
          </v-toolbar>
          <v-card-text>
            <v-text-field
              v-model="email"
              :rules="[rules.required, rules.email]"
              :error-messages="usernameErrors"
              label="Login"
              name="login"
              prepend-icon="person"
              type="text"
            />

            <v-text-field
              id="password"
              v-model="password"
              :rules="[rules.required, rules.min]"
              :error-messages="passwordErrors"
              label="Password"
              name="password"
              prepend-icon="lock"
              type="password"
            />
            <vue-hcaptcha
              v-if="$store.state.policies.enable_captcha"
              :sitekey="$store.state.policies.captcha_sitekey"
              :theme="$vuetify.theme.dark ? 'dark' : 'light'"
              @verify="processCaptcha"
            ></vue-hcaptcha>
            <UIExtensionSlot name="login_form_extra" />
            <div v-if="!$store.state.policies.disable_registration">
              Don't have an account?
              <NuxtLink to="/register"> Sign up here </NuxtLink>
            </div>
            <NuxtLink to="/forgotpassword">Forgot password?</NuxtLink>
          </v-card-text>
          <v-card-actions>
            <div class="flex-grow-1" />
            <v-btn type="submit" color="primary"> Login </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
      <onion-text-field />
    </v-col>
  </v-row>
</template>

<script>
import VueHcaptcha from "@hcaptcha/vue-hcaptcha"
import OnionTextField from "@/components/OnionTextField"
import UIExtensionSlot from "@/components/UIExtensionSlot.vue"
export default {
  auth: "guest",
  components: {
    OnionTextField,
    VueHcaptcha,
    UIExtensionSlot,
  },
  data() {
    return {
      rememberme: false,
      email: "",
      password: "",
      rules: this.$utils.rules,
      usernameErrors: [],
      passwordErrors: [],
      captchaCode: "",
    }
  },
  methods: {
    processCaptcha(token, ekey) {
      this.captchaCode = token
    },
    login() {
      if (this.$refs.form.validate()) {
        this.$axios
          .post("/token", {
            email: this.email,
            password: this.password,
            permissions: ["full_control"],
            captcha_code: this.captchaCode,
            strict: false,
          })
          .then((r) => {
            if (r.data.tfa_required) {
              this.$router.push(
                `/login/2fa?code=${r.data.tfa_code}&tfa_types=${r.data.tfa_types}`
              )
              return
            }
            this.$auth.setUserToken(r.data.access_token)
            this.$auth.fetchUser().then((r) => {
              this.$store.dispatch("fetchServices")
            })
          })
          .catch((err) => {
            if (err.response) {
              this.usernameErrors = []
              this.passwordErrors = []
              const status = err.response.data.detail.status
              if (status === 404) {
                this.usernameErrors = ["That user does not exist"]
              } else if (status === 401) {
                this.passwordErrors = ["Invalid password"]
              } else if (status === 403)
                this.usernameErrors = ["Failed captcha"]
            }
          })
      }
    },
  },
}
</script>
