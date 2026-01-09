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
        return true
      case 'Yes':
        return true
      case 'Ne':
        return false
      case 'No':
        return false
    }
  }
  else
    return false
}

export function buildYesNoValue(flag, locale) {
  switch (flag) {
    case true:
      if (locale === 'hr')
        return {
          'label': 'Da',
          'value': 'Da'
        }
      else
        return {
          'label': 'Yes',
          'value': 'Yes'
        }
    case false:
      if (locale === 'hr')
        return {
          'label': 'Ne',
          'value': 'Ne'
        }
      else
        return {
          'label': 'No',
          'value': 'No'
        }
  }
}
