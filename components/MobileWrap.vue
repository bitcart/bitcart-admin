<script>
let runtimeComponents = {}
if (process.env.NODE_ENV === "production") {
  const VListItem = require("vuetify/lib/components/VList").VListItem
  runtimeComponents = Object.assign({}, runtimeComponents, {
    VListItem,
  })
}
export default {
  components: runtimeComponents,
  props: {
    wrap: {
      type: Boolean,
      default: false,
    },
  },
  render(h) {
    return this.$vuetify.breakpoint.mobile
      ? h("v-list-item", this.$slots.default)
      : this.wrap
        ? h("div", this.$slots.default)
        : this.$slots.default
  },
}
</script>
