export default function RequestUsesAISelectOptions(intl) {
  const requestUsesAIToSelect = [
    {
      "label":
        intl.formatMessage({
          defaultMessage: "Da",
          description: "requestusesai-label-yes"
        }),
      "value": "Da"
    },
    {
      "label":
        intl.formatMessage({
          defaultMessage: "Ne",
          description: "requestusesai-label-no"
        }),
      "value": "Ne"
    },
  ]

  return requestUsesAIToSelect
}
