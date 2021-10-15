export const state = () => ({
  stats: {
    wallets: 0,
    notifications: 0,
    templates: 0,
    stores: 0,
    discounts: 0,
    products: 0,
    invoices: 0,
    balance: 0.0,
  },
  policies: {},
  services: {},
  path: "/",
  onion: false,
  env: {},
  updatedata: {},
  apiError: null,
})

export const mutations = {
  policies(state, value) {
    state.policies = value
  },
  services(state, value) {
    state.services = value
  },
  setStats(state, value) {
    state.stats = value
  },
  onion(state, value) {
    state.onion = value
  },
  path(state, value) {
    state.path = value
  },
  env(state, value) {
    state.env = value
  },
  updatedata(state, value) {
    state.updatedata = value
  },
  apiError(state, value) {
    state.apiError = value
  },
}
export const actions = {
  async nuxtServerInit({ commit, dispatch }, { req, $axios }) {
    await dispatch("loadEnv", { env: this.$config, req })
    try {
      const { data } = await $axios.get("/manage/policies")
      const { data: services } = await $axios.get("/tor/services")
      const { data: updatedata } = await $axios.get("/update/check")
      commit("policies", data)
      commit("services", services)
      commit("updatedata", updatedata)
      commit("apiError", null) // reset error
    } catch (e) {
      commit("apiError", e)
    }
  },
  loadEnv({ commit }, { env, req }) {
    commit("env", {
      URL: env.URL,
      SOCKS_PROXY: env.SOCKS_PROXY,
    })
    if (req) {
      commit("onion", req.headers.host.toLowerCase().endsWith(".onion"))
    }
  },
  syncStats({ commit, dispatch }, alwaysRun = true) {
    this.$axios
      .get("/manage/policies")
      .then((resp) => commit("policies", resp.data))
    if (this.state.auth.loggedIn) {
      this.$axios
        .get("/users/stats")
        .then((resp) => commit("setStats", resp.data))
    }
    if (alwaysRun) {
      setTimeout(() => {
        dispatch("syncStats")
      }, 60000)
    }
  },
  fetchServices({ commit }) {
    return this.$axios
      .get("/tor/services")
      .then((r) => commit("services", r.data))
  },
  redirectA(_, { where, token, permissions, userId }) {
    return new Promise((resolve, reject) => {
      if (where) {
        let url
        if (process.server) {
          const URL = require("url").URL
          url = new URL(where)
        } else {
          url = new URL(where)
        }
        url.searchParams.set("api-key", token)
        for (const permission of permissions) {
          url.searchParams.append("permissions", permission)
        }
        url.searchParams.set("user-id", userId)
        resolve([false, url.href])
      } else {
        resolve([true, "/"])
      }
    })
  },
}

export const getters = {
  onionURL({ services, path }) {
    const service = services["BitcartCC Admin Panel"]
    return service ? service.hostname + path : ""
  },
  apiOnionURL({ services, env }) {
    const service = services["BitcartCC Merchants API"]
    return service ? service.hostname : ""
  },
  apiURL({ onion, env }, { apiOnionURL }) {
    return onion && apiOnionURL ? apiOnionURL : env.URL
  },
}
