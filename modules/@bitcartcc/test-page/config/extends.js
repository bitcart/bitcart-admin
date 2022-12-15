import Dashboard from "@TestPage/components/Dashboard"
import ExtendNav from "@TestPage/components/ExtendNav"
import NewCard from "@TestPage/components/NewCard"

export default {
  extendComponents: {
    info_card: [NewCard],
    dashboard: [Dashboard],
    checkout_payment: [NewCard],
    server_management_nav: [ExtendNav],
    profile_nav: [ExtendNav],
    // header: [InApp],
    // footer: [InApp],
  },
  dictionaries: {
    server_management_nav: [{ text: "test management", to: "/testpage" }],
    profile_nav: [{ text: "test management", to: "/testpage" }],
    nav_items: [
      {
        icon: "mdi-flask",
        text: "Test page",
        to: "/testpage",
      },
    ],
    profile_items: [
      {
        icon: "mdi-flask",
        href: "/testpage",
        title: "Test page",
      },
    ],
    maintenance_commands: [
      {
        title: "Test command",
        details: "Test command",
        btnText: "Start test",
        what: "cleanup/images",
      },
    ],
    store_policy_descriptions: {
      test: { title: "Test", type: "string" },
    },
  },
}
