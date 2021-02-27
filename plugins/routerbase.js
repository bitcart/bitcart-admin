import Vue from "vue"

Vue.mixin({
  computed: {
    STATIC_PATH: ({ $config }) => {
      let rootPath = $config.ROOTPATH
      if (rootPath === "/") rootPath = ""
      return rootPath
    },
  },
})
