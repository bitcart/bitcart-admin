export default function ({ store, redirect }) {
  if (store.state.policies.disable_registration) {
    return redirect("/login")
  }
}
