<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="4">
      <v-form ref="form" @submit.prevent="verifyEmail">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-spacer />
            <v-toolbar-title>{{
              codeInput ? "Verify" : "Send verification email"
            }}</v-toolbar-title>
            <div class="flex-grow-1" />
          </v-toolbar>
          <v-card-text class="pb-0">
            <verify-code v-if="codeInput && !verifiedEmail" v-model="code" />
            <div v-else-if="!codeInput">
              <div v-if="!code">
                <p class="text-subtitle-1">
                  Enter your email address to receive email verification link:
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
                <universal-captcha v-model="captchaCode" />
              </div>
              <v-progress-circular v-else-if="codeLoading" indeterminate />

              <UIExtensionSlot name="verifyemail_form_extra" :code="code" />
            </div>
            <div v-if="detail">
              <h2
                v-if="code"
                :class="{ 'red--text': error, 'green--text': !error }"
              >
                {{ detail }}
              </h2>
              <p v-else :class="{ 'red--text': error, 'green--text': !error }">
                {{ detail }}
              </p>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-container>
              <v-row class="justify-center">
                <v-btn
                  v-if="!fromQuery && !verifiedEmail"
                  type="submit"
                  color="primary"
                  :loading="reqLoading"
                >
                  {{ codeInput ? "Verify" : "Send email verification link" }}
                </v-btn>
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
  auth: false,
  components: {
    OnionTextField,
    UIExtensionSlot,
    UniversalCaptcha,
    VerifyCode,
  },
  asyncData({ route }) {
    return {
      code: route.query.code,
      fromQuery: typeof route.query.code !== "undefined",
    }
  },
  data() {
    return {
      email: "",
      rules: this.$utils.rules,
      errors: [],
      captchaCode: "",
      reqLoading: false,
      codeLoading: this.code !== "",
      detail: "",
      error: false,
      codeInput: false,
      code: "",
      verifiedEmail: false,
    }
  },
  mounted() {
    if (this.code) {
      this.$axios
        .post(`/users/verify/finalize/${this.code}`, {})
        .then((r) => {
          this.detail = "Email successfully verified"
          this.codeLoading = false
        })
        .catch((r) => {
          this.detail = r.response.data.detail
          this.error = true
          this.codeLoading = false
        })
    }
  },
  methods: {
    verifyEmail() {
      if (this.codeInput) {
        this.sendCode()
        return
      }
      if (this.$refs.form.validate()) {
        this.detail = ""
        this.error = false
        this.reqLoading = true
        const setsuccess = () => {
          this.reqLoading = false
          this.codeInput = true
        }
        this.$axios
          .post("/users/verify", {
            email: this.email,
            captcha_code: this.captchaCode,
          })
          .then((r) => {
            setsuccess()
          })
          .catch((e) => {
            this.reqLoading = false
            this.error = true
            const detail = e.response?.data?.detail
            this.errors = detail ? [detail] : []
          })
      }
    },
    sendCode() {
      if (this.$refs.form.validate()) {
        this.error = false
        this.$axios
          .post(`users/verify/finalize/${this.code}`)
          .then((r) => {
            this.detail = "Email successfully verified"
            this.codeLoading = false
            this.verifiedEmail = true
          })
          .catch((err) => {
            if (err.response) {
              this.detail = err.response.data.detail
              this.error = true
            }
          })
      }
    },
  },
}
</script>
