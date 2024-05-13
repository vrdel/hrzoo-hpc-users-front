import { url_ui_prefix } from './general';


export function LinkTitles(loc, intl) {
  let url2linktitle = {
    [url_ui_prefix + '/requests']:
      intl.formatMessage({
        defaultMessage: 'Upravljanje zahtjevima',
        description: 'linktitle-managerequests'
      }),
    [url_ui_prefix + '/my-requests']: 'Moji zahtjevi',
    [url_ui_prefix + '/new-request']: 'Novi zahtjev',
    [url_ui_prefix + '/new-request/research-project']: 'Novi zahtjev temeljem istraživačkog projekta',
    [url_ui_prefix + '/new-request/institutional-project']: 'Novi zahtjev temeljem institucijskog projekta',
    [url_ui_prefix + '/new-request/internal-project']: 'Novi zahtjev temeljem internog projekta',
    [url_ui_prefix + '/new-request/practical-class']: 'Novi zahtjev temeljem praktične nastave',
    [url_ui_prefix + '/new-request/thesis-project']: 'Novi zahtjev temeljem izrade rada',
    [url_ui_prefix + '/new-request/srce-workhop']: 'Novi zahtjev za Srce radionicu',
    [url_ui_prefix + '/public-keys']: 'Upravljanje javnim ključevima',
    [url_ui_prefix + '/public-keys/new']: 'Dodavanje novog javnog ključa',
    [url_ui_prefix + '/my-info']: intl.formatMessage({
      defaultMessage: 'Status na usluzi, moji podaci u imeniku matične ustanove i sustavu CroRIS',
      description: 'linktitle-myinfo'
    }),
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
    return 'Viewing request ' + identifier
  }

  if (loc.includes('/requests/') && loc.match(/[%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    return intl.formatMessage({
        defaultMessage: 'Pregledavanje zahtjeva {identifier}',
        description: 'linktitle-managerequests-change'
      },
      {identifier
    })
  }

  if (loc.includes('/projects/') && loc.match(/[%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    return 'Viewing project ' + identifier
  }

  if (loc.includes('/users/inactive/') && loc.match(/[@%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%@\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    return 'Details of inactive user ' + identifier
  }
  else if (loc.includes('/users/') && loc.match(/[@%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%@\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    if (identifier[0] !== 'inactive')
      return 'Details of active user ' + identifier
  }

  if (loc.includes('/new-request/research-project/') && loc.match(/[0-9]$/))
    return 'New request on behalf of selected research project'

  return url2linktitle[loc]
}
