function isNull(v) {
  return typeof v === "undefined" || v === "" || v == null
}

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
    required: (v) => !isNull(v) || "Required.",
    min: (v) => (!isNull(v) && v.length >= 8) || "Min 8 characters",
    email: (v) => {
      const pattern =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return isNull(v) || pattern.test(v) || "Invalid e-mail."
    },
    int: (v) => isFinite(v) || "Integer required",
    url: (v) => {
      if (isNull(v)) {
        return true
      }
      try {
        new URL(v) // eslint-disable-line no-new
        return true
      } catch (_) {
        return "Invalid URL"
      }
    },
    positive: (v) => isNull(v) || v > 0 || "Must be positive",
  },
  downloadFile(resp) {
    const url = window.URL.createObjectURL(new Blob([resp.data]))
    const link = document.createElement("a")
    link.href = url
    const contentDisposition = resp.headers["content-disposition"]
    let filename = "unknown"
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename=(.+)/)
      if (fileNameMatch.length === 2) {
        filename = fileNameMatch[1]
      }
    }
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },
}
