<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="4">
      <v-form ref="form" @submit.prevent="verifyEmail">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-spacer />
            <v-toolbar-title>Send verification email</v-toolbar-title>
            <div class="flex-grow-1" />
          </v-toolbar>
          <v-card-text>
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
            <div v-else>
              <h2>Email successfully verified</h2>
            </div>
            <p
              v-if="detail"
              :class="{ 'red--text': error, 'green--text': !error }"
            >
              {{ detail }}
            </p>
            <UIExtensionSlot name="verifyemail_form_extra" :code="code" />
          </v-card-text>
          <v-card-actions class="justify-center">
            <v-btn
              v-if="!code"
              type="submit"
              color="primary"
              :loading="loading"
            >
              Send email verification link</v-btn
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
import UniversalCaptcha from "@/components/UniversalCaptcha.vue"

export default {
  auth: false,
  components: {
    OnionTextField,
    UIExtensionSlot,
    UniversalCaptcha,
  },
  asyncData({ route }) {
    return { code: route.query.code }
  },
  data() {
    return {
      email: "",
      rules: this.$utils.rules,
      errors: [],
      captchaCode: "",
      loading: false,
      detail: "",
      error: false,
    }
  },
  mounted() {
    if (this.code) {
      this.$axios
        .post(`/users/verify/finalize/${this.code}`, {})
        .then((r) => {
          this.loading = false
        })
        .catch((r) => {
          this.detail = r.response.data.detail
          this.loading = false
          this.error = true
        })
    }
  },
  methods: {
    verifyEmail() {
      if (this.$refs.form.validate()) {
        this.detail = ""
        this.error = false
        this.loading = true
        const setsuccess = () => {
          this.loading = false
          this.detail = "Verification email successfully sent"
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
            this.loading = false
            this.error = true
            const detail = e.response?.data?.detail
            this.errors = detail ? [detail] : []
          })
      }
    },
  },
}
</script>
