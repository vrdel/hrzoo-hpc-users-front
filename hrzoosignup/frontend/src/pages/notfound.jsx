import React from 'react';
import {
  Row,
  Col,
  Container,
  Card,
  CardBody,
  CardHeader,
  CardFooter
} from 'reactstrap'
import SrceBroken from '../assets/srce-broken.png';


const NotFound = () => {
  return (
    <Container fluid className="pt-1 d-flex align-items-center justify-content-center" style={{minHeight: '100vh'}}>
      <Row>
        <Col>
          <Card className="shadow-sm" style={{minHeight: '50vh'}}>
            <CardHeader className="bg-danger fw-bold text-center text-white">
              <h2 style={{'textShadow': "1px 1px 2px #000000"}}>
                GREŠKA, SRCE mi se slama!
              </h2>
            </CardHeader>
            <CardBody className="p-5 mb-3">
              <img src={SrceBroken} id="srcebrokenlogo" alt="SRCE Broken Logo"/>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  )
};

export default NotFound;
