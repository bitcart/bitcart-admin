<template>
  <BaseLayout>
    <template #header>
      <UIExtensionSlot
        name="header"
        :items="availableItems"
        :profile-items="availableProfileItems"
      >
        <UIExtensionSlot name="mobile_nav" :items="availableItems">
          <v-navigation-drawer
            :value="isMobile ? drawer : true"
            app
            :permanent="!isMobile"
            :temporary="isMobile"
            :mini-variant="!isMobile && collapsed"
            mini-variant-width="80"
            width="264"
            floating
            class="bc-sidebar"
            @input="isMobile && setDrawer($event)"
          >
            <div
              class="bc-brand cursor-pointer"
              :class="{ 'bc-brand--mini': !isMobile && collapsed }"
              @click="redirectTo('/')"
            >
              <img :src="`${STATIC_PATH}/icon.svg`" alt="Bitcart" />
              <div v-if="isMobile || !collapsed" class="bc-brand__text">
                <span class="bc-brand__name">Bitcart</span>
                <span class="bc-brand__sub">Admin panel</span>
              </div>
            </div>
            <NavToolbarMobile
              :value="collapsed"
              :mini="!isMobile && collapsed"
              :collapsible="!isMobile"
              :items="availableItems"
              @input="setCollapsed($event)"
            />
          </v-navigation-drawer>
        </UIExtensionSlot>
        <UIExtensionSlot
          :profile-items="availableProfileItems"
          :onion-url="onionURL"
          name="app_bar"
        >
          <v-app-bar app flat height="68" class="bc-appbar glass">
            <v-app-bar-nav-icon
              v-if="isMobile"
              @click.stop="setDrawer(!drawer)"
            />
            <div class="bc-appbar__title">
              <div class="section-label">Bitcart</div>
              <div class="bc-appbar__page">{{ pageTitle }}</div>
            </div>
            <v-spacer />
            <onion-button v-if="onionURL" :url="onionURL" />
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  class="bc-icon-btn"
                  v-bind="attrs"
                  v-on="on"
                  @click.stop="changeTheme"
                >
                  <v-icon>{{
                    $vuetify.theme.dark
                      ? "mdi-white-balance-sunny"
                      : "mdi-moon-waning-crescent"
                  }}</v-icon>
                </v-btn>
              </template>
              <span>Toggle theme</span>
            </v-tooltip>
            <v-menu
              :nudge-bottom="10"
              offset-y
              left
              min-width="240"
              transition="slide-y-transition"
              @click.native.stop
            >
              <template #activator="{ on }">
                <v-btn text class="bc-profile-btn ml-2 px-2" v-on="on">
                  <v-avatar size="34" class="bc-avatar">
                    <span v-if="userInitial">{{ userInitial }}</span>
                    <v-icon v-else>account_circle</v-icon>
                  </v-avatar>
                  <v-icon small class="ml-1 text-muted"
                    >mdi-chevron-down</v-icon
                  >
                </v-btn>
              </template>
              <v-list>
                <div v-if="$auth.loggedIn" class="px-3 pt-2 pb-3">
                  <div class="text-body-2 font-weight-semibold text-truncate">
                    {{ $auth.user.email }}
                  </div>
                  <div class="text-caption text-muted">
                    {{ $auth.user.is_superuser ? "Administrator" : "Merchant" }}
                  </div>
                </div>
                <v-divider v-if="$auth.loggedIn" class="mb-1" />
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
                  <v-list-item-icon v-if="item.icon" class="mr-3">
                    <v-icon small>{{ item.icon }}</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-app-bar>
        </UIExtensionSlot>
      </UIExtensionSlot>
    </template>
    <template #default>
      <v-container fluid class="bc-content">
        <template v-if="$auth.loggedIn && $auth.user.is_superuser">
          <v-alert
            v-for="item in failedRateSources"
            :key="item.name"
            type="warning"
            text
            dense
            dismissible
          >
            {{ item.name }} exchange rates
            {{
              item.fetched_at
                ? `are ${formatAge(item.age)} old, the last refresh failed`
                : "are not available"
            }}: {{ item.last_error }}
          </v-alert>
        </template>
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
        <v-footer app inset absolute color="transparent" class="bc-footer">
          <span class="text-muted">&copy; Bitcart v{{ VERSION }}</span>
          <v-spacer />
          <v-chip
            v-if="
              $auth.loggedIn &&
              $auth.user.is_superuser &&
              $store.state.updatedata.update_available
            "
            small
            color="primary"
            outlined
            to="/manage/maintenance"
          >
            <v-icon left small>mdi-arrow-up-circle</v-icon>
            Update available: v{{ $store.state.updatedata.tag }}
          </v-chip>
        </v-footer>
      </UIExtensionSlot>
    </template>
  </BaseLayout>
