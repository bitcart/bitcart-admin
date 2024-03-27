<template>
  <turnstile-captcha
    v-if="$store.state.policies.captcha_type === 'cloudflare_turnstile'"
    v-model="captchaCode"
    :sitekey="$store.state.policies.captcha_sitekey"
  />
  <vue-hcaptcha
    v-else-if="$store.state.policies.captcha_type === 'hcaptcha'"
    v-model="captchaCode"
    :sitekey="$store.state.policies.captcha_sitekey"
    :theme="$vuetify.theme.dark ? 'dark' : 'light'"
    @verify="processCaptcha"
  ></vue-hcaptcha>
</template>

<script>
import VueHcaptcha from "@hcaptcha/vue-hcaptcha"
import TurnstileCaptcha from "@/components/TurnstileCaptcha.vue"

export default {
  components: {
    TurnstileCaptcha,
    VueHcaptcha,
  },
  props: {
    value: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      captchaCode: this.value,
    }
  },
  watch: {
    captchaCode() {
      this.$emit("input", this.captchaCode)
    },
  },
  methods: {
    processCaptcha(token) {
      this.captchaCode = token
    },
  },
}
</script>
