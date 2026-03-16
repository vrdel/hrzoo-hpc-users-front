import React from 'react';
import {
  Row,
  Col,
  Container,
  Card,
} from 'react-bootstrap'
import SrceBroken from '../assets/srce-broken.png';


const NotFound = () => {
  return (
    <Container fluid className="pt-1 d-flex align-items-center justify-content-center" style={{minHeight: '100vh'}}>
      <Row>
        <Col>
          <Card className="shadow" style={{minHeight: '50vh'}}>
            <Card.Header className="bg-danger fw-bold text-center text-white">
              <h2 style={{'textShadow': "1px 1px 2px #404040"}}>
                GREŠKA, SRCE mi se slama!
              </h2>
            </Card.Header>
            <Card.Body className="p-5 mb-3">
              <img src={SrceBroken} id="srcebrokenlogo" alt="SRCE Broken Logo"/>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
};

export default NotFound;
