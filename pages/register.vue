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
          <v-form ref="form">
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
            <v-text-field
              id="password"
              v-model="password"
              :rules="[rules.required, rules.min]"
              label="Password"
              name="password"
              prepend-icon="lock"
              type="password"
            />
            <v-text-field
              id="password2"
              v-model="repeat_password"
              :rules="[rules.required,rules.min,rules.match]"
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
          <v-btn @click.stop="register" color="primary">
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
      email: '',
      password: '',
      repeat_password: '',
      errors: [],
      rules: {
        required: value => (typeof value !== 'undefined' && !!value) || 'Required.',
        min: v => (typeof v !== 'undefined' && v.length >= 8) || 'Min 8 characters',
        email: (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return (typeof value === 'undefined' || value === '' || value == null || pattern.test(value)) || 'Invalid e-mail.'
        },
        match: v => this.password === this.repeat_password || 'Passwords must match'
      }
    }
  },
  auth: 'guest',
  methods: {
    register () {
      if (this.$refs.form.validate()) {
        this.$axios.post('users', {
          email: this.email,
          password: this.password
        }).then((r) => {
          this.$axios.post('/token', {
            email: this.email,
            password: this.password
          }).then((resp) => {
            this.$auth.setToken('local', 'Bearer ' + resp.data.access_token)
            this.$auth.setRefreshToken('local', resp.data.refresh_token)
            this.$axios.setHeader('Authorization', 'Bearer ' + resp.data.access_token)
            this.$auth.ctx.app.$axios.setHeader('Authorization', 'Bearer ' + resp.data.access_token)
            this.$axios.get('/users/me').then((resp) => { this.$auth.setUser(resp.data); this.$router.push('/') })
          })
        }).catch((err) => {
          if (err.response) {
            if (err.response.data.detail.includes('users_email')) {
              this.errors = ['That username is already taken']
            }
          }
        })
      }
    }
  }
}
</script>
