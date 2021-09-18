<script>
export default {
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
