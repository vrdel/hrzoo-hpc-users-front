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
            <CardHeader className="fs-2 bg-danger fw-bold text-center text-white">
              Griješka! SRCE mi se slama!
            </CardHeader>
            <CardBody className="p-5 mb-3">
              <img src={SrceBroken} id="srcebrokenlogo" alt="SRCE Broken Logo"/>
            </CardBody>
            <CardFooter className="bg-danger text-white fw-bold text-center fs-4">
              Nemoj više!
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </Container>
  )
};

export default NotFound;
