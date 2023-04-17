import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col,
  Container,
  Row,
  Card,
  CardHeader,
  CardBody,
} from 'reactstrap';
import {
  faLaptopCode,
} from '@fortawesome/free-solid-svg-icons';
import '../styles/login-official.css';


const LoginOfficial = () => {
  return (
    <Container fluid className="image-background d-flex justify-content-center" style={{minHeight: '100vh'}}>
      <Row>
        <Col>
          <Row style={{'height': '130px'}}/>
          <Card className="shadow-lg" style={{height: '425px', width: '650px'}}>
            <CardHeader
              id='hzsi-loginheader'
              className="p-3 d-sm-inline-flex align-items-center justify-content-center"
            >
              <FontAwesomeIcon icon={faLaptopCode} style={{color: "#c00000"}} size="4x" />
              <h2 className="ms-5 text-dark"><strong>Napredno računanje</strong></h2>
            </CardHeader>
            <CardBody className="pt-5">

              <p className="fs-4 mb-4 text-center">
                Prijavom u sustav potvrđujete da prihvaćate{' '}
                <a href="https://www.srce.unizg.hr/napredno-racunanje/pravila" target="_blank" rel="noopener noreferrer">
                  Pravila korištenja usluge Napredno računanje
                </a>
              </p>
              <a className="btn mt-5 fs-3 btn-success btn-lg btn-block" style={{width: '100%'}} role="button" href= {`/saml2/login`}>AAI@EduHR</a>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginOfficial;
