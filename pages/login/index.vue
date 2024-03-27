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
            <universal-captcha v-model="captchaCode" />
            <UIExtensionSlot name="login_form_extra" />
            <div v-if="!$store.state.policies.disable_registration">
              Don't have an account?
              <NuxtLink to="/register"> Sign up here </NuxtLink>
            </div>
            <div v-if="askForEmailVerify">
              Didn't receive the verification email?
              <NuxtLink to="/login/email"> Re-send it here</NuxtLink>
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
import OnionTextField from "@/components/OnionTextField"
import UIExtensionSlot from "@/components/UIExtensionSlot.vue"
import UniversalCaptcha from "@/components/UniversalCaptcha.vue"
export default {
  auth: "guest",
  components: {
    OnionTextField,
    UIExtensionSlot,
    UniversalCaptcha,
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
      askForEmailVerify: false,
    }
  },
  methods: {
    login() {
      this.askForEmailVerify = false
      this.usernameErrors = []
      this.passwordErrors = []
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
              const status = err.response.data.detail.status
              const detail = err.response.data.detail
              if (status === 404) {
                this.usernameErrors = ["That user does not exist"]
              } else if (status === 401) {
                this.passwordErrors = ["Invalid password"]
              } else if (status === 403)
                this.usernameErrors = ["Failed captcha"]
              else if (detail) {
                this.usernameErrors = [detail]
                if (detail === "Email is not verified") {
                  this.askForEmailVerify = true
                }
              }
            }
          })
      }
    },
  },
}
</script>
