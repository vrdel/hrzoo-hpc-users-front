import React, { useEffect, useContext } from 'react';
import {
  Col,
  Container,
  Row,
  Card,
} from 'react-bootstrap';
import {
  defaultAuthnRedirect,
  defaultAuthnRedirectStaff,
  defaultAuthnRedirectWithAccounting,
  defaultAuthnRedirectWithAccountingLead
} from 'Config/default-redirect';
import { useNavigate } from 'react-router';
import { IntlContext } from 'Components/IntlContextProvider';
import { LanguageButtonLogin } from 'Components/LocaleButton';
import { FormattedMessage } from 'react-intl';
import SrceLogoHead from 'Assets/srce-logo-head.svg';
import SrceLogoHeadEn from 'Assets/srce-logo-head-en.svg';
import { useIntl } from 'react-intl'
import 'Styles/login-official.css';


const LoginOfficial = ({sessionData=undefined}) => {
  const navigate = useNavigate();
  const { locale, setLocale } = useContext(IntlContext)
  const intl = useIntl()

  useEffect(() => {
    if (sessionData?.active && sessionData?.userdetails)
      if (sessionData.userdetails.is_staff
        || sessionData.userdetails.is_superuser)
        navigate(defaultAuthnRedirectStaff)
      else {
        if (sessionData.config.enable_accounting)
          if (sessionData.userdetails.userproject_set.map(item => item.role.name).includes("lead"))
            navigate(defaultAuthnRedirectWithAccountingLead)
          else
            navigate(defaultAuthnRedirectWithAccounting)
        else
          navigate(defaultAuthnRedirect)
      }
  }, [sessionData])

  return (
    <Container fluid className={`image-background-${locale} d-flex justify-content-center`} style={{minHeight: '100vh'}}>
      <Row>
        <Col lg={{size: 3}} md={{size: 2}} sm={{size: 1}}>
        </Col>
        <Col lg={{size: 6}} md={{size: 8}}>
          <Row className="m-lg-3 p-lg-3 m-md-2 p-md-2 m-sm-1 p-sm-1"/>
          <Card className="shadow-lg">
            <Card.Header
              id='hzsi-loginheader'
              className="p-3 d-flex flex-row align-items-center justify-content-center"
            >
              {
                locale === 'hr' ?
                  <a href={intl.formatMessage({ defaultMessage: "https://www.srce.unizg.hr/napredno-racunanje", description: 'navigation-brand-link' })}
                    target="_blank" rel="noopener noreferrer">
                    <img src={SrceLogoHead} id="srcelogohr" alt="SRCE Logo HR" style={{ width: 400, height: "auto" }} />
                  </a>
                :
                  <a href={intl.formatMessage({ defaultMessage: "https://www.srce.unizg.hr/napredno-racunanje", description: 'navigation-brand-link' })}
                    target="_blank" rel="noopener noreferrer">
                    <img src={SrceLogoHeadEn} id="srcelogoen" alt="SRCE Logo EN" style={{ width: 410, height: "auto" }} />
                  </a>
              }
            </Card.Header>
            <Card.Body className="pt-5 pb-2 mb-4">
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
            </Card.Body>
            <Card.Footer className="bg-transparent d-flex align-items-center justify-content-center">
              <Row className="m-1">
                <Col>
                  <LanguageButtonLogin locale={locale} setLocale={setLocale} />
                </Col>
              </Row>
            </Card.Footer>
          </Card>
        </Col>
        <Col lg={{size: 3}} md={{size: 2}} sm={{size: 1}}>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginOfficial;
