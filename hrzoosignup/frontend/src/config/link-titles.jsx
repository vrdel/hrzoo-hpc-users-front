import { url_ui_prefix } from './general';

export function LinkTitles(loc, locale='hr') {
    let url2linktitle = {
      'hr': {
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
      },
      'en': {
        [url_ui_prefix + '/requests']: 'Requests management',
        [url_ui_prefix + '/my-requests']: 'My requests',
        [url_ui_prefix + '/new-request']: 'New request',
        [url_ui_prefix + '/new-request/istrazivacki-projekt']: 'New request on behalf of research project',
        [url_ui_prefix + '/new-request/institucijski-projekt']: 'New request on behalf of institutional project',
        [url_ui_prefix + '/new-request/interni-projekt']: 'New request on behalf of internal project',
        [url_ui_prefix + '/new-request/prakticna-nastava']: 'New request on behalf of practical class',
        [url_ui_prefix + '/new-request/izrada-rada']: 'New request on behalf of thesis project',
        [url_ui_prefix + '/new-request/srce-radionica']: 'New request on behalf of Srce workshop',
        [url_ui_prefix + '/public-keys']: 'Public keys management',
        [url_ui_prefix + '/public-keys/novi']: 'Add public key',
        [url_ui_prefix + '/my-info']: 'My service status, digital identity and CroRIS information',
        [url_ui_prefix + '/memberships']: 'List and handle membershis on approved requests/projects',
        [url_ui_prefix + '/users']: 'List of all users on active projects',
        [url_ui_prefix + '/users/inactive']: 'List of all users without any active project',
        [url_ui_prefix + '/projects']: 'List of all approved projects',
        [url_ui_prefix + '/software']: 'List of software available on resources',
      },
    }
  if (locale === 'en') {
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
      return 'Viewing request ' + identifier
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

    return url2linktitle['en'][loc]
  }

  else if (locale === 'hr') {
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

    return url2linktitle['hr'][loc]
  }

}
