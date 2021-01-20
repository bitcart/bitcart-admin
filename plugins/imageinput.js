import Vue from "vue"
let VImageInput
if (process.env.NODE_ENV === "production") {
  VImageInput = require("vuetify-image-input/a-la-carte").default
} else {
  VImageInput = require("vuetify-image-input")
}

Vue.component("VImageInput", VImageInput)
