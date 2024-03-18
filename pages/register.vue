<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="4">
      <v-form ref="form" @submit.prevent="register">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-spacer />
            <v-toolbar-title>Sign up</v-toolbar-title>
            <div class="flex-grow-1" />
          </v-toolbar>
          <v-card-text>
            <v-text-field
              id="email"
              v-model="email"
              :rules="[rules.required, rules.email]"
              :error-messages="errors"
              label="Email"
              name="email"
              prepend-icon="email"
              type="email"
            />
            <v-text-field
              id="password"
              v-model="password"
              :rules="[rules.required, rules.min]"
              label="Password"
              name="password"
              prepend-icon="lock"
              type="password"
            />
            <v-text-field
              id="password2"
              v-model="repeat_password"
              :rules="[rules.required, rules.min, rules.match]"
              label="Repeat Password"
              name="password2"
              prepend-icon="lock"
              type="password"
            />
            <turnstile-captcha
              v-if="$store.state.policies.enable_captcha"
              v-model="captchaCode"
              :sitekey="$store.state.policies.captcha_sitekey"
            />
            <UIExtensionSlot name="register_form_extra" />
            <div>
              Already have an account ?
              <NuxtLink to="/login"> Sign in</NuxtLink> instead
            </div>
            <div v-if="askForEmailVerify">
              Verification email sent. Didn't receive the verification email?
              <NuxtLink to="/login/email"> Re-send it here</NuxtLink>
            </div>
          </v-card-text>
          <v-card-actions>
            <div class="flex-grow-1" />
            <v-btn type="submit" color="primary"> Create account </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
      <onion-text-field />
    </v-col>
  </v-row>
</template>
<script>
import isHTTPS from "is-https"
import OnionTextField from "@/components/OnionTextField"
import UIExtensionSlot from "@/components/UIExtensionSlot.vue"
import TurnstileCaptcha from "@/components/TurnstileCaptcha.vue"

export default {
  components: {
    OnionTextField,
    UIExtensionSlot,
    TurnstileCaptcha,
  },
  middleware: "registeroff",
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
      email: "",
      password: "",
      repeat_password: "",
      captchaCode: "",
      errors: [],
      rules: {
        ...this.$utils.rules,
        match: (v) =>
          this.password === this.repeat_password || "Passwords must match",
      },
      askForEmailVerify: false,
    }
  },
  auth: "guest",
  methods: {
    register() {
      this.askForEmailVerify = false
      this.errors = []
      if (this.$refs.form.validate()) {
        this.$axios
          .post("users", {
            email: this.email,
            password: this.password,
            captcha_code: this.captchaCode,
            verify_url: new URL("login/email", this.url).href,
          })
          .then((r) => {
            this.$auth.setUserToken(r.data.token)
            this.$auth.fetchUser().then((r) => {
              this.$store.dispatch("fetchServices")
            })
          })
          .catch((err) => {
            if (err.response) {
              const detail = err.response.data.detail
              if (
                typeof detail === "string" &&
                detail.includes("users_email")
              ) {
                this.errors = ["That username is already taken"]
              } else if (detail.status === 403) {
                this.errors = ["Failed captcha"]
              } else if (detail) {
                this.errors = [detail]
                if (detail === "Email is not verified")
                  this.askForEmailVerify = true
              }
            }
          })
      }
    },
  },
}
</script>
