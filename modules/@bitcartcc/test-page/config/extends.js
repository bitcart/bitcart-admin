// import CheckoutAddressForm from "@TestPage/components/checkout/CheckoutAddressForm"
// import CheckoutEmailForm from "@TestPage/components/checkout/CheckoutEmailForm"
// import Header from "@TestPage/components/checkout/Header"
// import InvoiceDetails from "@TestPage/components/checkout/InvoiceDetails"
// import Main from "@TestPage/components/checkout/Main"
// import MethodsSelection from "@TestPage/components/checkout/MethodsSelection"
import Dashboard from "@TestPage/components/Dashboard"
import ExtendNav from "@TestPage/components/ExtendNav"
import NewCard from "@TestPage/components/NewCard"

export default {
  extendComponents: {
    info_card: [NewCard],
    dashboard: [Dashboard],
    // checkout_payment: [NewCard],
    server_management_nav: [ExtendNav],
    profile_nav: [ExtendNav],
    // checkout_header: [Header],
    // checkout_payment_method_selection: [MethodsSelection],
    // checkout_invoice_details: [InvoiceDetails],
    // checkout_main: [Main],
    // checkout_email_form: [CheckoutEmailForm],
    // checkout_address_form: [CheckoutAddressForm],
    // checkout_payment: [Payment],
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
