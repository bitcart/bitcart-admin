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
      <v-form ref="form" @submit.prevent="login">
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
            <v-text-field
              v-model="email"
              :rules="[rules.required, rules.email]"
              :error-messages="usernameErrors"
              label="Login"
              name="login"
              prepend-icon="person"
              type="text"
            />

            <v-text-field
              id="password"
              v-model="password"
              :rules="[rules.required, rules.min]"
              :error-messages="passwordErrors"
              label="Password"
              name="password"
              prepend-icon="lock"
              type="password"
            />
            <div v-if="!$store.state.policies.disable_registration">
              Don't have an account? <NuxtLink to="/register">
                Sign up here
              </NuxtLink>
            </div>
          </v-card-text>
          <v-card-actions>
            <div class="flex-grow-1" />
            <v-btn type="submit" color="primary">
              Login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-col>
  </v-row>
</template>

<script>
export default {
  auth: 'guest',
  data () {
    return {
      rememberme: false,
      email: '',
      password: '',
      rules: {
        required: value => (typeof value !== 'undefined' && !!value) || 'Required.',
        min: v => (typeof v !== 'undefined' && v.length >= 8) || 'Min 8 characters',
        email: (value) => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return (typeof value === 'undefined' || value === '' || value == null || pattern.test(value)) || 'Invalid e-mail.'
        }
      },
      usernameErrors: [],
      passwordErrors: []
    }
  },
  methods: {
    login () {
      if (this.$refs.form.validate()) {
        this.$axios.post('/token', {
          email: this.email,
          password: this.password,
          permissions: ['full_control'],
          strict: false
        }).then((resp) => {
          this.$auth.setToken('local', 'Bearer ' + resp.data.access_token)
          this.$axios.setHeader('Authorization', 'Bearer ' + resp.data.access_token)
          this.$axios.get('/users/me').then((resp) => { this.$auth.setUser(resp.data); this.$router.push('/') })
        }).catch((err) => {
          if (err.response) {
            this.usernameErrors = []
            this.passwordErrors = []
            const status = err.response.data.detail.status
            if (status === 404) { this.usernameErrors = ['That user does not exist'] } else if (status === 401) { this.passwordErrors = ['Invalid password'] }
          }
        })
      }
    }
  }
}
</script>
