import React from 'react'
import { Col } from 'reactstrap';

export const PageTitle = ({pageTitle}) => {
  return (
    <Col className="ms-3 me-3 p-2 mb-2 rounded bg-light">
      <h3>
        { pageTitle }
      </h3>
    </Col>
  )
}
