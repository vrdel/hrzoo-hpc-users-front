import React, { useEffect, useState, useContext } from 'react';
import { Col, Row,
  Button,
  Alert, Container,
  Card, CardHeader,
  CardBody, CardFooter, Progress } from 'reactstrap';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from 'Components/AuthContextProvider';
import { defaultUnAuthnRedirect} from 'Config/default-redirect';
import NotFound from 'Pages/notfound';
import { fetchInvite } from 'Api/invite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLaptopCode,
} from '@fortawesome/free-solid-svg-icons';
import { url_ui_prefix } from 'Config/general';
import { IntlContext } from 'Components/IntlContextProvider';
import { FormattedMessage, useIntl } from 'react-intl'
import { LanguageButtonLogin } from 'Components/LocaleButton';


const EmailInvitation = ({sessionData=undefined}) => {
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
        <Container fluid className="image-background d-flex justify-content-center" style={{minHeight: '100vh'}}>
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
                  <FontAwesomeIcon icon={faLaptopCode} style={{color: "#c00000"}} size="3x" />
                  <h4 className="ms-4 text-dark">
                    <strong>
                      <FormattedMessage
                        defaultMessage="Napredno računanje"
                        description="email-invite-cardtitle-1"
                      />
                    </strong> - {' '}
                    <span className="fst-italic">
                      <FormattedMessage
                        defaultMessage="Pozivnica"
                        description="email-invite-cardtitle-2"
                      />
                    </span>
                  </h4>
                </CardHeader>
                <CardBody className="pt-5">
                  <p className="fs-5 mb-4 text-center">
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
                      <Button className="text-center" size="lg" color="success" onClick={acceptInvite}>
                        <FormattedMessage
                          defaultMessage="Potvrđujem"
                          description="email-invite-accept"
                        />
                      </Button>
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col>
                      <Alert color="success"
                        isOpen={inviteAlertSuccess}
                        toggle={() => {
                          setInviteAlertSucces(!inviteAlertSuccess)
                          setTimeout(() => {navigate(url_ui_prefix + '/memberships')}, 800)
                        }}
                        fade={true}>
                        <p className="text-center fs-5">
                          <FormattedMessage
                            defaultMessage="Prijava uspješna, preusmjeravanje..."
                            description="email-invite-success"
                          />
                        </p>
                        <Progress
                          striped
                          color="success"
                          animated
                          value={progress}
                        />
                      </Alert>
                      <Alert color="danger" className="d-flex align-items-center justify-content-center"
                        isOpen={inviteAlertFail}
                        toggle={() => setInviteAlertFail(!inviteAlertFail)} fade={true}>
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
                </CardBody>
                <CardFooter className="bg-transparent d-flex align-items-center justify-content-center">
                  <Row className="m-1">
                    <Col>
                      <LanguageButtonLogin locale={locale} setLocale={setLocale} small={true} />
                    </Col>
                  </Row>
                </CardFooter>
              </Card>
            </Col>
            <Col lg={{size: 3}} md={{size: 2}} sm={{size: 1}}>
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

