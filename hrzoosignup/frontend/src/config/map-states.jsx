import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faCheckDouble,
  faCog,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';


export function StateIcons(state_name) {
  let state2icon = {
    'submitted': <FontAwesomeIcon className="text-warning fa-3x" icon={faCog}/>,
    'approved': <FontAwesomeIcon className="text-success fa-3x" icon={faCheckDouble}/>,
    'denied': <FontAwesomeIcon className="text-success fa-3x" icon={faTimes}/>
  }

  return state2icon[state_name]
}

export function StateString(state_name) {
  let state2string = {
    'submitted': 'Zahtjev je podnesen i čeka na obradu',
    'approved': 'Zahtjev je odobren',
    'denied': 'Zahtjev je odbijen'
  }

  return state2string[state_name]
}
