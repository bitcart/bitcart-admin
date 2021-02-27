function urlJoin() {
  return [].slice
    .call(arguments)
    .join("/")
    .replace(/\/+/g, "/")
    .replace(":/", "://")
}

export default ({ $axios, $auth, $config }) => {
  $axios.onError((error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      !error.config.url.endsWith("/token")
    ) {
      $auth.logout()
    }
  })
  $auth.onRedirect((to, from) => {
    if (!process.server) return
    if (to.startsWith(decodeURI($config.app.basePath))) return to
    return urlJoin($config.app.basePath, to)
  })
}