</template>

<script>
import { mapGetters, mapActions } from "vuex"
import BaseLayout from "@/layouts/base"
import OnionButton from "@/components/OnionButton"
import OnionIcon from "@/components/OnionIcon"
import NavToolbarMobile from "@/components/NavToolbarMobile"
import VERSION from "@/version"
import UIExtensionSlot from "~/components/UIExtensionSlot.vue"
export default {
  components: {
    OnionButton,
    BaseLayout,
    NavToolbarMobile,
    UIExtensionSlot,
  },
  data() {
    return {
      VERSION,
      mounted: false,
      toolbar: false,
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
          group: "Overview",
          order: 1,
        },
        {
          icon: "mdi-cog",
          text: "Configurator",
          to: "/configurator",
          group: "Setup",
          order: 3,
        },
        {
          icon: "mdi-wallet",
          text: "Wallets",
          to: "/wallets",
          group: "Setup",
          order: 5,
        },
        {
          icon: "mdi-bell",
          text: "Notifications",
          to: "/notifications",
          group: "Setup",
          order: 6,
        },
        {
          icon: "mdi-text-box",
          text: "Templates",
          to: "/templates",
          group: "Setup",
          order: 7,
        },
        {
          icon: "mdi-store",
          text: "Stores",
          to: "/stores",
          group: "Commerce",
          order: 8,
        },
        {
          icon: "mdi-sale-outline",
          text: "Discounts",
          to: "/discounts",
          group: "Commerce",
          order: 9,
        },
        {
          icon: "mdi-tag",
          text: "Products",
          to: "/products",
          group: "Commerce",
          order: 10,
        },
        {
          icon: "receipt_long",
          text: "Invoices",
          to: "/invoices",
          group: "Commerce",
          order: 11,
        },
        {
          icon: "mdi-cash",
          text: "Payouts",
          to: "/payouts",
          group: "Commerce",
          order: 12,
        },
      ],
      superuserItems: [
        {
          icon: "mdi-puzzle",
          text: "Plugins",
          to: "/plugins",
          group: "Setup",
          order: 4,
        },
      ],
      profileItems: [
        {
          icon: "mdi-view-dashboard-outline",
          href: "/manage",
          title: "Server management",
          superuser: true,
          click: () => {},
          order: 1,
        },
        {
          icon: "account_circle",
          href: "/profile",
          title: "Profile",
          click: () => {},
          order: 2,
        },
        {
          icon: "fullscreen_exit",
          href: "#",
          title: "Logout",
          click: this.handleLogout,
          order: 99,
        },
      ],
      guestProfileItems: [
        {
          icon: "mdi-login",
          href: "/login",
          title: "Login",
          click: () => {},
          order: 1,
        },
        {
          icon: "mdi-account-plus",
          href: "/register",
          title: "Register",
          click: () => {},
          order: 2,
        },
      ],
    }
  },
  computed: {
    ...mapGetters([
      "onionURL",
      "showSnow",
      "syncInfo",
      "ratesInfo",
      "drawer",
      "pinned",
      "collapsed",
      "dark",
    ]),
    isMobile() {
      if (!this.mounted) return this.$device.isMobile
      return this.$vuetify.breakpoint.mdAndDown
    },
    userInitial() {
      const email = this.$auth.loggedIn && this.$auth.user.email
      return email ? email[0].toUpperCase() : ""
    },
    pageTitle() {
      const path = this.$route.path.replace(/\/$/, "") || "/"
      const match = this.availableItems
        .filter((x) => x.to && (path === x.to || path.startsWith(x.to + "/")))
        .sort((a, b) => b.to.length - a.to.length)[0]
      if (match && (match.to !== "/" || path === "/")) return match.text
      const segment = path.split("/").filter(Boolean)[0] || "dashboard"
      const titles = { manage: "Server management", i: "Invoice" }
      return (
        titles[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
      )
    },
    availableItems() {
      return this.$utils.getExtendSetting
        .call(
          this,
          "nav_items",
          this.$auth.loggedIn
            ? this.items
                .concat(this.$auth.user.is_superuser ? this.superuserItems : [])
                .concat(
                  !this.$utils.isEmpty(this.$store.state.services)
                    ? [
                        {
                          component: OnionIcon,
                          text: "Tor services",
                          to: "/services",
                          group: "Setup",
                          order: 2,
                        },
                      ]
                    : []
                )
            : this.guestItems.filter(
                (x) =>
                  !x.configurator ||
                  (x.configurator &&
                    this.$store.state.policies.allow_anonymous_configurator)
              )
        )
        .sort(function (a, b) {
          return a.order < b.order ? -1 : 1
        })
    },
    unsyncedInfo() {
      return this.syncInfo.filter((x) => !x.synchronized)
    },
    failedRateSources() {
      return this.ratesInfo.filter((x) => x.last_error)
    },
    availableProfileItems() {
      return this.$utils.getExtendSetting
        .call(
          this,
          "profile_items",
          this.$auth.loggedIn
            ? this.profileItems
                .filter(
                  (x) =>
                    !x.superuser ||
                    (x.superuser && this.$auth.user.is_superuser)
                )
                .concat(
                  this.$auth.user.is_superuser ||
                    this.$store.state.policies.allow_file_uploads
                    ? [
                        {
                          icon: "mdi-paperclip",
                          href: "/files",
                          title: "Files",
                          order: 3,
                          click: () => {},
                        },
                      ]
                    : []
                )
            : this.guestProfileItems
        )
        .sort(function (a, b) {
          return a.order < b.order ? -1 : 1
        })
    },
  },
  watch: {
    $route() {
      if (this.isMobile) this.setDrawer(false)
    },
    dark(v) {
      if (v !== null) {
        this.$vuetify.theme.dark = v
      }
    },
  },
  beforeCreate() {
    this.$utils.maybeEnableDarkTheme.call(this)
  },
  beforeMount() {
    this.$bus.$on("drawerOff", () => {
      this.drawerOff()
    })
  },
  mounted() {
    this.mounted = true
  },
  beforeDestroy() {
    this.$bus.$off("drawerOff")
  },
  methods: {
    ...mapActions(["setDrawer", "setPinned", "setCollapsed", "setDark"]),
    formatAge(seconds) {
      const minutes = Math.round(seconds / 60)
      return minutes < 60 ? `${minutes} min` : `${Math.round(minutes / 60)} h`
    },
    // kept for backwards compatibility with plugins emitting "drawerOff";
    // the sidebar is permanent on desktop and click-toggled on mobile now
    drawerOn() {},
    drawerOff() {},
    changeTheme() {
      this.setDark(!this.$vuetify.theme.dark)
    },
    handleLogout() {
      this.$auth.logout()
      this.$store.commit("services", {})
      this.$store.dispatch("fetchServices")
      this.redirectTo("/login")
    },
    redirectTo(url) {
      this.$router.push(url).catch((e) => {})
    },
  },
}
</script>

