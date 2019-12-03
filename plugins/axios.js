export default ({ store, $axios }) => {
  $axios.defaults.baseURL = store.state.env.URL
}
