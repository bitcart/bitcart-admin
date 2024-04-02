<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="4">
      <v-form ref="form" @submit.prevent="register">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-spacer />
            <v-toolbar-title>{{
              askForEmailVerify ? "Verify" : "Sign up"
            }}</v-toolbar-title>
            <div class="flex-grow-1" />
          </v-toolbar>
          <v-card-text class="pb-0">
            <verify-code v-if="askForEmailVerify" v-model="otpCode" />
            <div v-else>
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
              <universal-captcha v-model="captchaCode" />
              <UIExtensionSlot name="register_form_extra" />
              <div>
                Already have an account ?
                <NuxtLink to="/login"> Sign in</NuxtLink> instead
              </div>
              <div v-if="askForEmailVerify">
                Verification email sent. Didn't receive the verification email?
                <NuxtLink to="/login/email"> Re-send it here</NuxtLink>
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <div class="flex-grow-1" />
            <v-container>
              <v-row class="justify-center">
                <div v-if="!askForEmailVerify" class="flex-grow-1" />
                <v-btn type="submit" color="primary">{{
                  askForEmailVerify ? "Verify" : "Create account"
                }}</v-btn>
              </v-row>
              <v-row v-if="askForEmailVerify" class="justify-center mt-5">
                Didn't receive code?&nbsp;
                <NuxtLink to="/login/email"> Request again</NuxtLink>
              </v-row>
            </v-container>
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
import VerifyCode from "@/components/VerifyCode.vue"

export default {
  components: {
    OnionTextField,
    UIExtensionSlot,
    UniversalCaptcha,
    VerifyCode,
  },
  middleware: "registeroff",
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
      otpCode: "",
      error: false,
      detail: "",
    }
  },
  auth: "guest",
  methods: {
    register() {
      this.errors = []
      if (this.askForEmailVerify) {
        this.verifyEmail()
        return
      }
      this.askForEmailVerify = false
      if (this.$refs.form.validate()) {
        this.$axios
          .post("users", {
            email: this.email,
            password: this.password,
            captcha_code: this.captchaCode,
          })
          .then((r) => {
            if (!r.data.token) {
              this.askForEmailVerify = true
              return
            }
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
              }
            }
          })
      }
    },
    verifyEmail() {
      if (this.$refs.form.validate()) {
        this.detail = ""
        this.error = false
        this.$axios
          .post(`users/verify/finalize/${this.otpCode}?add_token=true`)
          .then((r) => {
            this.$auth.setUserToken(r.data.token)
            this.$auth.fetchUser().then((r) => {
              this.$store.dispatch("fetchServices")
            })
          })
          .catch((err) => {
            if (err.response) {
              const detail = err.response.data.detail
              if (detail) {
                this.detail = detail
                this.error = true
              }
            }
          })
      }
    },
  },
}
</script>
