import Vue from "vue"

const EventBus = new Vue()

export default (ctx, inject) => {
  inject("bus", EventBus)
}
