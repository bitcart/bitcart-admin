<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-img max-height="60" contain src="/icon.png" />
      <v-icon @click.stop="changeTheme">
        mdi-moon-waning-crescent
      </v-icon>
    </v-app-bar>
    <v-content>
      <v-container>
        <slot />
        <nuxt />
      </v-container>
    </v-content>
    <v-footer
      fixed
      app
    >
      <span>&copy; Bitcart 2018-2019</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      toolbar: false,
      dark: true,
      drawer: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
        {
          icon: 'mdi-login',
          title: 'Login',
          to: '/accounts/login'
        },
        {
          icon: 'mdi-account-plus',
          title: 'Signup',
          to: '/accounts/signup'
        }
      ]
    }
  },
  beforeCreate () {
    const hours = new Date().getHours()
    const isDayTime = hours > 6 && hours < 20
    if (!isDayTime) { this.$vuetify.theme.dark = true }
  },
  methods: {
    changeTheme () {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
    }
  }
}
</script>
