import cookie from "cookie"
import Cookies from "js-cookie"
import createPersistedState from "vuex-persistedstate"

export default ({ store, req, isHMR }) => {
  if (isHMR) {
    return
  }

  createPersistedState({
    paths: ["dark", "pinned"],
    storage: {
      getItem: (key) => {
        if (process.server) {
          const parsedCookies = cookie.parse(req.headers.cookie ?? "")
          return parsedCookies[key]
        } else {
          return Cookies.get(key)
        }
      },
      setItem: (key, value) =>
        Cookies.set(key, value, { expires: 365, secure: false }),
      removeItem: (key) => Cookies.remove(key),
    },
    fetchBeforeUse: true,
  })(store)
}
