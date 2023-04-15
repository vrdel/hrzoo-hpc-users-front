export function elemInArray(elem, array) {
  console.log('VRDEL DEBUG', elem)
  let pos = array.indexOf(elem)
  if (pos !== -1)
    return true
  else
    return false
}