<style>
.bc-sidebar.v-navigation-drawer {
  border-right: 1px solid var(--bc-border) !important;
}
.theme--dark.bc-sidebar.v-navigation-drawer {
  background: #0d1016 !important;
}
.bc-sidebar .v-navigation-drawer__content {
  display: flex;
  flex-direction: column;
}
.bc-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 68px;
  padding: 0 22px;
  flex: 0 0 auto;
}
.bc-brand--mini {
  justify-content: center;
  padding: 0;
}
.bc-brand img {
  width: 34px;
  height: 34px;
}
.bc-brand__text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}
.bc-brand__name {
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: -0.02em;
}
.bc-brand__sub {
  font-size: 0.72rem;
  color: var(--bc-muted);
}
.bc-sidebar .bc-nav {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}
.v-app-bar.bc-appbar {
  border-bottom: 1px solid var(--bc-border) !important;
}
.bc-appbar .v-toolbar__content {
  padding: 0 24px;
}
.bc-appbar__title {
  line-height: 1.2;
}
.bc-appbar__title .section-label {
  font-size: 0.65rem;
}
.bc-appbar__page {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.015em;
}
.bc-icon-btn {
  border: 1px solid var(--bc-border);
  margin-left: 6px;
}
.bc-avatar {
  background: linear-gradient(135deg, #8f0cf4, #b98cf8);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
}
.bc-content {
  padding: 28px 28px 72px !important;
  max-width: 1600px;
}
@media (max-width: 600px) {
  .bc-content {
    padding: 16px 16px 72px !important;
  }
  .bc-appbar .v-toolbar__content {
    padding: 0 12px;
  }
}
.bc-footer {
  font-size: 0.8rem;
  padding: 12px 28px !important;
  border-top: 1px solid var(--bc-border) !important;
}
.font-weight-semibold {
  font-weight: 600 !important;
}
</style>
