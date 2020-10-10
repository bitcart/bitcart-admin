export default async ({ store, $axios, $config, req }) => {
  await store.dispatch("loadEnv", { env: $config, req })
  if (process.server && store.state.onion && $config.SOCKS_PROXY) {
    const SocksProxyAgent = require("socks-proxy-agent")
    const agent = new SocksProxyAgent($config.SOCKS_PROXY)
    $axios.defaults.httpsAgent = agent
    $axios.defaults.httpAgent = agent
  }
  $axios.defaults.baseURL = store.getters.apiURL
}
