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
      !error.config.url.endsWith("/token") &&
      (error.response.status === 401 ||
        (error.response.status === 403 &&
          error.response.data.detail === "Account is disabled"))
    ) {
      $auth.logout()
    }
  })
  $auth.onRedirect((to, from) => {
    if (!process.server) return
    if (to.startsWith(decodeURI($config.ROOTPATH))) return to
    return urlJoin($config.ROOTPATH, to)
  })
}
