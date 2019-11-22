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
          <v-toolbar-title>Sign up</v-toolbar-title>
          <div class="flex-grow-1" />
        </v-toolbar>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="username"
              label="Name"
              name="name"
              prepend-icon="person"
              type="text"
            />

            <v-text-field
              id="email"
              v-model="email"
              label="Email"
              name="email"
              prepend-icon="email"
              type="email"
            />
            <v-text-field
              id="password"
              v-model="password"
              label="Password"
              name="password"
              prepend-icon="lock"
              type="password"
            />
            <v-text-field
              id="password2"
              v-model="repeat_password"
              label="Repeat Password"
              name="password2"
              prepend-icon="lock"
              type="password"
            />
            <div>
              Already have an account ? <NuxtLink to="/login">
                Sign in
              </NuxtLink> instead
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1" />
          <v-btn color="primary" @click.stop="register">
            Create account
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data () {
    return {
      username: '',
      email: '',
      password: '',
      repeat_password: ''
    }
  },
  auth: 'guest',
  methods: {
    async register () {
      await this.$axios.post('users', {
        username: this.username,
        email: this.email,
        password: this.password
      })
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
