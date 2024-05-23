import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckDouble,
  faCog,
  faTimes,
  faTimeline,
  faCalendarXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FormattedMessage } from 'react-intl'


export function StateIcons(state_name, small=false) {
  let size = "fa-3x"

  if (small)
    size = "fa-2x"

  let state2icon = {
    'submit': <FontAwesomeIcon className={`text-warning ${size}`} icon={faCog}/>,
    'approve': <FontAwesomeIcon className={`text-success ${size}`} icon={faCheckDouble}/>,
    'deny': <FontAwesomeIcon className={`text-danger ${size}`} icon={faTimes}/>,
    'expire': <FontAwesomeIcon className={`text-danger ${size}`} icon={faCalendarXmark}/>,
    'extend': <FontAwesomeIcon className={`text-warning ${size}`} icon={faTimeline}/>
  }

  return state2icon[state_name]
}

export function StateString(state_name) {
  let state2string = {
    'submit': <FormattedMessage
      defaultMessage="Zahtjev je podnesen i čeka na obradu"
      description="statestring-submit"
    />,
    'approve': <FormattedMessage
      defaultMessage="Zahtjev je odobren"
      description="statestring-approve"
    />,
    'deny': <FormattedMessage
      defaultMessage="Zahtjev je odbijen"
      description="statestring-deny"
    />,
    'expire': <FormattedMessage
      defaultMessage="Zahtjev je istekao"
      description="statestring-expire"
    />,
    'extend': <FormattedMessage
      defaultMessage="Zahtjev čeka na produljenje"
      description="statestring-extend"
    />
  }

  return state2string[state_name]
}

export function StateStringUser(state_name) {
  let state2string = {
    'submit': <FormattedMessage
      defaultMessage="Zahtjev je podnesen i čeka na obradu"
      description="statestringuser-submit"
    />,
    'approve': <FormattedMessage
      defaultMessage="Aktivan"
      description="statestringuser-approve"
    />,
    'expire': <FormattedMessage
      defaultMessage="Istekao"
      description="statestringuser-expire"
    />,
    'extend': <FormattedMessage
      defaultMessage="Produljen"
      description="statestringuser-extend"
    />
  }

  return state2string[state_name]
}

export function StateShortString(state_name) {
  let state2string = {
    'submit': <FormattedMessage
      defaultMessage="Obrada"
      description="stateshort-submit"
    />,
    'approve': <FormattedMessage
      defaultMessage="Odobren"
      description="stateshort-approved"
    />,
    'deny': <FormattedMessage
      defaultMessage="Odbijen"
      description="stateshort-deny"
    />,
    'expire': <FormattedMessage
      defaultMessage="Istekao"
      description="stateshort-expire"
    />,
    'extend': <FormattedMessage
      defaultMessage="Produljenje"
      description="stateshort-extend"
    />,
  }

  return state2string[state_name]
}
