import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckDouble,
  faCog,
  faTimes,
  faTimeline,
  faCalendarXmark,
  faQuestion,
  faHourglassStart,
} from '@fortawesome/free-solid-svg-icons';
import { FormattedMessage } from 'react-intl'


const ExtendIcon = ({size}) => (
  <span className={`fa-layers ${size} fa-fw`}>
    <FontAwesomeIcon icon={faCheckDouble} className="text-success" transform="shrink-8 right-8 down-3" />
    <FontAwesomeIcon icon={faTimeline} className="text-success" transform="shrink-2 up-2"/>
  </span>
)


const SubmitExtendIcon = ({size}) => (
  <span className={`fa-layers ${size} fa-fw`}>
    <FontAwesomeIcon icon={faQuestion} className="text-danger" transform="shrink-8 right-8 down-3" />
    <FontAwesomeIcon icon={faTimeline} className="text-warning" transform="shrink-2 up-2"/>
  </span>
)


const ApproveExpire = ({size}) => (
  <span className={`fa-layers ${size} fa-fw`}>
    <FontAwesomeIcon icon={faHourglassStart} className="text-warning" transform="shrink-9 right-8 down-3" />
    <FontAwesomeIcon icon={faCheckDouble} className="text-success" transform="shrink-1 up-2"/>
  </span>
)


export function StateIcons(state_name, small=false) {
  let size = "fa-3x"

  if (small)
    size = "fa-2x"

  let state2icon = {
    'submit': <FontAwesomeIcon className={`text-warning ${size}`} icon={faCog}/>,
    'approve': <FontAwesomeIcon className={`text-success ${size}`} icon={faCheckDouble}/>,
    'deny': <FontAwesomeIcon className={`text-danger ${size}`} icon={faTimes}/>,
    'expire': <FontAwesomeIcon className={`text-danger ${size}`} icon={faCalendarXmark}/>,
    'extend': <ExtendIcon size={size}/>,
    'approve-expire': <ApproveExpire size={size}/>,
    'submit-extend': <SubmitExtendIcon size={size}/>
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
      defaultMessage="Zahtjev je završen"
      description="statestring-expire"
    />,
    'extend': <FormattedMessage
      defaultMessage="Zahtjev je produljen"
      description="statestring-extend"
    />,
    'submit-extend': <FormattedMessage
      defaultMessage="Podnesen zahtjev za produljenjem"
      description="statestring-submitextend"
    />,
    'approve-expire': <FormattedMessage
      defaultMessage="Zahtjev je pred istekom"
      description="statestring-submitextend"
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
      defaultMessage="Završen"
      description="statestringuser-expire"
    />,
    'extend': <FormattedMessage
      defaultMessage="Produljen"
      description="statestringuser-extend"
    />,
    'submit-extend': <FormattedMessage
      defaultMessage="Zahtjev za produljenjem podnesen i čeka na obradu"
      description="statestringuser-submitextend"
    />,
    'approve-expire': <FormattedMessage
      defaultMessage="Projekt je pred istekom"
      description="statestringuser-approveexpire"
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
      defaultMessage="Završen"
      description="stateshort-expire"
    />,
    'extend': <FormattedMessage
      defaultMessage="Produljen"
      description="stateshort-extend"
    />,
    'submit-extend': <FormattedMessage
      defaultMessage="Produljenje"
      description="stateshort-submitextend"
    />,
    'approve-expire': <FormattedMessage
      defaultMessage="Pred istekom"
      description="stateshort-approveexpire"
    />,
  }

  return state2string[state_name]
}
