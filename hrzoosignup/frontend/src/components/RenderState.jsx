import React from 'react';
import { findTrueState } from '../utils/reqstate';
import { Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCog,
  faTimes,
  faTimeline,
  faCalendarXmark,
  faCheckDouble,
} from '@fortawesome/free-solid-svg-icons';


export const RenderStateIcon = ({reqState}) => {
  let targetState = findTrueState(reqState)

  if (targetState === 'approve') {
    return(
      <Col md={{size: 2}} className="d-flex flex-column align-items-center">
        <FontAwesomeIcon
          className="fa-3x text-success"
          style={{color: '#00ff00'}} icon={faCheckDouble}/>{' '}
        <br/>
        <p className="fs-5 mt-1">
          Odobren
        </p>
      </Col>
    )
  }
  else if (targetState === 'submit') {
    return(
      <Col md={{size: 2}} className="d-flex flex-column align-items-center">
        <FontAwesomeIcon className="fa-3x text-warning" icon={faCog}/>{' '}
        <p className="fs-5 mt-1">
          Obrada
        </p>
      </Col>
    )
  }
  else if (targetState === 'extend') {
    return(
      <Col md={{size: 2}} className="d-flex flex-column align-items-center">
        <FontAwesomeIcon className="fa-3x text-warning" icon={faTimeline}/>{' '}
        <p className="fs-5 mt-1">
          Produljenje
        </p>
      </Col>
    )
  }
  else if (targetState === 'deny') {
    return(
      <Col md={{size: 2}} className="d-flex flex-column align-items-center">
        <FontAwesomeIcon className="fa-3x text-danger" icon={faTimes}/>{' '}
        <p className="fs-5 mt-1">
          Odbijen
        </p>
      </Col>
    )
  }
  else if (targetState === 'expire') {
    return(
      <Col md={{size: 2}} className="d-flex flex-column align-items-center">
        <FontAwesomeIcon className="fa-3x text-danger" icon={faCalendarXmark}/>{' '}
        <p className="fs-5 mt-1">
          Istekao
        </p>
      </Col>
    )
  }
}
