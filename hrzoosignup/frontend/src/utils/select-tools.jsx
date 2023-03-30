export function buildOptionsFromArray(arr) {
  return arr.map(
    (e) => ({
      "label": e,
      "value": e
    })
  )
}
