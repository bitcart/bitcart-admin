import Vue from "vue"
import Router from "vue-router"

import { extendRoutes, setLocalMiddlewares } from "~/.nuxt/routerHelper.modules"

Vue.use(Router)

export function createRouter(
  ssrContext,
  createDefaultRouter,
  routerOptions,
  config,
  store
) {
  const options =
    routerOptions || createDefaultRouter(ssrContext, config).options
  const router = new Router({
    ...options,
    base: config.ROOTPATH,
    routes: [...options.routes, ...extendRoutes()],
  })
  router.beforeEach((to, from, next) =>
    setLocalMiddlewares({
      to,
      from,
      next,
    })
  )
  return router
}
