import Vue from "vue"

if (process.browser) {
  const VueHtml2pdf = require("vue-html2pdf").default
  Vue.component("VueHtml2pdf", VueHtml2pdf)
}
