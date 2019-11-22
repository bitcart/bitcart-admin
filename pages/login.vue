<template>
  <v-row
    align="center"
    justify="center"
  >
    <v-col
      cols="12"
      sm="8"
      md="4"
    >
      <v-card class="elevation-12">
        <v-toolbar
          color="primary"
          dark
          flat
        >
          <v-spacer />
          <v-toolbar-title>Sign in</v-toolbar-title>
          <div class="flex-grow-1" />
        </v-toolbar>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="username"
              label="Login"
              name="login"
              prepend-icon="person"
              type="text"
            />

            <v-text-field
              id="password"
              v-model="password"
              label="Password"
              name="password"
              prepend-icon="lock"
              type="password"
            />
            <div>
              Don't have an account? <NuxtLink to="/register">
                Sign up here
              </NuxtLink>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1" />
          <v-btn color="primary" @click.stop="login">
            Login
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  auth: 'guest',
  data () {
    return { rememberme: false, username: '', password: '' }
  },
  methods: {
    login () {
      const self = this
      this.$axios.post('/token', {
        username: this.username,
        password: this.password
      }).then(function (resp) {
        self.$auth.setToken('local', 'Bearer ' + resp.data.access_token)
        self.$auth.setRefreshToken('local', resp.data.refresh_token)
        self.$axios.setHeader('Authorization', 'Bearer ' + resp.data.access_token)
        self.$auth.ctx.app.$axios.setHeader('Authorization', 'Bearer ' + resp.data.access_token)
        self.$axios.get('/users/me').then((resp) => { self.$auth.setUser(resp.data); self.$router.push('/') })
      })
    }
  }
}
</script>
