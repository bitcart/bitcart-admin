export default {
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: "%s - " + process.env.npm_package_name,
    title: process.env.npm_package_name || "",
    meta: [
      { charset: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui",
      },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || "",
      },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "favicon.ico" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons",
      },
    ],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#fff" },
  /*
   ** Global CSS
   */
  css: ["@/assets/css/main.css"],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    "~/plugins/routerbase.js",
    "~/plugins/utils.js",
    "~/plugins/axios.js",
    "~/plugins/eventbus.js",
    { src: "~/plugins/imageinput.js", mode: "client" },
    { src: "~/plugins/datetimepicker.js", mode: "client" },
    "~/plugins/vueQR.js",
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    "@nuxtjs/eslint-module",
    "@nuxtjs/vuetify",
    "@nuxtjs/pwa",
  ],
  /*
   ** Runtime config
   */
  publicRuntimeConfig: {
    URL: process.env.BITCART_ADMIN_API_URL || "http://localhost:8000",
    SOCKS_PROXY: process.env.BITCART_ADMIN_SOCKS_PROXY,
    ROOTPATH: process.env.BITCART_ADMIN_ROOTPATH || "/",
    LOG_FILE_NAME: process.env.BITCART_ADMIN_LOG_FILE || "bitcart.log",
  },
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    "@nuxtjs/axios",
    "@nuxtjs/auth",
  ],
  /*
   ** @nuxt/telemetry settings
   */
  telemetry: false,
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    baseURL: "http://localhost:8000",
  },
  router: {
    middleware: ["onion", "auth"],
    base: process.env.BITCART_ADMIN_ROOTPATH || "/",
  },
  auth: {
    localStorage: false,
    cookie: {
      options: {
        expires: 7,
      },
    },
    strategies: {
      local: {
        endpoints: {
          login: {
            url: "/token",
            method: "post",
            propertyName: "access_token",
          },
          logout: false,
          user: { url: "/users/me", method: "get", propertyName: false },
        },
      },
    },
    plugins: ["~/plugins/auth.js"],
  },

  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: { optionsPath: "~/vuetify.options.js" },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {},
  },
}
