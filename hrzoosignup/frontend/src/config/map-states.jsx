import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faCheckDouble,
  faCog,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';


export function StateIcons(state_name) {
  let state2icon = {
    'submit': <FontAwesomeIcon className="text-warning fa-3x" icon={faCog}/>,
    'approve': <FontAwesomeIcon className="text-success fa-3x" icon={faCheckDouble}/>,
    'deny': <FontAwesomeIcon className="text-success fa-3x" icon={faTimes}/>
  }

  return state2icon[state_name]
}

export function StateString(state_name) {
  let state2string = {
    'submit': 'Zahtjev je podnesen i čeka na obradu',
    'approve': 'Zahtjev je odobren',
    'deny': 'Zahtjev je odbijen'
  }

  return state2string[state_name]
}

export function StateShortString(state_name) {
  let state2string = {
    'submit': 'Obrada',
    'approve': 'Odobren',
    'deny': 'Odbijen',
    'expire': 'Istekao',
    'extend': 'Produljenje',
  }

  return state2string[state_name]
}
