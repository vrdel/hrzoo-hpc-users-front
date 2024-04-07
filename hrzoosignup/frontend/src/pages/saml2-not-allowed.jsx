import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
} from 'reactstrap';
import {
  faLaptopCode,
} from '@fortawesome/free-solid-svg-icons';
import 'Styles/login-official.css';
import { useParams } from 'react-router-dom';


const AlertRegular= () =>
  <>
    <Alert color="danger">
      <p className="fs-4 mb-4 text-center">
        Autentikacija s <b>eduGAIN AAI@EduHR</b> <mark>nije dozvoljena</mark>. Molimo nastavite dalje s <b>regularnom AAI@EduHR</b> autentikacijom.
      </p>
    </Alert>
    <a className="btn mt-5 fs-3 btn-success btn-lg btn-block" style={{width: '100%'}} role="button" href= {`/saml2/login`}>Prijava s regularnim AAI@EduHR</a>
  </>


const AlertMultiple = () =>
  <Alert color="danger">
    <p className="fs-4 mb-4 text-center">
      Autentikacija eduGAIN-om nije uspjela.
      Molimo obratite se na <a href="mailto:computing.srce.hr">computing@srce.hr</a>
    </p>
  </Alert>


const Saml2NotAllowed = () => {
  const { errorType } = useParams()
  const multipleUsersError = errorType === 'multiple'

  return (
    <Container fluid className="image-background d-flex justify-content-center" style={{minHeight: '100vh'}}>
      <Row>
        <Col lg={{size: 3}} md={{size: 2}} sm={{size: 1}}>
        </Col>
        <Col lg={{size: 6}} md={{size: 8}}>
          <Row className="m-lg-4 p-lg-4 m-md-3 p-md-3 m-sm-1 p-sm-1"/>
          <Card className="shadow-lg">
            <CardHeader
              id='hzsi-loginheader'
              className="d-sm-inline-flex align-items-center justify-content-center"
            >
              <FontAwesomeIcon icon={faLaptopCode} style={{color: "#c00000"}} size="4x" />
              <h4 className="ps-5 ms-5 text-dark"><strong>Napredno računanje</strong></h4>
            </CardHeader>
            <CardBody className="pt-5 pb-5">
              {
                !multipleUsersError ?
                  <AlertRegular />
                :
                  <AlertMultiple />
              }
            </CardBody>
          </Card>
        </Col>
        <Col lg={{size: 3}} md={{size: 2}} sm={{size: 1}}>
        </Col>
      </Row>
    </Container>
  )
};

export default Saml2NotAllowed;
