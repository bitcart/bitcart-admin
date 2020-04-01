export const state = () => ({
  env: {},
  stats: {
    wallets: 0,
    stores: 0,
    discounts: 0,
    products: 0,
    invoices: 0,
    balance: 0.0
  },
  policies: {}
})

export const mutations = {
  setEnv (state, env) {
    state.env = env
  },
  policies (state, value) {
    state.policies = value
  },
  setStats (state, value) {
    state.stats = value
  }
}
export const actions = {
  async nuxtServerInit ({ state, commit }) {
    if (process.server) {
      commit('setEnv', {
        URL: process.env.BITCART_ADMIN_URL || 'http://localhost:8000'
      })
    }
    this.$axios.defaults.baseURL = state.env.URL
    const { data } = await this.$axios.get('/manage/policies')
    commit('policies', data)
  },
  syncStats ({ commit, dispatch }, alwaysRun = true) {
    this.$axios.get('/manage/policies').then(resp => commit('policies', resp.data))
    if (this.state.auth.loggedIn) {
      this.$axios.get('/crud/stats').then(resp => commit('setStats', resp.data))
    }
    if (alwaysRun) {
      setTimeout(() => {
        dispatch('syncStats')
      }, 60000)
    }
  },
  redirectA (_, { where, token, permissions, userId }) {
    return new Promise((resolve, reject) => {
      if (where) {
        let url
        if (process.server) {
          const URL = require('url').URL
          url = new URL(where)
        } else { url = new URL(where) }
        url.searchParams.set('api-key', token)
        for (const permission of permissions) { url.searchParams.append('permissions', permission) }
        url.searchParams.set('user-id', userId)
        resolve([false, url.href])
      } else { resolve([true, '/']) }
    })
  }
}
