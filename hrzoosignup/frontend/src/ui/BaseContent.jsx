import React from 'react'
import { Outlet } from 'react-router-dom';
import { Row, Col } from 'reactstrap'
import '../css/content.css';


const BaseContent = () => {
  return (
    <Col>
      <Row>
        <Col className="ms-3 me-3 p-2 mb-2 rounded bg-light">
          <h3>
            { location.pathname }
          </h3>
        </Col>
      </Row>
      <Row>
        <Col>
          <Outlet />
        </Col>
      </Row>
    </Col>
  )
}

export default BaseContent;
