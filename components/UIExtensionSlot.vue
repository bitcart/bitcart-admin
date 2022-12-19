<script>
export default {
  inheritAttrs: false,
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
    if (this.$utils.isEmpty(this.actualProps) || !this.actualProps.map) {
      if (this.$slots.default?.length === 1) return this.$slots.default[0]
      return h("div", { style: "display:contents" }, this.$slots.default)
    }
    let defaults = { style: "display:contents" }
    if (this.component !== "div") defaults = {}
    return h(
      this.component,
      { ...defaults, ...this.$attrs },
      this.actualProps.map((props) => {
        return props.component
          ? h(
              props.component,
              { ...props.props, props: this.$attrs, on: this.$listeners },
              []
            )
          : h(props, { props: this.$attrs, on: this.$listeners }, [])
      })
    )
  },
}
</script>
