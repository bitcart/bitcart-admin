import extendsModules from "~/.nuxt/extends.modules"

const dictionaries = Object.values(extendsModules).reduce((acc, current) => {
  let connectedDict = acc

  if (current.dictionaries) {
    connectedDict = Object.assign({}, connectedDict, current.dictionaries)
  }
  return connectedDict
}, [])

export default () => dictionaries
