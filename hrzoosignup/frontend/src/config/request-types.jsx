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


export const RequestTypesToSelect = [
  researchProject,
  institutionalProject,
  thesisProject,
  practicalClasses
]


export function UrlToRequestType(loc) {
  let url2buttonlabel = {
    [url_ui_prefix + '/novi-zahtjev/istrazivacki-projekt']: researchProject,
    [url_ui_prefix + '/novi-zahtjev/institucijski-projekt']: institutionalProject,
    [url_ui_prefix + '/novi-zahtjev/prakticna-nastava']: practicalClasses,
    [url_ui_prefix + '/novi-zahtjev/izrada-rada']: thesisProject
  }

  if (loc.includes(url_ui_prefix + '/novi-zahtjev/istrazivacki-projekt')
    && loc.match(/[0-9]$/))
    return researchProject

  return url2buttonlabel[loc]
}
