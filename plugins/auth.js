export default ({ $axios, $auth }) => {
  $axios.onError((error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.endsWith("/token")
    ) {
      $auth.logout()
    }
  })
}
