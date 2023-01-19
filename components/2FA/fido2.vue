<template>
  <div>
    <h2 class="d-flex justify-center pb-2">FIDO2 Authentication</h2>
    <div class="pb-2">Insert your security device and proceed.</div>
    <v-alert type="info"
      >If your security device has a button, tap on it.</v-alert
    >
    <div v-if="error">
      <v-alert type="error">
        {{ error }}
      </v-alert>
      <v-btn color="primary" @click="login">Retry</v-btn>
    </div>
    <UIExtensionSlot name="fido2_form_extra" :code="code" />
  </div>
</template>

<script>
import UIExtensionSlot from "@/components/UIExtensionSlot.vue"
import {
  get,
  parseRequestOptionsFromJSON,
} from "@/utils/webauthn-json.browser-ponyfill.js"

export default {
  auth: "guest",
  components: {
    UIExtensionSlot,
  },
  props: {
    code: {
      type: String,
      required: true,
    },
    resetQuery: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      error: "",
    }
  },
  mounted() {
    this.login()
  },
  methods: {
    login() {
      this.error = ""
      if (
        window.PublicKeyCredential === undefined ||
        typeof window.PublicKeyCredential !== "function" ||
        location.protocol === "http:"
      ) {
        this.error =
          location.protocol === "http:"
            ? "FIDO2/WebAuthN requires HTTPS"
            : "Your browser does not support FIDO2/WebAuthN"
        return
      }
      this.$axios
        .post("/token/2fa/fido2/begin", {
          token: this.code,
          auth_host: window.location.hostname,
        })
        .then(async (r) => {
          const options = parseRequestOptionsFromJSON(r.data)
          let response
          try {
            response = await get(options)
          } catch (e) {
            this.error = e.message ? e.message : e
            return
          }
          try {
            await this.$axios
              .post("/token/2fa/fido2/complete", {
                token: this.code,
                auth_host: window.location.hostname,
                ...response.toJSON(),
              })
              .then((r) => {
                this.resetQuery()
                this.$auth.setUserToken(r.data.access_token)
                this.$auth.fetchUser().then((r) => {
                  this.$store.dispatch("fetchServices")
                })
              })
          } catch (e) {
            this.error = e.response.data.detail
          }
        })
    },
  },
}
</script>
