import Vue from "vue"
import utils from "@/utils"

const plugin = {
  install(Vue, options) {
    Vue.prototype.$utils = utils
  },
}

Vue.use(plugin)
