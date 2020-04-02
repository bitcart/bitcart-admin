export default ({ store, $axios }) => {
  $axios.defaults.baseURL = store.$env.URL
}
