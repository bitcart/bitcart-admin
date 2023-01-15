<script>
export default {
  props: {
    slots: {
      type: Array,
      required: true,
    },
  },
  render(h) {
    return h("div", this.slots)
  },
}
</script>
