import { url_ui_prefix } from './general';

export function LinkTitles(loc) {
  let url2linktitle = {
    [url_ui_prefix + '/requests']: 'Upravljanje zahtjevima',
    [url_ui_prefix + '/my-requests']: 'Moji zahtjevi',
    [url_ui_prefix + '/new-request']: 'Novi zahtjev',
    [url_ui_prefix + '/new-request/istrazivacki-projekt']: 'Novi zahtjev temeljem istraživačkog projekta',
    [url_ui_prefix + '/new-request/institucijski-projekt']: 'Novi zahtjev temeljem institucijskog projekta',
    [url_ui_prefix + '/new-request/interni-projekt']: 'Novi zahtjev temeljem internog projekta',
    [url_ui_prefix + '/new-request/prakticna-nastava']: 'Novi zahtjev temeljem praktične nastave',
    [url_ui_prefix + '/new-request/izrada-rada']: 'Novi zahtjev temeljem izrade rada',
    [url_ui_prefix + '/new-request/srce-radionica']: 'Novi zahtjev za Srce radionicu',
    [url_ui_prefix + '/public-keys']: 'Upravljanje javnim ključevima',
    [url_ui_prefix + '/public-keys/novi']: 'Dodavanje novog javnog ključa',
    [url_ui_prefix + '/my-info']: 'Status na usluzi, moji podaci u imeniku matične ustanove i sustavu CroRIS',
    [url_ui_prefix + '/memberships']: 'Popis i upravljanje članovima na odobrenim zahtjevima/projektima',
    [url_ui_prefix + '/users']: 'Popis svih korisnika na aktivnim projektima',
    [url_ui_prefix + '/users/inactive']: 'Popis svih korisnika koji nisu ni na jednom aktivnom projektu',
    [url_ui_prefix + '/projects']: 'Popis svih odobrenih projekata',
    [url_ui_prefix + '/software']: 'Popis aplikacija dostupnih na klasteru',
  }

  if (loc.includes('/my-requests/') && loc.match(/[%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    return 'Pregledavanje zahtjeva ' + identifier
  }

  if (loc.includes('/requests/') && loc.match(/[%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    return 'Pregledavanje zahtjeva ' + identifier
  }

  if (loc.includes('/projects/') && loc.match(/[%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    return 'Pregledavanje projekta ' + identifier
  }

  if (loc.includes('/users/inactive/') && loc.match(/[@%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%@\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    return 'Detalji neaktivnog korisnika ' + identifier
  }
  else if (loc.includes('/users/') && loc.match(/[@%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%@\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    if (identifier[0] !== 'inactive')
      return 'Detalji aktivnog korisnika ' + identifier
  }


  if (loc.includes('/new-request/research-project/') && loc.match(/[0-9]$/))
    return 'Novi zahtjev temeljem odabranog istraživačkog projekta'

  return url2linktitle[loc]
}
