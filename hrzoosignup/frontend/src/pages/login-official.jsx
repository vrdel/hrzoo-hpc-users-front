import React, { useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Col,
  Container,
  Row,
  Card,
  CardHeader,
  CardFooter,
  CardBody,
} from 'reactstrap';
import {
  faLaptopCode,
} from '@fortawesome/free-solid-svg-icons';
import { defaultAuthnRedirect, defaultAuthnRedirectStaff } from 'Config/default-redirect';
import { useNavigate } from 'react-router-dom';
import { IntlContext } from 'Components/IntlContextProvider';
import { LanguageButtonLogin } from 'Components/LocaleButton';
import { FormattedMessage } from 'react-intl';
import 'Styles/login-official.css';


const LoginOfficial = ({sessionData=undefined}) => {
  const navigate = useNavigate();
  const { locale, setLocale } = useContext(IntlContext)

  useEffect(() => {
    if (sessionData?.active && sessionData?.userdetails)
      if (sessionData.userdetails.is_staff
        || sessionData.userdetails.is_superuser)
        navigate(defaultAuthnRedirectStaff)
      else
        navigate(defaultAuthnRedirect)
  }, [sessionData])

  return (
    <Container fluid className={`image-background-${locale} d-flex justify-content-center`} style={{minHeight: '100vh'}}>
      <Row>
        <Col lg={{size: 3}} md={{size: 2}} sm={{size: 1}}>
        </Col>
        <Col lg={{size: 6}} md={{size: 8}}>
          <Row className="m-lg-4 p-lg-4 m-md-3 p-md-3 m-sm-1 p-sm-1"/>
          <Card className="shadow-lg">
            <CardHeader
              id='hzsi-loginheader'
              className="p-3 d-flex flex-row align-items-center justify-content-center"
            >
              <FontAwesomeIcon icon={faLaptopCode} style={{color: "#c00000"}} size="4x" />
              <h2 className="ms-5 text-dark">
                <strong>
                  <FormattedMessage
                    description="loginofficial-servicename"
                    defaultMessage="Napredno računanje"
                  />
                </strong>
              </h2>
            </CardHeader>
            <CardBody className="pt-5 pb-2 mb-4">
              <p className="fs-4 mb-4 text-center">
                <FormattedMessage
                  description="loginofficial-termsstring"
                  defaultMessage="Prijavom u sustav potvrđujete da prihvaćate"
                />{' '}
                <a href="https://www.srce.unizg.hr/napredno-racunanje/pravila" target="_blank" rel="noopener noreferrer">
                  <FormattedMessage
                    description="loginofficial-terms"
                    defaultMessage="Pravila korištenja usluge Napredno računanje"
                  />
                </a>
              </p>
              <a className="btn mt-5 fs-3 btn-success btn-lg btn-block" style={{width: '100%'}} role="button" href= {`/saml2/login`}>AAI@EduHR</a>
              {
               // <a className="btn mt-3 fs-3 text-white bg-success btn-lg btn-block bg-opacity-75" style={{width: '100%'}} role="button" href= {`/saml2/edugain/login`}>eduGAIN</a>
              }
              {
                sessionData?.config?.enable_edugain ?
                  <a className="btn mt-3 fs-3 text-white btn-primary btn-lg btn-block" style={{width: '100%'}} role="button" href= {`/saml2/edugain/login`}>eduGAIN</a>
                :
                  ''
              }
            </CardBody>
            <CardFooter className="bg-transparent d-flex align-items-center justify-content-center">
              <Row className="m-1">
                <Col>
                  <LanguageButtonLogin locale={locale} setLocale={setLocale} />
                </Col>
              </Row>
            </CardFooter>
          </Card>
        </Col>
        <Col lg={{size: 3}} md={{size: 2}} sm={{size: 1}}>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginOfficial;
