import crypto from "crypto"
import path from "path"
import globby from "globby"

// Patch for webpack4 on nodejs 17+
const origCreateHash = crypto.createHash
crypto.createHash = (algorithm) =>
  origCreateHash(algorithm === "md4" ? "sha256" : algorithm)

const packages = globby
  .sync(["modules/*/package.json", "modules/*/*/package.json"])
  .map((dir) => {
    return dir.replace("modules/", "").replace("/package.json", "")
  })

const transpileDeps = [
  ...new Set(
    packages
      .map((name) => {
        const pkg = require(path.join(
          __dirname,
          "modules",
          name,
          "package.json"
        ))
        return Object.keys(pkg.dependencies || {}).concat(
          Object.keys(pkg.devDependencies || {})
        )
      })
      .flat()
  ),
]
console.log("Modules", packages)
console.log("Transpiling dependencies", transpileDeps)

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
    "@nuxtjs/device",
    "@ergonode/vuems",
    "@nuxtjs/router",
  ],
  /*
   ** Runtime config
   */
  publicRuntimeConfig: {
    URL: process.env.BITCART_ADMIN_API_URL || "http://localhost:8000",
    SOCKS_PROXY: process.env.BITCART_ADMIN_SOCKS_PROXY || "",
    ONION_API_URL: process.env.BITCART_ADMIN_ONION_API_URL || "",
    ONION_HOST: process.env.BITCART_ADMIN_ONION_HOST || "",
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
  modulesDir: ["node_modules", "modules"],
  vuems: {
    required: [],
    modules: { local: packages },
    vuex: true,
    isDev: process.env.NODE_ENV !== "production",
  },
  routerModule: {
    keepDefaultRouter: true,
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
    extend(config, ctx) {
      if (ctx.isClient) {
        config.externals = ["fs"]
      }
    },
    transpile: transpileDeps,
  },
  serverMiddleware: [
    { path: "/stores/", handler: "~/server-middleware/shopify.js" },
  ],
}
