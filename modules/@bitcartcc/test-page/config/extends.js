// const NewCard = () =>
// import("@TestPage/components/NewCard").then((m) => m.default || m)
import NewCard from "@TestPage/components/NewCard"

export default {
  extendComponents: {
    INFO_CARD: [
      {
        component: NewCard,
        props: {},
      },
    ],
    DASHBOARD: [
      {
        component: NewCard,
        props: {},
      },
    ],
  },
}
