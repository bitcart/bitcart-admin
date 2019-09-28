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
              label="Login"
              name="login"
              prepend-icon="person"
              type="text"
            />

            <v-text-field
              id="password"
              label="Password"
              name="password"
              prepend-icon="lock"
              type="password"
            />
            <v-checkbox v-model="rememberme" label="Remember me" />
            <div>
              Don't have an account? <NuxtLink to="/accounts/signup">
                Sign up here
              </NuxtLink>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1" />
          <v-btn color="primary">
            Login
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data () {
    return { rememberme: false }
  }
}
</script>
