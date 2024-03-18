<template>
  <div id="turnstile-box" ref="turnstile"></div>
</template>

<script>
const turnstileLoadFunction = "cfTurnstileOnLoad"

let turnstileState =
  typeof window !== "undefined" && window.turnstile !== undefined
    ? "ready"
    : "unloaded"

let turnstileLoad = {
  resolve: (value) => {},
  reject: (value) => {},
}

export default {
  name: "TurnstileCaptcha",
  props: {
    sitekey: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      resetTimeout: undefined,
      widgetId: undefined,
    }
  },
  computed: {
    turnstileOptions() {
      return {
        sitekey: this.sitekey,
        theme: this.$vuetify.theme.dark ? "dark" : "light",
        callback: this.callback,
        "error-callback": this.errorCallback,
        "unsupported-callback": this.unsupportedCallback,
      }
    },
  },
  async mounted() {
    const turnstileLoadPromise = new Promise((resolve, reject) => {
      turnstileLoad = { resolve, reject }
      if (turnstileState === "ready") resolve(undefined)
    })
    window[turnstileLoadFunction] = () => {
      turnstileLoad.resolve()
      turnstileState = "ready"
    }
    const ensureTurnstile = () => {
      if (turnstileState === "unloaded") {
        turnstileState = "loading"
        const url = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=${turnstileLoadFunction}`
        const script = document.createElement("script")
        script.src = url
        script.async = true
        script.addEventListener("error", () => {
          turnstileLoad.reject("Failed to load Turnstile.")
        })
        document.head.appendChild(script)
      }
      return turnstileLoadPromise
    }
    await ensureTurnstile()
    this.render()
  },
  beforeUnmount() {
    this.remove()
    clearTimeout(this.resetTimeout)
  },
  methods: {
    unsupportedCallback() {
      this.$emit("unsupported")
    },
    errorCallback(code) {
      this.$emit("error", code)
    },
    callback(token) {
      this.$emit("input", token)
      this.startResetTimeout()
    },
    reset() {
      if (window.turnstile) {
        this.$emit("input", "")
        window.turnstile.reset()
      }
    },
    remove() {
      if (this.widgetId) {
        window.turnstile.remove(this.widgetId)
        this.widgetId = undefined
      }
    },
    render() {
      this.widgetId = window.turnstile.render(
        this.$refs.turnstile,
        this.turnstileOptions
      )
    },
    startResetTimeout() {
      this.resetTimeout = setTimeout(() => {
        this.reset()
      }, 295 * 1000)
    },
  },
}
</script>
