const Page = () => import("@TestPage/pages/mypage").then((m) => m.default || m)

export default [
  {
    name: "test-page",
    path: "/testpage",
    component: Page,
  },
]
