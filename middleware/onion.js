export default function ({ req, res, store, route }) {
  store.commit('path', route.path)
  if (process.server) {
    if (!req.headers.host.toLowerCase().endsWith('.onion') && store.getters.onionURL) {
      res.setHeader('Onion-Location', store.getters.onionURL)
    } else {
      store.commit('onion', true)
    }
  }
}
