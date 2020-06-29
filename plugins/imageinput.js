const VImageInput = () => import(process.env.NODE_ENV === 'production' ? 'vuetify-image-input/a-la-carte' : 'vuetify-image-input').then(m => m.default)
const VueLib = () => import('vue').then(m => m.default)

async function start () {
  const Vue = await VueLib()
  Vue.component('VImageInput', VImageInput)
}

start()
