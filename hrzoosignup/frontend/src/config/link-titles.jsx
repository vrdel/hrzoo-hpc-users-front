import { url_ui_prefix } from './general';

export function LinkTitles(loc) {
  let url2linktitle = {
    [url_ui_prefix + '/zahtjevi']: 'Upravljanje zahtjevima',
    [url_ui_prefix + '/moji-zahtjevi']: 'Moji zahtjevi',
    [url_ui_prefix + '/novi-zahtjev']: 'Novi zahtjev',
    [url_ui_prefix + '/novi-zahtjev/istrazivacki-projekt']: 'Novi zahtjev temeljem istraživačkog projekta',
    [url_ui_prefix + '/novi-zahtjev/institucijski-projekt']: 'Novi zahtjev temeljem institucijskog projekta',
    [url_ui_prefix + '/novi-zahtjev/interni-projekt']: 'Novi zahtjev temeljem internog projekta',
    [url_ui_prefix + '/novi-zahtjev/prakticna-nastava']: 'Novi zahtjev temeljem praktične nastave',
    [url_ui_prefix + '/novi-zahtjev/izrada-rada']: 'Novi zahtjev temeljem izrade rada',
    [url_ui_prefix + '/novi-zahtjev/srce-radionica']: 'Novi zahtjev za Srce radionicu',
    [url_ui_prefix + '/javni-kljucevi']: 'Upravljanje javnim ključevima',
    [url_ui_prefix + '/javni-kljucevi/novi']: 'Dodavanje novog javnog ključa',
    [url_ui_prefix + '/moji-podaci']: 'Status na usluzi, moji podaci u imeniku matične ustanove i sustavu CroRIS',
    [url_ui_prefix + '/clanstva']: 'Popis i upravljanje članovima na odobrenim zahtjevima/projektima',
    [url_ui_prefix + '/korisnici']: 'Popis svih korisnika na aktivnim projektima',
    [url_ui_prefix + '/korisnici/neaktivni']: 'Popis svih korisnika koji nisu ni na jednom aktivnom projektu',
    [url_ui_prefix + '/projekti']: 'Popis svih odobrenih projekata',
    [url_ui_prefix + '/softver']: 'Popis aplikacija dostupnih na klasteru',
  }

  if (loc.includes('/moji-zahtjevi/') && loc.match(/[%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    return 'Pregledavanje zahtjeva ' + identifier
  }

  if (loc.includes('/zahtjevi/') && loc.match(/[%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    return 'Pregledavanje zahtjeva ' + identifier
  }

  if (loc.includes('/projekti/') && loc.match(/[%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    return 'Pregledavanje projekta ' + identifier
  }

  if (loc.includes('/korisnici/neaktivni/') && loc.match(/[@%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%@\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    return 'Detalji neaktivnog korisnika ' + identifier
  }
  else if (loc.includes('/korisnici/') && loc.match(/[@%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%@\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    if (identifier[0] !== 'neaktivni')
      return 'Detalji aktivnog korisnika ' + identifier
  }


  if (loc.includes('/novi-zahtjev/istrazivacki-projekt/') && loc.match(/[0-9]$/))
    return 'Novi zahtjev temeljem odabranog istraživačkog projekta'

  return url2linktitle[loc]
}
