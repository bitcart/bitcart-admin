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
  // Normalize the router base to ALWAYS end with a slash. Nuxt's
  // own `getLocation` helper (in .nuxt/utils.js) does
  // `base.slice(0, -1)` on the configured base, assuming it has a
  // trailing slash. When BITCART_ADMIN_ROOTPATH is set to "/admin"
  // (no trailing slash — which is the value our deploy pins, and the
  // form Nuxt accepts everywhere else), that slice corrupts it to
  // "/admi" and the subsequent `path.startsWith(slicedBase)` matches
  // the leading "/admi" of "/admin/<x>" but slices the path by the
  // wrong length, producing strings like "n/<x>". Result: the
  // initial router resolve doesn't match any route, Nuxt sets a 404
  // on the page, and even though Vue Router subsequently navigates
  // to the correct route, the error state is sticky for nested URLs
  // (single-segment URLs happen to recover because the corrupted
  // path "/" still matches Nuxt's auto-generated home route, which
  // clears the err state — but multi-segment plugin routes like
  // `/plugins/<plugin>` never recover and the user sees a 404 page
  // even though the route is registered and the page is otherwise
  // rendering correctly server-side.
  const base = (config.ROOTPATH || "/").replace(/\/?$/, "/")
  const router = new Router({
    ...options,
    base,
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
