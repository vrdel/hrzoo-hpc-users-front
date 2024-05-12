import { url_ui_prefix } from './general';

let researchProject = {
    "label": "Istraživački projekt",
    "value": "research-project"
  }
let thesisProject = {
    "label": "Izrada rada",
    "value": "thesis-project"
  }
let practicalClasses = {
    "label": "Praktična nastava",
    "value": "practical-class"
  }
let institutionalProject = {
    "label": "Institucijski projekt",
    "value": "institutional-project"
  }
let internalProject = {
    "label": "Interni projekt",
    "value": "internal-project"
  }
let srceWorkshop = {
    "label": "Srce radionica",
    "value": "srce-workshop"
  }


export const RequestTypesToSelect = [
  researchProject,
  institutionalProject,
  internalProject,
  thesisProject,
  practicalClasses,
  srceWorkshop
]


export function UrlToRequestType(loc) {
  let url2buttonlabel = {
    [url_ui_prefix + '/new-request/research-project']: researchProject,
    [url_ui_prefix + '/new-request/institutional-project']: institutionalProject,
    [url_ui_prefix + '/new-request/internal-project']: internalProject,
    [url_ui_prefix + '/new-request/practical-class']: practicalClasses,
    [url_ui_prefix + '/new-request/thesis-project']: thesisProject,
    [url_ui_prefix + '/new-request/srce-workshop']: srceWorkshop
  }

  if (loc.includes(url_ui_prefix + '/new-request/research-project')
    && loc.match(/[0-9]$/))
    return researchProject

  return url2buttonlabel[loc]
}
