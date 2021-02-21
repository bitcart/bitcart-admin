export default function ({ store, redirect }) {
  if (
    !store.state.auth.user &&
    !store.state.policies.allow_anonymous_configurator
  ) {
    return redirect("/login")
  }
}
