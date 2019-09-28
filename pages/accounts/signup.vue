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
              label="Name"
              name="name"
              prepend-icon="person"
              type="text"
            />

            <v-text-field
              id="email"
              label="Email"
              name="email"
              prepend-icon="email"
              type="email"
            />
            <v-text-field
              id="password"
              label="Password"
              name="password"
              prepend-icon="lock"
              type="password"
            />
            <v-text-field
              id="password2"
              label="Repeat Password"
              name="password2"
              prepend-icon="lock"
              type="password"
            />
            <div>
              Already have an account ? <NuxtLink to="/accounts/login">
                Sign in
              </NuxtLink> instead
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1" />
          <v-btn color="primary">
            Create account
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
