<template>
  <turnstile-captcha
    v-if="$store.state.policies.captcha_type === 'cloudflare_turnstile'"
    ref="captcha"
    v-model="captchaCode"
    :sitekey="$store.state.policies.captcha_sitekey"
    :action="action"
  />
  <vue-hcaptcha
    v-else-if="$store.state.policies.captcha_type === 'hcaptcha'"
    ref="captcha"
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
    action: {
      type: String,
      required: true,
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
    reset() {
      this.captchaCode = ""
      if (this.$refs.captcha) this.$refs.captcha.reset()
    },
  },
}
</script>
