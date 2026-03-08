import React from 'react';
import { findTrueState } from '../utils/reqstate';
import { Col } from 'react-bootstrap';
import {
  Approve,
  ApproveExpire,
  Deny,
  Expire,
  Extend,
  Submit,
  SubmitExtend
} from "Components/StateIcons"
import { FormattedMessage } from 'react-intl'


export const RenderStateIcon = ({reqState}) => {
  let targetState = findTrueState(reqState)

  if (targetState === 'approve') {
    return(
      <Col md={{size: 2}} className="d-flex flex-column align-items-center">
        <Approve />
        <br/>
        <p className="fs-5 mt-1 fw-normal">
          <FormattedMessage
            defaultMessage="Odobren"
            description="renderstate-approve"
          />
        </p>
      </Col>
    )
  }
  else if (targetState === 'submit') {
    return(
      <Col md={{size: 2}} className="d-flex flex-column align-items-center">
        <Submit />
        <p className="fs-5 mt-1 fw-normal">
          <FormattedMessage
            defaultMessage="Obrada"
            description="renderstate-process"
          />
        </p>
      </Col>
    )
  }
  else if (targetState === 'extend') {
    return(
      <Col md={{size: 2}} className="d-flex flex-column align-items-center">
        <Extend />
        <p className="fs-5 mt-1 fw-normal">
          <FormattedMessage
            defaultMessage="Produljen"
            description="renderstate-extend"
          />
        </p>
      </Col>
    )
  }
  else if (targetState === 'deny') {
    return(
      <Col md={{size: 2}} className="d-flex flex-column align-items-center">
        <Deny />
        <p className="fs-5 mt-1 fw-normal">
          <FormattedMessage
            defaultMessage="Odbijen"
            description="renderstate-denied"
          />
        </p>
      </Col>
    )
  }
  else if (targetState === 'expire') {
    return(
      <Col md={{size: 2}} className="d-flex flex-column align-items-center">
        <Expire />
        <p className="fs-5 mt-1 fw-normal">
          <FormattedMessage
            defaultMessage="Završen"
            description="renderstate-expire"
          />
        </p>
      </Col>
    )
  }
  else if (targetState === 'approve-expire') {
    return(
      <Col md={{size: 2}} className="d-flex flex-column align-items-center">
        <ApproveExpire />
        <p className="fs-5 mt-1 text-nowrap fw-normal">
          <FormattedMessage
            defaultMessage="Pred istekom"
            description="renderstate-approveexpire"
          />
        </p>
      </Col>
    )
  }
  else if (targetState === 'submit-extend') {
    return(
      <Col md={{size: 2}} className="d-flex flex-column align-items-center">
        <SubmitExtend />
        <p className="fs-5 mt-1 fw-normal">
          <FormattedMessage
            defaultMessage="Produljenje"
            description="renderstate-submitextend"
          />
        </p>
      </Col>
    )
  }
}
