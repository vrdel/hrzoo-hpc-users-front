export function buildOptionsFromArray(arr) {
  if (arr && arr.length > 0)
    return arr.map(
      (e) => ({
        "label": e,
        "value": e
      })
    )
  else
    return []
}
