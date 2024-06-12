import React, { useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Alert,
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardFooter
} from 'reactstrap';
import {
  faLaptopCode,
} from '@fortawesome/free-solid-svg-icons';
import 'Styles/login-official.css';
import { useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { LanguageButtonLogin } from 'Components/LocaleButton';
import { IntlContext } from 'Components/IntlContextProvider';

const AlertRegular= () =>
  <>
    <Alert color="danger">
      <p className="fs-4 mb-4 text-center">
        <FormattedMessage
          defaultMessage="Autentikacija s <b>eduGAIN AAI@EduHR</b> <mark>nije dozvoljena</mark>. Molimo nastavite dalje s <b>regularnom AAI@EduHR</b> autentikacijom."
          description="saml2-not-allowed-alertregular"
          values={{
            b: (chunks) => <b>{chunks}</b>,
            mark: (chunks) => <mark>{chunks}</mark>
          }}
        />
      </p>
    </Alert>
    <a className="btn mt-5 fs-3 btn-success btn-lg btn-block" style={{width: '100%'}} role="button" href= {`/saml2/login`}>
      <FormattedMessage
        defaultMessage="Prijava s regularnim AAI@EduHR"
        description="saml2-not-allowed-button-label-regular"
      />
    </a>
  </>


const AlertMultiple = () =>
  <Alert color="danger">
    <p className="fs-4 mb-4 text-center">
      <FormattedMessage
        defaultMessage="Autentikacija eduGAIN-om nije uspjela."
        description="saml2-not-allowed-alertmulti-1"
      />
      {' '}
      <FormattedMessage
        defaultMessage="Molimo obratite se na"
        description="saml2-not-allowed-alertmulti-2"
      /> <a href="mailto:computing.srce.hr">computing@srce.hr</a>
    </p>
  </Alert>


const Saml2NotAllowed = () => {
  const { errorType } = useParams()
  const multipleUsersError = errorType === 'multiple'
  const { locale, setLocale } = useContext(IntlContext)

  return (
    <Container fluid className={`image-background-${locale} d-flex justify-content-center`} style={{minHeight: '100vh'}}>
      <Row>
        <Col lg={{size: 3}} md={{size: 2}} sm={{size: 1}}>
        </Col>
        <Col lg={{size: 6}} md={{size: 8}}>
          <Row className="m-lg-4 p-lg-4 m-md-3 p-md-3 m-sm-1 p-sm-1"/>
          <Card className="shadow-lg" style={{minWidth: '550px'}}>
            <CardHeader
              id='hzsi-loginheader'
              className="p-3 d-flex flex-row align-items-center justify-content-center"
            >
              <FontAwesomeIcon icon={faLaptopCode} style={{color: "#c00000"}} size="4x" />
              <h2 className="ps-5 ms-5 text-dark">
                <strong>
                  <FormattedMessage
                    defaultMessage="Napredno računanje"
                    description="saml2-not-allowed-cardtitle"
                  />
                </strong>
              </h2>
            </CardHeader>
            <CardBody className="pt-5 pb-5">
              {
                !multipleUsersError ?
                  <AlertRegular />
                :
                  <AlertMultiple />
              }
            </CardBody>
            <CardFooter className="bg-transparent d-flex align-items-center justify-content-center">
              <Row className="m-1">
                <Col>
                  <LanguageButtonLogin locale={locale} setLocale={setLocale}/>
                </Col>
              </Row>
            </CardFooter>
          </Card>
        </Col>
        <Col lg={{size: 3}} md={{size: 2}} sm={{size: 1}}>
        </Col>
      </Row>
    </Container>
  )
};

export default Saml2NotAllowed;
