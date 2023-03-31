import { url_ui_prefix } from './general';

let researchProject = {
    "label": "Istraživački projekt",
    "value": "istrazivacki-projekt"
  }
let thesisProject = {
    "label": "Završni rad/disertacija",
    "value": "zavrsni-rad"
  }
let practicalClasses = {
    "label": "Praktična nastava",
    "value": "prakticna-nastava"
  }


export const RequestTypesToSelect = [
  researchProject,
  thesisProject,
  practicalClasses
]


export const UrlToRequestType = {
  [url_ui_prefix + '/novi-zahtjev/istrazivacki-projekt']: researchProject,
  [url_ui_prefix + '/novi-zahtjev/prakticna-nastava']: practicalClasses,
  [url_ui_prefix + '/novi-zahtjev/zavrsni-rad']: thesisProject
}
