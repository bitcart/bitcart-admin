(function () {
  let showingInvoice = false
  const scriptSrcRegex = /\/modal\/bitcart\.js(\?v=.*)?$/
  const supportsCurrentScript = ('currentScript' in document)
  let thisScript = ''
  if (supportsCurrentScript) {
    thisScript = document.currentScript.src
  } else {
    for (let i = 0; i < document.scripts.length; i++) {
      const script = document.scripts[i]
      if (script.src.match(scriptSrcRegex)) {
        thisScript = script.src
      }
    }
  }

  function warn () {
    if (window.console && window.console.warn) {
      window.console.warn.apply(window.console, arguments)
    }
  }

  if (window.bitcart) {
    warn('bitcart.js attempted to initialize more than once.')
    return
  }

  let iframe = document.createElement('iframe')
  iframe.name = 'bitcart'
  iframe.class = 'bitcart'
  iframe.setAttribute('allowtransparency', 'true')
  iframe.style.display = 'block'
  iframe.style.border = 0
  iframe.style.position = 'fixed'
  iframe.style.top = 0
  iframe.style.left = 0
  iframe.style.height = '100%'
  iframe.style.width = '100%'
  iframe.style.zIndex = '2000'

  let origin = ''
  const scriptMatch = thisScript.match(scriptSrcRegex)
  if (scriptMatch) {
    // Strip /modal/bitcart.js part
    origin = thisScript.substr(0, thisScript.length - scriptMatch[0].length)
  }

  let onModalWillEnterMethod = function () { }
  let onModalWillLeaveMethod = function () { }

  function showFrame () {
    if (window.document.getElementsByName('bitcart').length === 0) {
      window.document.body.appendChild(iframe)
    }
    onModalWillEnterMethod()
  }

  function hideFrame () {
    onModalWillLeaveMethod()
    showingInvoice = false
    iframe = window.document.body.removeChild(iframe)
  }

  function onModalWillEnter (customOnModalWillEnter) {
    onModalWillEnterMethod = customOnModalWillEnter
  }

  function onModalWillLeave (customOnModalWillLeave) {
    onModalWillLeaveMethod = customOnModalWillLeave
  }

  function receiveMessage (event) {
    if (!origin.startsWith(event.origin) || !showingInvoice) {
      return
    }

    if (event.data === 'close') {
      hideFrame()
    } else if (event.data === 'loaded') {
      showFrame()
    }
  }

  function showInvoice (invoiceId) {
    showingInvoice = true
    window.document.body.appendChild(iframe)
    const invoiceUrl = origin + '/i/' + invoiceId + '?modal=true'
    iframe.src = invoiceUrl
  }

  window.addEventListener('load', function load () {
    window.removeEventListener('load', load)
  })

  window.addEventListener('message', receiveMessage, false)

  window.bitcart = {
    showFrame,
    hideFrame,
    showInvoice,
    onModalWillEnter,
    onModalWillLeave
  }
})()
