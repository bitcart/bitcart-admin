
export default ({ $auth, $axios, store, redirect }) => {
  $axios.defaults.baseURL = store.state.env.URL
  $axios.interceptors.response.use((response) => {
    return response
  },
  function (error) {
    const originalRequest = error.config
    if (error.response.status === 401 && originalRequest.url.endsWith('/refresh_token')) {
      $auth.logout()
      redirect('/')
      return new Promise((resolve, reject) => {
        reject(error)
      })
    }
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      return $axios.post('/refresh_token',
        {
          'token': $auth.getRefreshToken('local')
        })
        .then((res) => {
          if (res.status === 200) {
            $auth.setToken('local', 'Bearer ' + res.data.access_token)
            $auth.setRefreshToken('local', res.data.refresh_token)
            $axios.setHeader('Authorization', 'Bearer ' + res.data.access_token)
            $auth.ctx.app.$axios.setHeader('Authorization', 'Bearer ' + res.data.access_token)
            error.response.config.headers.Authorization = `Bearer ${res.data.access_token}`
            return $axios(originalRequest)
          }
        })
    }
    return Promise.reject(error)
  })
}
