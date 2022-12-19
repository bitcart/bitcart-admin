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
            <vue-hcaptcha
              v-if="$store.state.policies.enable_captcha"
              :sitekey="$store.state.policies.captcha_sitekey"
              :theme="$vuetify.theme.dark ? 'dark' : 'light'"
              @verify="processCaptcha"
            ></vue-hcaptcha>
            <UIExtensionSlot name="register_form_extra" />
            <div>
              Already have an account ?
              <NuxtLink to="/login"> Sign in </NuxtLink> instead
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
import VueHcaptcha from "@hcaptcha/vue-hcaptcha"
import OnionTextField from "@/components/OnionTextField"
import UIExtensionSlot from "@/components/UIExtensionSlot.vue"
export default {
  components: {
    OnionTextField,
    VueHcaptcha,
    UIExtensionSlot,
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
    }
  },
  auth: "guest",
  methods: {
    processCaptcha(token, ekey) {
      this.captchaCode = token
    },
    register() {
      if (this.$refs.form.validate()) {
        this.$axios
          .post("users", {
            email: this.email,
            password: this.password,
            captcha_code: this.captchaCode,
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
              }
            }
          })
      }
    },
  },
}
</script>
