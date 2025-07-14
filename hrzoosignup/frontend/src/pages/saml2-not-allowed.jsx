import React, { useContext } from 'react';
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
import 'Styles/login-official.css';
import { useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { LanguageButtonLogin } from 'Components/LocaleButton';
import SrceLogoHeadMid from 'Assets/srce-logo-head-mid.png';
import SrceLogoHeadMidEn from 'Assets/srce-logo-head-mid-en.png';
import { IntlContext } from 'Components/IntlContextProvider';
import { useIntl } from 'react-intl'


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


const AlertEduGainAttrs = () =>
  <>
    <Alert color="danger" className="fs-4 text-center">
      <FormattedMessage
        defaultMessage="Autentikacija eduGAIN-om nije uspjela."
        description="saml2-not-allowed-alertedugainattrs-1"
      />
    </Alert>
    <p className="fs-5 p-1">
      <FormattedMessage
        defaultMessage="Kako bi se osiguralo ispravno funkcioniranje ove aplikacije, potrebni su sljedeći obvezni eduGAIN atributi:"
        description="saml2-not-allowed-alertedugainattrs-2"
      />
    </p>
    <p className="text-center fw-bold fw-italic fs-5 p-4">
      <FormattedMessage
        defaultMessage="<mark>givenName, sn, eduPersonPrincipalName, mail</mark>"
        description="saml2-not-allowed-alertedugainattrs-3"
        values={{
          b: (chunks) => <b>{chunks}</b>,
          mark: (chunks) => <mark>{chunks}</mark>
        }}
      />
    </p>
    <hr />
    <p className="p-2 fs-5 text-center">
      <FormattedMessage
        defaultMessage="Ovi atributi su ključni za autentikaciju i personalizaciju. Molimo kontaktirajte administratora vašeg davatelja identiteta (IdP) kako biste zatražili otpuštanje potrebnih atributa."
        description="saml2-not-allowed-alertedugainattrs-4"
      />
    </p>
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
  const eduGainAttrs = errorType === 'edugainattrs'
  const { locale, setLocale } = useContext(IntlContext)
  const intl = useIntl()

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
              <span className="pl-3 font-weight-bold text-center">
                {
                  locale === 'hr' ?
                    <a href={intl.formatMessage({ defaultMessage: "https://www.srce.unizg.hr/napredno-racunanje", description: 'navigation-brand-link' })}
                      target="_blank" rel="noopener noreferrer">
                      <img src={SrceLogoHeadMid} id="srcelogohr" alt="SRCE Logo HR"/>
                    </a>
                  :
                    <a href={intl.formatMessage({ defaultMessage: "https://www.srce.unizg.hr/napredno-racunanje", description: 'navigation-brand-link' })}
                      target="_blank" rel="noopener noreferrer">
                      <img src={SrceLogoHeadMidEn} id="srcelogoen" alt="SRCE Logo EN"/>
                    </a>
                }
              </span>
            </CardHeader>
            <CardBody className="pt-5 pb-5">
              {
                multipleUsersError ?
                  <AlertMultiple />
                :
                  eduGainAttrs ?
                    <AlertEduGainAttrs />
                  :
                    <AlertRegular />
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
