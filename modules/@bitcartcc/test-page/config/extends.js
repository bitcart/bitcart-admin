const NewCard = () =>
  import("@TestPage/components/NewCard").then((m) => m.default || m)

export default {
  extendComponents: {
    INFO_CARD: [
      {
        component: NewCard,
        props: {},
      },
    ],
  },
}
