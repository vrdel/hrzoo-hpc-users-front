import React from 'react'
import { Col } from 'reactstrap';

export const PageTitle = ({pageTitle}) => {
  return (
    <Col className="ms-3 me-3 mt-2 p-2 mb-2 rounded bg-light">
      <h4 className="mt-2">
        { pageTitle }
      </h4>
    </Col>
  )
}
