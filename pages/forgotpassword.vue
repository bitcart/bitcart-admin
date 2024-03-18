<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="4">
      <v-form ref="form" @submit.prevent="resetpassword">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-spacer />
            <v-toolbar-title>Reset your password</v-toolbar-title>
            <div class="flex-grow-1" />
          </v-toolbar>
          <v-card-text>
            <div v-if="!code">
              <p class="text-subtitle-1">
                Enter your email address to receive a password reset link:
              </p>
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
              <turnstile-captcha
                v-if="$store.state.policies.enable_captcha"
                v-model="captchaCode"
                :sitekey="$store.state.policies.captcha_sitekey"
              />
            </div>
            <div v-else>
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
              <v-switch v-model="logoutAll" label="Logout all devices?" />
            </div>
            <p
              v-if="detail"
              :class="{ 'red--text': error, 'green--text': !error }"
            >
              {{ detail }}
            </p>
            <UIExtensionSlot name="forgetpassword_form_extra" :code="code" />
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn
              v-if="!code"
              type="submit"
              color="primary"
              :loading="loading"
            >
              Send password reset email</v-btn
            >
            <v-btn v-else type="submit" color="primary" :loading="loading">
              Reset password</v-btn
            >
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
  auth: "guest",
  components: {
    OnionTextField,
    UIExtensionSlot,
    TurnstileCaptcha,
  },
  asyncData({ store, req, route }) {
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
    return { url, code: route.query.code }
  },
  data() {
    return {
      email: "",
      rules: {
        ...this.$utils.rules,
        match: (v) =>
          this.password === this.repeat_password || "Passwords must match",
      },
      errors: [],
      captchaCode: "",
      loading: false,
      detail: "",
      password: "",
      repeat_password: "",
      logoutAll: true,
      error: false,
    }
  },
  methods: {
    resetpassword() {
      if (this.$refs.form.validate()) {
        this.detail = ""
        this.error = false
        this.loading = true
        const setsuccess = () => {
          this.loading = false
          this.detail = this.code
            ? "Password reset successfully"
            : "Password reset email sent"
        }
        if (this.code) {
          this.$axios
            .post(`/users/reset_password/finalize/${this.code}`, {
              password: this.password,
              logout_all: this.logoutAll,
            })
            .then((r) => {
              setsuccess()
            })
            .catch((r) => {
              this.detail = r.response.data.detail
              this.loading = false
              this.error = true
            })
          return
        }
        const finalURL = new URL(this.$route.path, this.url).href
        this.$axios
          .post("/users/reset_password", {
            email: this.email,
            captcha_code: this.captchaCode,
            next_url: finalURL,
          })
          .then((r) => {
            setsuccess()
          })
          .catch(() => setsuccess())
      }
    },
  },
}
</script>
