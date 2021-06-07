import Vue from "vue"

if (!Vue.__router_mixin__) {
  Vue.__router_mixin__ = true
  Vue.mixin({
    computed: {
      STATIC_PATH: ({ $config }) => {
        let rootPath = $config.ROOTPATH
        if (rootPath === "/") rootPath = ""
        return rootPath
      },
    },
  })
}
