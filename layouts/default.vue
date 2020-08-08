<template>
  <BaseLayout>
    <template v-slot:header>
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
        <v-spacer />
        <v-img max-height="60" max-width="65" contain src="/icon.png" />
        <v-spacer />
        <onion-button v-if="onionURL" :url="onionURL" />
        <v-menu
          :nudge-bottom="10"
          offset-y
          origin="center center"
          transition="scale-transition"
          @click.native.stop
        >
          <template v-slot:activator="{ on }">
            <v-btn icon large text v-on="on">
              <v-icon size="30px">
                account_circle
              </v-icon>
            </v-btn>
          </template>
          <v-list class="pa-0">
            <v-list-item
              v-for="(item, index) in availableItems"
              :key="index"
              :to="item.href"
              :disabled="item.disabled"
              :target="item.target"
              ripple="ripple"
              rel="noopener"
              @click="item.click"
            >
              <v-list-item-action v-if="item.icon">
                <v-icon>{{ item.icon }}</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-icon @click.stop="changeTheme">
          mdi-moon-waning-crescent
        </v-icon>
      </v-app-bar>
    </template>
    <template v-slot:default>
      <slot />
    </template>
    <template v-slot:footer>
      <v-footer
        fixed
        app
      >
        <span>&copy; BitcartCC 2018-2020</span>
      </v-footer>
    </template>
  </BaseLayout>
</template>

<script>
import { mapGetters } from 'vuex'
import BaseLayout from '@/layouts/base'
import OnionButton from '@/components/OnionButton'
export default {
  components: {
    OnionButton,
    BaseLayout
  },
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
          to: '/login'
        },
        {
          icon: 'mdi-account-plus',
          title: 'Register',
          to: '/register'
        }
      ],
      profileItems: [
        {
          icon: 'mdi-view-dashboard-outline',
          href: '/manage',
          title: 'Server management',
          superuser: true,
          click: () => {}
        },
        {
          icon: 'account_circle',
          href: '/profile',
          title: 'Profile',
          click: () => {}
        },
        {
          icon: 'settings',
          href: '/settings',
          title: 'Settings',
          click: () => {}
        },
        {
          icon: 'fullscreen_exit',
          href: '#',
          title: 'Logout',
          click: this.handleLogout
        }
      ],
      guestItems: [
        {
          icon: 'mdi-login',
          href: '/login',
          title: 'Login',
          click: () => {}
        },
        {
          icon: 'mdi-account-plus',
          href: '/register',
          title: 'Register',
          click: () => {}
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['onionURL']),
    availableItems () {
      return this.$auth.loggedIn ? this.profileItems.filter(x => !x.superuser || (x.superuser && this.$auth.user.is_superuser)) : this.guestItems
    }
  },
  methods: {
    changeTheme () {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
    },
    handleLogout () {
      this.$auth.logout()
      this.$store.commit('services', {})
      this.$store.dispatch('fetchServices')
      this.$router.push('/login')
    }
  }
}
</script>
