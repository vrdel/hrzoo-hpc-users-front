import { url_ui_prefix } from './general';

export function LinkTitles(loc) {
  let url2linktitle = {
    [url_ui_prefix + '/upravljanje-zahtjevima']: 'Upravljanje zahtjevima',
    [url_ui_prefix + '/moji-zahtjevi']: 'Moji zahtjevi',
    [url_ui_prefix + '/novi-zahtjev']: 'Novi zahtjev',
    [url_ui_prefix + '/novi-zahtjev/istrazivacki-projekt']: 'Novi zahtjev temeljem istraživačkog projekta',
    [url_ui_prefix + '/novi-zahtjev/prakticna-nastava']: 'Novi zahtjev temeljem praktične nastave',
    [url_ui_prefix + '/novi-zahtjev/izrada-rada']: 'Novi zahtjev temeljem izrade rada',
    [url_ui_prefix + '/javni-kljucevi']: 'Upravljanje javnim ključevima',
    [url_ui_prefix + '/javni-kljucevi/novi']: 'Dodavanje novog javnog ključa',
    [url_ui_prefix + '/moji-podaci']: 'Moji podaci u imeniku matične ustanove i sustavu CroRIS',
    [url_ui_prefix + '/clanstva']: 'Popis i upravljanje članovima na odobrenim zahtjevima/projektima',
  }

  if (loc.includes('/moji-zahtjevi/') && loc.match(/[\w\d-_]+$/)) {
    let identifier = loc.match(/[\w\d-_]+$/)
    return 'Pregledavanje zahtjeva ' + identifier
  }

  if (loc.includes('/upravljanje-zahtjevima/') && loc.match(/[\w\d-_]+$/)) {
    let identifier = loc.match(/[\w\d-_]+$/)
    return 'Pregledavanje zahtjeva ' + identifier
  }

  if (loc.includes('/novi-zahtjev/istrazivacki-projekt/') && loc.match(/[0-9]$/))
    return 'Novi zahtjev temeljem odabranog istraživačkog projekta'

  return url2linktitle[loc]
}
