<script>
export default {
  props: {
    component: {
      type: String,
      default: "div",
    },
    name: {
      type: String,
      default: "",
    },
    props: {
      type: [Array, Object],
      default: () => [],
    },
  },
  computed: {
    actualProps() {
      let props = this.props
      if (this.$utils.isEmpty(props)) props = []
      let extendedProps = this.$getExtendSlot(this.name)
      if (this.$utils.isEmpty(extendedProps)) extendedProps = []
      return props.length > 0 ? props : extendedProps
    },
  },
  render(h) {
    if (this.$utils.isEmpty(this.actualProps)) {
      return h("div", { style: "display:contents" }, this.$slots.default)
    }
    return h(
      this.component,
      this.$attrs,
      this.actualProps.map((props) => {
        return props.component
          ? h(props.component, props.props, [])
          : h(props, {}, [])
      })
    )
  },
}
</script>
