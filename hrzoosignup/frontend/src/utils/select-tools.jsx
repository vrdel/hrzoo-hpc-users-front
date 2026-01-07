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

export function extractYesNoValue(obj) {
  if (obj && obj.value) {
    switch (obj.value) {
      case 'Da':
        return 'yes'
      case 'Yes':
        return obj.value.lower()
      case 'Ne':
        return 'no'
      case 'No':
        return obj.value.lower()
    }
  }
  else
    return ''
}
