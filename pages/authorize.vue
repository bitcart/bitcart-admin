<template>
  <v-card>
    <v-card-title class="justify-center"> Authorization Request </v-card-title>
    <v-form ref="form">
      <v-container>
        <p>
          {{ appName || "An application" }} is requesting access to your
          account.
        </p>
        <div v-if="!token">
          <p v-if="redirect" class="mb-1">
            If authorized, the generated API key will be provided to
            {{ redirect }}
          </p>
          <v-row>
            <permission-set
              ref="permissionset"
              tag="v-col"
              :free-permissions="false"
              :permission-prop="permissions"
              :rules="[required]"
              :strict="strict"
            />
          </v-row>
        </div>
        <div v-else>
          <p class="red--text">
            The application has already been authorized before at
            {{ token.redirect_url }}, but is now requiring a different redirect
            url({{ redirectDomain }}). Proceed with
            <span class="text-h6 font-weight-bold"> Caution </span>
          </p>
        </div>

        <v-card-actions class="justify-center">
          <v-btn v-if="!token" color="primary" @click="createToken">
            Authorize app
          </v-btn>
          <v-btn v-if="token" color="primary" @click="redirectToApp">
            Authorize app(one time)
          </v-btn>
          <v-btn v-if="token" color="primary" @click="changeRedirect">
            Change current key's redirect URL
          </v-btn>
          <v-btn v-if="token" color="primary" @click="createToken">
            Generate a new key
          </v-btn>
          <v-btn color="secondary" value="No" @click="$router.push('/')">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-container>
    </v-form>
    <v-snackbar v-model="showSnackbar" :timeout="2500" color="success" bottom>
      API key generated and copied to clipboard!
    </v-snackbar>
  </v-card>
</template>
<script>
import PermissionSet from "@/components/PermissionSet"
export default {
  components: {
    PermissionSet,
  },
  async asyncData({ query, $axios, store, redirect }) {
    const { data } = await $axios.get("/stores?limit=-1")
    let redirectDomain = null
    let host = ""
    let permissions = query.permissions || []
    if (typeof permissions === "string") {
      permissions = [permissions]
    }
    if (query.redirect) {
      if (process.server) {
        const URL = require("url").URL
        redirectDomain = new URL(query.redirect)
      } else {
        redirectDomain = new URL(query.redirect)
      }
      const port =
        redirectDomain.port || (redirectDomain.protocol === "https:" ? 443 : 80)
      host = `${redirectDomain.hostname}:${port}`
    }
    let urlparams = `?app_id=${query.app_id}`
    for (const permission of permissions || []) {
      urlparams += `&permissions=${permission}`
    }
    const { data: tokens } = await $axios.get(
      `/token${urlparams}&redirect_url=${host}`
    )
    if (tokens.result.length > 0) {
      const token = tokens.result[0]
      store
        .dispatch("redirectA", {
          where: query.redirect,
          token: token.id,
          permissions: token.permissions,
          userId: token.user_id,
        })
        .then((url) => {
          redirect(url[1])
        })
    }
    const { data: tokens2 } = await $axios.get(`/token${urlparams}`)
    let token = null
    if (tokens2.result.length > 0) {
      token = tokens2.result[0]
    }
    return {
      stores: data.result,
      appName: query.app_name,
      permissions,
      appId: query.app_id,
      redirect: query.redirect,
      strict: JSON.parse(query.strict || true),
      redirectDomain: host,
      token,
    }
  },
  data() {
    return {
      showSnackbar: false,
    }
  },
  methods: {
    copyText(text, desc) {
      this.$utils.copyToClipboard(text)
      this.whatToCopy = desc || "ID"
      this.showSnackbar = true
    },
    createToken() {
      if (this.$refs.form.validate()) {
        let permissions
        if (this.token) {
          permissions = this.token.permissions
        } else {
          permissions = this.$refs.permissionset.postprocess({}).permissions
        }
        this.$axios
          .post("/token", {
            app_id: this.appId,
            permissions,
            redirect_url: this.redirectDomain,
            strict: this.strict,
          })
          .then((r) => {
            this.copyText(r.data.access_token, "key")
            setTimeout(() => {
              this.$store
                .dispatch("redirectA", {
                  where: this.redirect,
                  token: r.data.access_token,
                  permissions: r.data.permissions,
                  userId: r.data.user_id,
                })
                .then((url) => {
                  this.$utils.redirectTo(url[1])
                })
            }, 2500)
          })
      }
    },
    redirectToApp() {
      this.$store
        .dispatch("redirectA", {
          where: this.redirect,
          token: this.token.id,
          permissions: this.token.permissions,
          userId: this.token.user_id,
        })
        .then((url) => {
          this.$utils.redirectTo(url[1])
        })
    },
    changeRedirect() {
      this.$axios
        .patch(`/token/${this.token.id}`, { redirect_url: this.redirectDomain })
        .then((r) => {
          this.redirectToApp()
        })
    },
    required(value) {
      return (
        !this.strict || (typeof value !== "undefined" && !!value) || "Required."
      )
    },
  },
}
</script>
