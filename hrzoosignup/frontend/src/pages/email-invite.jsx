import React, { useEffect, useState, useContext } from 'react';
import { Col, Row,
  Button,
  Alert, Container,
  Card, ProgressBar } from 'react-bootstrap';
import { useParams, useNavigate  } from 'react-router';
import { AuthContext } from 'Components/AuthContextProvider';
import { defaultUnAuthnRedirect} from 'Config/default-redirect';
import NotFound from 'Pages/notfound';
import { fetchInvite } from 'Api/invite';
import { url_ui_prefix } from 'Config/general';
import { IntlContext } from 'Components/IntlContextProvider';
import { FormattedMessage, useIntl } from 'react-intl'
import { LanguageButtonLogin } from 'Components/LocaleButton';
import SrceLogoHead from 'Assets/srce-logo-head.svg';
import SrceLogoHeadEn from 'Assets/srce-logo-head-en.svg';
import Cookies from 'js-cookie';


const EmailInvitation = ({sessionData=undefined, lang=undefined}) => {
  const navigate = useNavigate()
  const { inviteKey } = useParams()
  const { isLoggedIn, setUserdetails } = useContext(AuthContext)
  const [inviteAlertFail, setInviteAlertFail] = useState(false);
  const [inviteAlertSuccess, setInviteAlertSucces] = useState(false);
  const [customMessage, setCustomMessage] = useState(undefined);
  const [progress, setProgress] = useState(0);
  const { locale, setLocale } = useContext(IntlContext)
  const intl = useIntl()

  useEffect(() => {
    localStorage.setItem('invitation-key-set', inviteKey)
    if (!(isLoggedIn || sessionData.active))
      navigate(defaultUnAuthnRedirect)
    else {
      sessionData?.userdetails && setUserdetails(sessionData.userdetails)
      if (lang === 'en') {
        setLocale('en')
        Cookies.set('hzsi-lang', 'en')
      }
   }
  }, [sessionData, isLoggedIn])

  async function acceptInvite() {
    try {
      localStorage.removeItem('invitation-key-set')
      const ret = await fetchInvite(inviteKey)
      setInviteAlertSucces(true)
      startTimer()
    }
    catch (err) {
      if (err.message.toLowerCase().includes("invitation code already used")) {
        setCustomMessage(intl.formatMessage({
          defaultMessage: "Prijava neuspješna: Pozivni kod je iskorišten",
          description: "email-invite-code-used"
        }))
        setInviteAlertFail(true)
      }
      else if (err.message.toLowerCase().includes("invitation code expired")) {
        setCustomMessage(intl.formatMessage({
          defaultMessage: "Prijava neuspješna: Pozivni kod je istekao",
          description: "email-invite-code-expired"
        }))
        setInviteAlertFail(true)
      }
      else if (err.message.toLowerCase().includes("invitation for foreign collaborators")) {
        setCustomMessage(intl.formatMessage({
          defaultMessage: "Prijava neuspješna: Pozivnica je namijenjena stranim suradnicima koji se autenticiraju eduGAIN-om",
          description: "email-invite-fail-edugain"
        }))
        setInviteAlertFail(true)
      }
      else if (err.message.toLowerCase().includes("invitation for local collaborators")) {
        setCustomMessage(intl.formatMessage({
          defaultMessage: "Prijava neuspješna: Pozivnica je namijenjena domaćim suradnicima koji se autenticiraju s regularnim AAI@EduHR",
          description: "email-invite-fail-local-edugain"
        }))
        setInviteAlertFail(true)
      }
      else if (err.message.toLowerCase().includes("already assigned to project")) {
        setCustomMessage(intl.formatMessage({
          defaultMessage: 'Već jeste sudionik pozvanog projekta',
          description: "email-invite-already-assigned-1"
        }))
        setInviteAlertFail(true)
      }
      else if (err.message.toLowerCase().includes("duplicate key")) {
        setCustomMessage(intl.formatMessage({
          defaultMessage: "Već jeste suradnik na pozvanom projektu",
          description: "email-invite-already-assigned-2"
        }))
        setInviteAlertSucces(true)
      }
      else if (err.message.toLowerCase().includes("lead croris project")) {
        setCustomMessage(intl.formatMessage({
          defaultMessage: "Prijava neuspješna: Registrirani ste kao voditelj na istraživačkim projektima u sustavu CroRIS",
          description: "email-invite-registered-leader-croris"
        }))
        setInviteAlertFail(true)
      }
      else if (err.message.toLowerCase().includes("associate croris project")) {
        setCustomMessage(intl.formatMessage({
          defaultMessage: "Prijava neuspješna: Registrirani ste kao suradnik na istraživačkim projektima u sustavu CroRIS",
          description: "email-invite-registered-associate-croris"
        }))
        setInviteAlertFail(true)
      }
      else if (err.message.toLowerCase().includes("user croris project")) {
        setCustomMessage( intl.formatMessage({
          defaultMessage: "Prijava neuspješna: Pristup ste već ostvarili temeljem istraživačkog projekta u sustavu CroRIS",
          description: "email-invite-fail-access-already-granted-research-project"
        }) )
        setInviteAlertFail(true)
      }
      else if (err.message.toLowerCase().includes("user institute project")) {
        setCustomMessage(intl.formatMessage({
          defaultMessage: "Prijava neuspješna: Već ste prijavljeni na jedan institucijski projekt",
          description: "email-invite-fail-already-institutional"
        }))
        setInviteAlertFail(true)
      }
      else
        setInviteAlertFail(true)
    }
  }

  const startTimer = () => {
    const intervalId = setInterval(() => {
      setProgress(progress => progress + 7);
    }, 100)
  };

  if (isLoggedIn || sessionData.active) {
    if (progress === 140)
      navigate(url_ui_prefix + '/memberships')

    return (
      <>
        <Container fluid className={`image-background-${locale} d-flex justify-content-center`} style={{minHeight: '100vh'}}>
          <Row>
            <Col lg={{span: 3}} md={{span: 2}} sm={{span: 1}}>
            </Col>
            <Col lg={{span: 6}} md={{span: 8}}>
              <Row className="m-lg-4 p-lg-4 m-md-3 p-md-3 m-sm-1 p-sm-1"/>
              <Card className="shadow-lg">
                <Card.Header
                  id='hzsi-loginheader'
                  className="p-3 d-flex flex-row align-items-center justify-content-center"
                >
                  <span className="pl-3 font-weight-bold text-center">
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
                  </span>
                </Card.Header>
                <Card.Body className="pt-5">
                  <h4>
                    <span className="fst-italic fw-bold">
                      <FormattedMessage
                        defaultMessage="Pozivnica:"
                        description="email-invite-cardtitle-2"
                      />
                    </span>
                  </h4>
                  <p className="fs-5 mt-3 mb-4 text-center">
                    <FormattedMessage
                      defaultMessage="Pozvani ste na projekt pri usluzi Napredno računanje, potvrdom
                                      ujedno potvrđujete da prihvaćate"
                      description="email-invite-cardbody"
                    />
                    {' '}
                    <a href="https://www.srce.unizg.hr/napredno-racunanje/pravila" target="_blank" rel="noopener noreferrer">
                      <FormattedMessage
                        defaultMessage="Pravila korištenja usluge Napredno računanje"
                        description="loginoffical-terms"
                      />
                    </a>
                  </p>
                  <Row>
                    <Col className="d-flex align-items-center justify-content-around">
                      <Button className="text-center" size="lg" variant="success" onClick={acceptInvite}>
                        <FormattedMessage
                          defaultMessage="Potvrđujem"
                          description="email-invite-accept"
                        />
                      </Button>
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col>
                      <Alert variant="success"
                        show={inviteAlertSuccess}
                        onClose={() => {
                          setInviteAlertSucces(!inviteAlertSuccess)
                          setTimeout(() => {navigate(url_ui_prefix + '/memberships')}, 800)
                        }}
                        dismissible
                        transition={true}>
                        <p className="text-center fs-5">
                          <FormattedMessage
                            defaultMessage="Prijava uspješna, preusmjeravanje..."
                            description="email-invite-success"
                          />
                        </p>
                        <ProgressBar
                          striped
                          variant="success"
                          animated
                          now={progress}
                        />
                      </Alert>
                      <Alert variant="danger" className="d-flex align-items-center justify-content-center"
                        show={inviteAlertFail}
                        onClose={() => setInviteAlertFail(!inviteAlertFail)} dismissible
                        transition={true}>
                        <p className="text-center fs-5">
                          {
                            customMessage ?
                              customMessage
                            :
                              intl.formatMessage({
                                defaultMessage: "Prijava neuspješna",
                                description: "email-invite-failed"
                              })
                          }
                        </p>
                      </Alert>
                    </Col>
                  </Row>
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
            <Col lg={{span: 3}} md={{span: 2}} sm={{span: 1}}>
            </Col>
          </Row>
        </Container>
      </>
    )
  }
  else
    return <NotFound />
};

export default EmailInvitation;
