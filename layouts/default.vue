<template>
  <BaseLayout>
    <template #header>
      <UIExtensionSlot name="header">
        <UIExtensionSlot name="mobile_nav">
          <v-navigation-drawer
            v-model="drawer"
            app
            disable-route-watcher
            disable-resize-watcher
            class="mb-3 hidden-md-and-up"
          >
            <NavToolbarMobile :items="availableItems" />
          </v-navigation-drawer>
        </UIExtensionSlot>
        <UIExtensionSlot name="app_bar">
          <v-app-bar fixed app>
            <v-app-bar-nav-icon
              class="mb-3 hidden-md-and-up"
              @click.stop="drawer = !drawer"
            />
            <v-spacer />
            <v-img
              max-height="60"
              max-width="60"
              contain
              :src="`${STATIC_PATH}/icon.svg`"
              :style="logoStyle"
            />
            <v-spacer />
            <onion-button v-if="onionURL" :url="onionURL" />
            <v-menu
              :nudge-bottom="10"
              offset-y
              origin="center center"
              transition="scale-transition"
              @click.native.stop
            >
              <template #activator="{ on }">
                <v-btn icon large text v-on="on">
                  <v-icon size="30px"> account_circle </v-icon>
                </v-btn>
              </template>
              <v-list class="pa-0">
                <v-list-item
                  v-for="(item, index) in availableProfileItems"
                  :key="index"
                  :to="item.href"
                  :disabled="item.disabled"
                  :target="item.target"
                  ripple="ripple"
                  rel="noopener"
                  @click="() => item.click && item.click()"
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
        </UIExtensionSlot>
      </UIExtensionSlot>
    </template>
    <template #default>
      <v-container>
        <UIExtensionSlot name="toolbar">
          <Toolbar :items="availableItems" class="mb-3 hidden-sm-and-down" />
        </UIExtensionSlot>
        <slot />
        <nuxt />
        <div v-if="$auth.loggedIn && $auth.user.is_superuser">
          <v-snackbar
            v-for="(item, index) in unsyncedInfo"
            :key="item.currency"
            :value="!hideSyncData[item.currency]"
            :timeout="-1"
            bottom
            right
            color="warning"
            origin="center center"
            :style="`bottom: ${index * 120}px`"
          >
            <v-row no-gutters>
              <v-col cols="1">
                <v-icon>warning</v-icon>
              </v-col>
              <v-col class="d-flex justify-center">
                <p>
                  {{ item.currency }} node
                  {{ !item.running ? "not running" : "unsynchronized" }}
                </p>
              </v-col>
              <v-col cols="1">
                <v-btn icon @click="$set(hideSyncData, item.currency, true)"
                  ><v-icon>close</v-icon></v-btn
                >
              </v-col>
            </v-row>
            <v-row no-gutters>
              <p class="mb-0">
                Connected to
                {{ item.spv_nodes || 0 }} nodes, current height:
                {{ item.blockchain_height || 0 }}
                <br />
                Some functions may not work properly
              </p></v-row
            >
          </v-snackbar>
        </div>
      </v-container>
    </template>
    <template #footer>
      <UIExtensionSlot name="footer">
        <v-footer fixed app>
          <span>&copy; BitcartCC v{{ VERSION }}</span>
          <v-spacer />
          <nuxt-link
            v-if="
              $auth.loggedIn &&
              $auth.user.is_superuser &&
              $store.state.updatedata.update_available
            "
            to="/manage/maintenance"
            >An update is available (to v{{
              $store.state.updatedata.tag
            }})</nuxt-link
          >
        </v-footer>
      </UIExtensionSlot>
    </template>
  </BaseLayout>
</template>

<script>
import { mapGetters } from "vuex"
import BaseLayout from "@/layouts/base"
import OnionButton from "@/components/OnionButton"
import Toolbar from "@/components/Toolbar"
import OnionIcon from "@/components/OnionIcon"
import NavToolbarMobile from "@/components/NavToolbarMobile"
import VERSION from "@/version"
import UIExtensionSlot from "~/components/UIExtensionSlot.vue"
export default {
  components: {
    OnionButton,
    BaseLayout,
    Toolbar,
    NavToolbarMobile,
    UIExtensionSlot,
  },
  data() {
    return {
      VERSION,
      toolbar: false,
      dark: true,
      drawer: false,
      hideSyncData: {},
      guestItems: [
        {
          icon: "mdi-cog",
          text: "Configurator",
          to: "/configurator",
          configurator: true,
        },
        {
          icon: "mdi-login",
          text: "Login",
          to: "/login",
        },
        {
          icon: "mdi-account-plus",
          text: "Register",
          to: "/register",
        },
      ],
      items: [
        {
          icon: "mdi-view-dashboard-outline",
          text: "Dashboard",
          to: "/",
        },
        {
          component: OnionIcon,
          text: "Tor services",
          to: "/services",
        },
        {
          icon: "mdi-cog",
          text: "Configurator",
          to: "/configurator",
        },
      ],
      profileItems: [
        {
          icon: "mdi-view-dashboard-outline",
          href: "/manage",
          title: "Server management",
          superuser: true,
          click: () => {},
        },
        {
          icon: "account_circle",
          href: "/profile",
          title: "Profile",
          click: () => {},
        },
        {
          icon: "fullscreen_exit",
          href: "#",
          title: "Logout",
          click: this.handleLogout,
        },
      ],
      guestProfileItems: [
        {
          icon: "mdi-login",
          href: "/login",
          title: "Login",
          click: () => {},
        },
        {
          icon: "mdi-account-plus",
          href: "/register",
          title: "Register",
          click: () => {},
        },
      ],
    }
  },
  computed: {
    ...mapGetters(["onionURL", "showSnow", "syncInfo"]),
    availableItems() {
      const result = this.$auth.loggedIn
        ? this.items
        : this.guestItems.filter(
            (x) =>
              !x.configurator ||
              (x.configurator &&
                this.$store.state.policies.allow_anonymous_configurator)
          )
      return [...result, ...(this.$store.state.dictionaries.nav_items || [])]
    },
    unsyncedInfo() {
      return this.syncInfo.filter((x) => !x.synchronized)
    },
    availableProfileItems() {
      const result = this.$auth.loggedIn
        ? this.profileItems.filter(
            (x) => !x.superuser || (x.superuser && this.$auth.user.is_superuser)
          )
        : this.guestProfileItems
      return [
        ...result,
        ...(this.$store.state.dictionaries.profile_items || []),
      ]
    },
    logoStyle() {
      return this.$vuetify.theme.dark ? "filter: invert(1)" : ""
    },
  },
  beforeCreate() {
    this.$utils.maybeEnableDarkTheme.call(this)
  },
  methods: {
    changeTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
    },
    handleLogout() {
      this.$auth.logout()
      this.$store.commit("services", {})
      this.$store.dispatch("fetchServices")
      this.$router.push("/login").catch((e) => {})
    },
  },
}
</script>
