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
    console.log(this.$attrs)
    if (this.$utils.isEmpty(this.actualProps)) {
      return h("div", { style: "display:contents" }, this.$slots.default)
    }
    console.log(this.$attrs)
    let defaults = { style: "display:contents" }
    if (this.component !== "div") defaults = {}
    console.log(this.component, defaults)
    return h(
      this.component,
      { ...defaults, ...this.$attrs },
      this.actualProps.map((props) => {
        return props.component
          ? h(props.component, { ...props.props, ...this.$attrs }, [])
          : h(props, { props: this.$attrs }, [])
      })
    )
  },
}
</script>
