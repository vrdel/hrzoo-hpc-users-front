import { url_ui_prefix } from './general';

let researchProject = {
    "label": "Istraživački projekt",
    "value": "istrazivacki-projekt"
  }
let thesisProject = {
    "label": "Izrada rada",
    "value": "izrada-rada"
  }
let practicalClasses = {
    "label": "Praktična nastava",
    "value": "prakticna-nastava"
  }
let institutionalProject = {
    "label": "Institucijski projekt",
    "value": "institucijski-projekt"
  }
let internalProject = {
    "label": "Interni projekt",
    "value": "interni-projekt"
  }
let srceWorkshop = {
    "label": "Srce radionica",
    "value": "srce-radionica"
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
    [url_ui_prefix + '/novi-zahtjev/istrazivacki-projekt']: researchProject,
    [url_ui_prefix + '/novi-zahtjev/institucijski-projekt']: institutionalProject,
    [url_ui_prefix + '/novi-zahtjev/interni-projekt']: internalProject,
    [url_ui_prefix + '/novi-zahtjev/prakticna-nastava']: practicalClasses,
    [url_ui_prefix + '/novi-zahtjev/izrada-rada']: thesisProject,
    [url_ui_prefix + '/novi-zahtjev/srce-radionica']: srceWorkshop
  }

  if (loc.includes(url_ui_prefix + '/novi-zahtjev/istrazivacki-projekt')
    && loc.match(/[0-9]$/))
    return researchProject

  return url2buttonlabel[loc]
}
