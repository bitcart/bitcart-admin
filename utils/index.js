export default {
  copyToClipboard(text) {
    const el = document.createElement("textarea")
    el.addEventListener("focusin", (e) => e.stopPropagation())
    el.value = text
    el.setAttribute("readonly", "")
    el.style.position = "absolute"
    el.style.left = "-9999px"
    document.body.appendChild(el)
    el.select()
    document.execCommand("copy")
    document.body.removeChild(el)
  },
  redirectTo(url, newTab = false) {
    if (url) {
      if (newTab) window.open(url, "_blank")
      else window.location = url
    }
  },
  truncate(str, length = 22) {
    if (str === null) str = ""
    if (str.length > length) return str.slice(0, length) + "..."
    else return str
  },
  maybeEnableDarkTheme() {
    const hours = new Date().getHours()
    const isDayTime = hours > 6 && hours < 20
    if (!isDayTime) {
      this.$vuetify.theme.dark = true
    }
  },
  isEmpty(obj) {
    return Object.entries(obj).length === 0 && obj.constructor === Object
  },
  rules: {
    required: (value) =>
      (typeof value !== "undefined" && !!value) || "Required.",
    min: (v) =>
      (typeof v !== "undefined" && v.length >= 8) || "Min 8 characters",
    email: (value) => {
      const pattern =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return (
        typeof value === "undefined" ||
        value === "" ||
        value == null ||
        pattern.test(value) ||
        "Invalid e-mail."
      )
    },
    int: (v) => isFinite(v) || "Integer required",
    url: (value) => {
      if (typeof value === "undefined" || value === "" || value == null) {
        return true
      }
      try {
        new URL(value) // eslint-disable-line no-new
        return true
      } catch (_) {
        return "Invalid URL"
      }
    },
    positive: (v) => v > 0 || "Must be positive",
  },
}
