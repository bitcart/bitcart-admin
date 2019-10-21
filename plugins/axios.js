import axios from 'axios'

export default ({ store }, inject) => {
  const instance = axios.create({ baseURL: store.state.env.URL })
  instance.defaults.headers.common.Authorization = 'Token ' + store.state.env.TOKEN
  inject('axios', instance)
}
