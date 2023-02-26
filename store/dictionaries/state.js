import mergeWith from "lodash.mergewith"
import extendsModules from "~/.nuxt/extends.modules"

function customizer(objValue, srcValue) {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue)
  }
}

const dictionaries = Object.values(extendsModules).reduce((acc, current) => {
  let connectedDict = acc

  if (current.dictionaries) {
    connectedDict = mergeWith(
      {},
      connectedDict,
      current.dictionaries,
      customizer
    )
  }
  return connectedDict
}, [])

export default () => dictionaries
