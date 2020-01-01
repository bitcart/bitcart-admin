export const state = () => ({
  env: {},
  balance: 0.0,
  counts: {
    wallets: 0,
    stores: 0,
    discounts: 0,
    products: 0,
    invoices: 0
  }
})

export const mutations = {
  setEnv (state, env) {
    state.env = env
  },
  balance (state, balance) {
    state.balance = balance
  },
  setCount (state, { name, value }) {
    state.counts[name] = value
  }
}
export const actions = {
  nuxtServerInit ({ commit }) {
    if (process.server) {
      commit('setEnv', {
        URL: process.env.BITCART_ADMIN_URL || 'http://localhost:8000',
        TOKEN: process.env.BITCART_ADMIN_TOKEN
      })
    }
  },
  syncStats ({ commit, dispatch }, alwaysRun = true) {
    if (this.state.auth.loggedIn) {
      this.$axios.get('/wallets/balance').then(resp => commit('balance', resp.data))
      this.$axios.get('/wallets/count').then(resp => commit('setCount', { name: 'wallets', value: resp.data }))
      this.$axios.get('/stores/count').then(resp => commit('setCount', { name: 'stores', value: resp.data }))
      this.$axios.get('/discounts/count').then(resp => commit('setCount', { name: 'discounts', value: resp.data }))
      this.$axios.get('/products/count').then(resp => commit('setCount', { name: 'products', value: resp.data }))
      this.$axios.get('/invoices/count').then(resp => commit('setCount', { name: 'invoices', value: resp.data }))
    }
    if (alwaysRun) {
      setTimeout(() => {
        dispatch('syncStats')
      }, 60000)
    }
  }
}
