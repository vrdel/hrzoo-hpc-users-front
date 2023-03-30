let prefix = "/ui"
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
  [prefix + '/novi-zahtjev/istrazivacki-projekt']: researchProject,
  [prefix + '/novi-zahtjev/prakticna-nastava']: practicalClasses,
  [prefix + '/novi-zahtjev/zavrsni-rad']: thesisProject
}
