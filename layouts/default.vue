<template>
  <BaseLayout>
    <template v-slot:header>
      <v-dialog v-model="showDialog" width="600px">
        <v-card>
          <v-card-title>Merry Christmas and a Happy New Year!</v-card-title>
          <v-card-text
            >You have found the easter egg! Congratulations!
            <br />
            Merry Christmas and a Happy New Year! We wish you to spend these
            holidays with pleasure, and we want that, in 2021, we all have a
            better time. All the best in the coming year!
            <br />
            We, the BitcartCC team, will continue improving BitcartCC by
            listening to your feedback and ideas!
            <br />
            We always love hearing new opinions from you, so, if you have
            something to say, let us know in our telegram group!
            <br />
            Have a good day!
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-card-subtitle>Your BitcartCC Team</v-card-subtitle>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-navigation-drawer
        v-model="drawer"
        app
        disable-route-watcher
        disable-resize-watcher
      >
        <v-list>
          <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :to="item.to"
            router
            exact
            @click="processItem(item)"
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
      <v-app-bar fixed app>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
        <v-spacer />
        <v-img max-height="60" max-width="60" contain src="/icon.svg" />
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
              <v-icon size="30px"> account_circle </v-icon>
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
        <v-icon @click.stop="changeTheme"> mdi-moon-waning-crescent </v-icon>
      </v-app-bar>
    </template>
    <template v-slot:default>
      <v-container>
        <slot />
        <nuxt />
        <div v-if="showSnow">
          <div class="snow layer3 a"></div>
          <div class="snow layer3"></div>
        </div>
      </v-container>
    </template>
    <template v-slot:footer>
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
    </template>
  </BaseLayout>
</template>

<script>
import { mapGetters } from "vuex"
import BaseLayout from "@/layouts/base"
import OnionButton from "@/components/OnionButton"
import VERSION from "@/version"
export default {
  components: {
    OnionButton,
    BaseLayout,
  },
  data() {
    return {
      VERSION,
      showSnow: false,
      toolbar: false,
      dark: true,
      showDialog: false,
      drawer: false,
      items: [
        {
          icon: "mdi-apps",
          title: "Welcome",
          to: "/",
        },
        {
          icon: "mdi-login",
          title: "Login",
          to: "/login",
        },
        {
          icon: "mdi-account-plus",
          title: "Register",
          to: "/register",
        },
        {
          icon: "mdi-snowflake",
          title: "Happy New Year!",
          to: null,
          easteregg: true,
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
      guestItems: [
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
    ...mapGetters(["onionURL"]),
    availableItems() {
      return this.$auth.loggedIn
        ? this.profileItems.filter(
            (x) => !x.superuser || (x.superuser && this.$auth.user.is_superuser)
          )
        : this.guestItems
    },
  },
  beforeCreate() {
    const hours = new Date().getHours()
    const isDayTime = hours > 6 && hours < 20
    if (!isDayTime) {
      this.$vuetify.theme.dark = true
    }
  },
  methods: {
    changeTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
    },
    handleLogout() {
      this.$auth.logout()
      this.$store.commit("services", {})
      this.$store.dispatch("fetchServices")
      this.$router.push("/login")
    },
    processItem(item) {
      if (item.easteregg) {
        this.showSnow = true
        this.showDialog = true
      }
    },
  },
}
</script>

<style lang="scss" scoped>
$s1: "";
$s2: "";
$s3: "";
@for $i from 1 through 400 {
  $s1: $s1 +
    random(1000) *
    0.1vw +
    " " +
    random(1000) *
    0.1vh +
    " " +
    0 +
    " " +
    random(50) *
    -0.01rem +
    #fff;
  $s2: $s2 +
    random(1000) *
    0.1vw +
    " " +
    random(1000) *
    0.1vh +
    " " +
    0 +
    " " +
    random(50) *
    -0.01rem +
    #fff;
  $s3: $s3 +
    random(1000) *
    0.1vw +
    " " +
    random(1000) *
    0.1vh +
    " " +
    0 +
    " " +
    random(50) *
    -0.01rem +
    #fff;
  @if $i < 400 {
    $s1: $s1 + ",";
    $s2: $s2 + ",";
    $s3: $s3 + ",";
  }
}
.snow {
  border-radius: 50%;
  opacity: 0.8;
  position: absolute;
  top: -100vh;
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
.layer3 {
  width: 0.8rem;
  height: 0.8rem;
  filter: blur(4px);
  box-shadow: #{$s3};
  animation-duration: 10s;
}
.layer3.a {
  animation-delay: -5s;
}
@keyframes fall {
  100% {
    transform: translateY(200vh);
  }
}
</style>
