import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckDouble,
  faTimeline,
  faQuestion,
  faHourglassStart,
  faTimes,
  faCog,
  faCalendarXmark,
} from '@fortawesome/free-solid-svg-icons';


export const Submit = ({size="fa-3x"}) =>
  <FontAwesomeIcon className={`text-warning ${size}`} icon={faCog}/>


export const Deny = ({size="fa-3x"}) =>
  <FontAwesomeIcon className={`text-danger ${size}`} icon={faTimes}/>


export const Expire = ({size="fa-3x"}) =>
  <FontAwesomeIcon className={`text-danger ${size}`} icon={faCalendarXmark}/>


export const Approve = ({size="fa-3x"}) =>
  <FontAwesomeIcon className={`text-success ${size}`} icon={faCheckDouble}/>


export const SubmitExtend = ({size="fa-3x"}) =>
  <span className={`fa-layers ${size} fa-fw`}>
    <FontAwesomeIcon icon={faQuestion} className="text-danger" transform="shrink-8 right-8 down-3" />
    <FontAwesomeIcon icon={faTimeline} className="text-success" transform="shrink-2 up-2"/>
  </span>


export const ApproveExpire = ({size="fa-3x"}) =>
  <span className={`fa-layers ${size} fa-fw`}>
    <FontAwesomeIcon icon={faHourglassStart} className="text-warning" transform="shrink-9 right-8 down-3" />
    <FontAwesomeIcon icon={faCheckDouble} className="text-success" transform="shrink-1 up-2"/>
  </span>


export const Extend = ({size="fa-3x"}) =>
  <span className={`fa-layers ${size} fa-fw`}>
    <FontAwesomeIcon icon={faCheckDouble} className="text-success" transform="shrink-8 right-8 down-3" />
    <FontAwesomeIcon icon={faTimeline} className="text-success" transform="shrink-2 up-2"/>
  </span>
