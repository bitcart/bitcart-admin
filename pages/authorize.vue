<template>
  <v-card>
    <v-card-title class="justify-center">
      Authorization Request
    </v-card-title>
    <v-form ref="form">
      <v-container>
        <p>
          {{ appName || "An application" }} is requesting access to your account.
        </p>
        <div v-if="!token">
          <p v-if="redirect" class="mb-1">
            If authorized, the generated API key will be provided to {{ redirect }}
          </p>
          <v-row>
            <permission-set tag="v-col" :free-permissions="false" :permission-prop="permissions" :rules="[required]" :strict="strict" />
            <v-col v-for="permission in permissions" :key="permission" cols="12">
              <div v-if="(strict || $auth.user.is_superuser)">
                <v-checkbox
                  v-model="serverYes"
                  :readonly="!$auth.user.is_superuser"
                  :rules="[required]"
                  class="form-check-inline"
                >
                  <template v-slot:label>
                    <h3>
                      The app will have total control on your server.
                    </h3>
                  </template>
                </v-checkbox>
                <span v-if="!$auth.user.is_superuser" class="red--text">
                  The server management permission is being requested but your account is not an administrator
                </span>
              </div>
            </v-col>
            <v-col cols="12">
              <div v-if="permissions.includes('store_management')">
                <v-checkbox
                  v-model="storeYes"
                  :rules="[required]"
                  class="form-check-inline"
                >
                  <template v-slot:label>
                    <h3>
                      The app will be able to create, modify and delete all your stores.
                    </h3>
                  </template>
                </v-checkbox>
                <div v-if="selectiveStores">
                  <button v-if="allStores" class="green--text" @click="allStores = false">
                    Give permission to specific stores instead
                  </button>
                  <div v-else>
                    <button class="green--text" @click="allStores = true">
                      Give permission to all stores instead
                    </button>
                    <v-autocomplete
                      v-if="stores.length > 0"
                      v-model="selectedStores"
                      :items="stores"
                      item-text="name"
                      item-value="id"
                      placeholder="Select stores"
                      multiple
                    />
                    <p v-else class="red--text">
                      You currently have no stores configured.
                    </p>
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>
        <div v-else>
          <p class="red--text">
            The application has already been authorized before at {{ token.redirect_url }}, but is now requiring a different redirect url({{ redirectDomain }}). Proceed with
            <span class="title font-weight-bold">
              Caution
            </span>
          </p>
        </div>
      </v-container>
      <v-card-actions class="justify-center">
        <v-btn
          v-if="!token"
          color="primary"
          @click="createToken"
        >
          Authorize
          app
        </v-btn>
        <v-btn
          v-if="token"
          color="primary"
          @click="redirectToApp"
        >
          Authorize app(one time)
        </v-btn>
        <v-btn
          v-if="token"
          color="primary"
          @click="changeRedirect"
        >
          Change current key's redirect URL
        </v-btn>
        <v-btn
          v-if="token"
          color="primary"
          @click="createToken"
        >
          Generate a new key
        </v-btn>
        <v-btn
          color="secondary"
          value="No"
          @click="$router.push('/')"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-form>
    <v-snackbar
      v-model="showSnackbar"
      :timeout="2500"
      color="success"
      bottom
    >
      API key generated and copied to clipboard!
    </v-snackbar>
  </v-card>
</template>
<script>
import PermissionSet from '@/components/PermissionSet'
export default {
  components: {
    PermissionSet
  },
  async asyncData ({ query, $axios, store, redirect }) {
    const { data } = await $axios.get('/stores?limit=-1')
    let redirectDomain = null
    let host = ''
    let permissions = query.permissions
    if (typeof permissions === 'string') { permissions = [permissions] }
    if (query.redirect) {
      if (process.server) {
        const URL = require('url').URL
        redirectDomain = new URL(query.redirect)
      } else { redirectDomain = new URL(query.redirect) }
      const port = redirectDomain.port || (redirectDomain.protocol === 'https:' ? 443 : 80)
      host = `${redirectDomain.hostname}:${port}`
    }
    let urlparams = `?app_id=${query.app_id}`
    for (const permission of permissions || []) { urlparams += `&permissions=${permission}` }
    const { data: tokens } = await $axios.get(`/token${urlparams}&redirect_url=${host}`)
    if (tokens.result.length > 0) {
      const token = tokens.result[0]
      store.dispatch('redirectA', { where: query.redirect, token: token.id, permissions: token.permissions, userId: token.user_id }).then((url) => {
        redirect(url[1])
      })
    }
    const { data: tokens2 } = await $axios.get(`/token${urlparams}`)
    let token = null
    if (tokens2.result.length > 0) { token = tokens2.result[0] }
    return { stores: data.result, appName: query.app_name, permissions, appId: query.app_id, redirect: query.redirect, strict: JSON.parse(query.strict || true), selectiveStores: JSON.parse(query.selective_stores || false), redirectDomain: host, token }
  },
  data () {
    return {
      allStores: true,
      serverYes: this.$auth.user.is_superuser,
      storeYes: true,
      selectedStores: [],
      showSnackbar: false
    }
  },
  methods: {
    copyToClipboard (text) {
      const el = document.createElement('textarea')
      el.addEventListener('focusin', e => e.stopPropagation())
      el.value = text
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    },
    copyText (text, desc) {
      this.copyToClipboard(text)
      this.whatToCopy = desc || 'ID'
      this.showSnackbar = true
    },
    createToken () {
      if (this.$refs.form.validate()) {
        this.$axios.post('/token', { app_id: this.appId, permissions: this.permissions, redirect_url: this.redirectDomain, selective_stores: this.selectiveStores, selected_stores: this.selectedStores, strict: this.strict }).then((r) => {
          this.copyText(r.data.access_token, 'key')
          setTimeout(() => {
            this.$store.dispatch('redirectA', { where: this.redirect, token: r.data.access_token, permissions: r.data.permissions, userId: r.data.user_id }).then((url) => {
              window.location.href = url[1]
            })
          }, 2500)
        })
      }
    },
    redirectToApp () {
      this.$store.dispatch('redirectA', { where: this.redirect, token: this.token.id, permissions: this.token.permissions, userId: this.token.user_id }).then((url) => {
        window.location.href = url[1]
      })
    },
    changeRedirect () {
      this.$axios.patch(`/token/${this.token.id}`, { redirect_url: this.redirectDomain }).then((r) => {
        this.redirectToApp()
      })
    },
    required (value) {
      return !this.strict || (typeof value !== 'undefined' && !!value) || 'Required.'
    }
  }
}
</script>
