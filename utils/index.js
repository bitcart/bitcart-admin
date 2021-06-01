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
}
