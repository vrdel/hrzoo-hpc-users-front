export function elemInArray(elem, array) {
  let pos = array.indexOf(elem)
  if (pos !== -1)
    return true
  else
    return false
}
