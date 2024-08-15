<template>
  <v-layout column align-center justify-center class="auth-buttons" mb-6>
    <v-btn
      v-if="providers.includes('google')"
      class="sso-auth-button"
      color="white"
      outlined
      @click="ssoAuth('google')"
    >
      <v-icon left> mdi-google </v-icon>
      Sign up with Google
    </v-btn>
    <v-btn
      v-if="providers.includes('github')"
      class="sso-auth-button"
      color="white"
      outlined
      @click="ssoAuth('github')"
    >
      <v-icon left> mdi-github </v-icon>
      Sign up with Github
    </v-btn>
  </v-layout>
</template>

<script>
export default {
  props: {
    usernameErrors: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      providers: [],
      localUsernameErrors: this.usernameErrors,
    }
  },
  beforeMount() {
    const error = this.$route.query.error
    if (error) {
      this.localUsernameErrors.push(error)
      this.$emit("update-list", this.localUsernameErrors)
    }
  },
  beforeCreate() {
    this.$axios.get("/manage/providers").then((r) => {
      this.providers = r.data
    })
  },
  methods: {
    ssoAuth(provider) {
      window.open(
        this.$axios.defaults.baseURL + "/users/login/" + provider,
        "_self"
      )
    },
  },
}
</script>
