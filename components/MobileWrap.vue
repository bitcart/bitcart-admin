<script>
export default {
  render(h) {
    return this.$vuetify.breakpoint.mobile
      ? h("v-list-item", this.$slots.default)
      : this.$slots.default
  },
}
</script>
