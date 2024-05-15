import { url_ui_prefix } from './general';


function labelResearchProject(intl) {
  let researchProject = {
      "label":
        intl.formatMessage({
          defaultMessage: "Istraživački projekt",
          description: "requesttype-label-research"
        }),
      "value": "research-project"
    }

  return researchProject
}


function labelThesisProject(intl) {
  let thesisProject = {
      "label":
        intl.formatMessage({
          defaultMessage: "Izrada rada",
          description: "requesttype-label-thesis"
        }),
      "value": "thesis-project"
    }

  return thesisProject
}


function labelPracticalClasses(intl) {
  let practicalClasses = {
      "label":
        intl.formatMessage({
          defaultMessage: "Praktična nastava",
          description: "requesttype-label-practicalclass"
        }),
      "value": "practical-class"
    }

  return practicalClasses
}


function labelInstitutionalProject(intl) {
  let institutionalProject = {
      "label":
        intl.formatMessage({
          defaultMessage: "Institucijski projekt",
          description: "requesttype-label-institutional"
        }),
      "value": "institutional-project"
    }

  return institutionalProject
}


function labelInternalProject(intl) {
  let internalProject = {
      "label":
        intl.formatMessage({
          defaultMessage: "Interni projekt",
          description: "requesttype-label-internal"
        }),
      "value": "internal-project"
    }

  return internalProject
}


function labelSrceWorkshop(intl) {
  let srceWorkshop = {
      "label":
        intl.formatMessage({
          defaultMessage: "Srce radionica",
          description: "requesttype-label-srceworkshop"
        }),
      "value": "srce-workshop"
    }

  return srceWorkshop
}


export function RequestTypesToSelect(intl) {
  const requestTypesToSelect = [
    labelResearchProject(intl),
    labelInstitutionalProject(intl),
    labelInternalProject(intl),
    labelThesisProject(intl),
    labelPracticalClasses(intl),
    labelSrceWorkshop(intl)
  ]

  return requestTypesToSelect
}



export function UrlToRequestType(loc, intl) {
  let url2buttonlabel = {
    [url_ui_prefix + '/new-request/research-project']: labelResearchProject(intl),
    [url_ui_prefix + '/new-request/institutional-project']: labelInstitutionalProject(intl),
    [url_ui_prefix + '/new-request/internal-project']: labelInternalProject(intl),
    [url_ui_prefix + '/new-request/practical-class']: labelPracticalClasses(intl),
    [url_ui_prefix + '/new-request/thesis-project']: labelThesisProject(intl),
    [url_ui_prefix + '/new-request/srce-workshop']: labelSrceWorkshop(intl)
  }

  if (loc.includes(url_ui_prefix + '/new-request/research-project')
    && loc.match(/[0-9]$/))
    return labelResearchProject(intl)

  return url2buttonlabel[loc]
}
