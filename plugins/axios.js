export default ({ store, $axios }) => {
  $axios.defaults.baseURL = store.state.onion && store.getters.apiOnionURL ? store.getters.apiOnionURL : store.$env.URL
}
