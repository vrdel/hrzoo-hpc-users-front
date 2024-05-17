import { url_ui_prefix } from './general';


export function LinkTitles(loc, intl) {
  let url2linktitle = {
    [url_ui_prefix + '/requests']:
      intl.formatMessage({
        defaultMessage: 'Upravljanje zahtjevima',
        description: 'linktitle-managerequests'
      }),
    [url_ui_prefix + '/my-requests']:
      intl.formatMessage({
        defaultMessage: 'Moji zahtjevi',
        description: 'linktitle-myrequests'
      }),
    [url_ui_prefix + '/new-request']:
      intl.formatMessage({
        defaultMessage: 'Novi zahtjev',
        description: 'linktitle-newrequest'
      }),
    [url_ui_prefix + '/new-request/research-project']:
      intl.formatMessage({
        defaultMessage: 'Novi zahtjev temeljem istraživačkog projekta',
        description: 'linktitle-newrequest-research'
      }),
    [url_ui_prefix + '/new-request/institutional-project']:
      intl.formatMessage({
        defaultMessage: 'Novi zahtjev temeljem institucijskog projekta',
        description: 'linktitle-newrequest-institutional'
      }),
    [url_ui_prefix + '/new-request/internal-project']:
      intl.formatMessage({
        defaultMessage: 'Novi zahtjev temeljem internog projekta',
        description: 'linktitle-newrequest-internal'
      }),
    [url_ui_prefix + '/new-request/practical-class']:
      intl.formatMessage({
        defaultMessage: 'Novi zahtjev temeljem praktične nastave',
        description: 'linktitle-newrequest-class'
      }),
    [url_ui_prefix + '/new-request/thesis-project']:
      intl.formatMessage({
        defaultMessage: 'Novi zahtjev temeljem izrade rada',
        description: 'linktitle-newrequest-thesis'
      }),
    [url_ui_prefix + '/new-request/srce-workshop']:
      intl.formatMessage({
        defaultMessage: 'Novi zahtjev za Srce radionicu',
        description: 'linktitle-newrequest-srceworkshop'
      }),
    [url_ui_prefix + '/public-keys']:
      intl.formatMessage({
        defaultMessage: 'Upravljanje javnim ključevima',
        description: 'linktitle-pubkeys'
      }),
    [url_ui_prefix + '/public-keys/new']:
      intl.formatMessage({
        defaultMessage: 'Dodavanje novog javnog ključa',
        description: 'linktitle-pubkeys-add'
      }),
    [url_ui_prefix + '/my-info']: intl.formatMessage({
      defaultMessage: 'Status na usluzi, moji podaci u imeniku matične ustanove i sustavu CroRIS',
      description: 'linktitle-myinfo'
    }),
    [url_ui_prefix + '/memberships']: intl.formatMessage({
      defaultMessage: 'Popis i upravljanje članovima na odobrenim zahtjevima/projektima',
      description: "linktitle-memberships"
    }),
    [url_ui_prefix + '/users']:
      intl.formatMessage({
        defaultMessage: 'Popis svih korisnika na aktivnim projektima',
        description: 'linktitle-users'
      }),
    [url_ui_prefix + '/users/inactive']:
      intl.formatMessage({
        defaultMessage: 'Popis svih korisnika koji nisu ni na jednom aktivnom projektu',
        description: 'linktitle-usersinactive'
      }),
    [url_ui_prefix + '/projects']:
      intl.formatMessage({
        defaultMessage: 'Popis svih odobrenih projekata',
        description: 'linktitle-projects'
      }),
    [url_ui_prefix + '/software']:
      intl.formatMessage({
        defaultMessage: 'Popis aplikacija dostupnih na klasteru',
        description: 'linktitle-software'
      }),
  }

  if (loc.includes('/my-requests/') && loc.match(/[%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    return intl.formatMessage({
        defaultMessage: 'Pregledavanje zahtjeva {identifier}',
        description: 'linktitle-myrequests-view'
      },
      {identifier}
    )
  }

  if (loc.includes('/requests/') && loc.match(/[%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    return intl.formatMessage({
        defaultMessage: 'Pregledavanje zahtjeva {identifier}',
        description: 'linktitle-managerequests-change'
      },
      {identifier}
    )
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
    return intl.formatMessage({
        defaultMessage: 'Detalji neaktivnog korisnika {identifier}',
        description: 'linktitle-usersinactive-view'
      },
      {identifier}
    )
  }
  else if (loc.includes('/users/') && loc.match(/[@%\w.\d-_]+$/)) {
    let identifier = loc.match(/[%@\w.\d-_]+$/)
    if (identifier[0].includes('%'))
      identifier = decodeURIComponent(identifier[0])
    if (identifier[0] !== 'inactive')
      return intl.formatMessage({
          defaultMessage: 'Detalji aktivnog korisnika {identifier}',
          description: 'linktitle-usersactive-view'
        },
        {identifier}
      )
  }

  if (loc.includes('/new-request/research-project/') && loc.match(/[0-9]$/))
      return intl.formatMessage({
        defaultMessage: 'Novi zahtjev temeljem odabranog istraživačkog projekta',
        description: 'linktitle-newreq-research'
      })

  return url2linktitle[loc]
}
