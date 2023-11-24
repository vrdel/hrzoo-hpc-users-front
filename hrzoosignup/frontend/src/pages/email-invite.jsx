import React, { useEffect, useState, useContext } from 'react';
import { Col, Row,
  Button,
  Alert, Container,
  Card, CardHeader,
  CardBody, Progress } from 'reactstrap';
import { useParams } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../components/AuthContextProvider';
import { defaultUnAuthnRedirect} from '../config/default-redirect';
import NotFound from '../pages/notfound';
import { fetchInvite } from '../api/invite';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLaptopCode,
} from '@fortawesome/free-solid-svg-icons';
import { url_ui_prefix } from '../config/general';


const EmailInvitation = ({sessionData=undefined}) => {
  const navigate = useNavigate()
  const { inviteKey } = useParams()
  const { isLoggedIn, setUserdetails } = useContext(AuthContext)
  const [inviteAlertFail, setInviteAlertFail] = useState(false);
  const [inviteAlertSuccess, setInviteAlertSucces] = useState(false);
  const [customMessage, setCustomMessage] = useState(undefined);
  const [progress, setProgress] = useState(0);

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
        setCustomMessage('Prijava neuspješna: Pozivni kod je iskorišten')
        setInviteAlertFail(true)
      }
      else if (err.message.toLowerCase().includes("already assigned to project")) {
        setCustomMessage('Već jeste sudionik pozvanog projekta')
        setInviteAlertFail(true)
      }
      else if (err.message.toLowerCase().includes("duplicate key")) {
        setCustomMessage('Već jeste suradnik na pozvanom projektu')
        setInviteAlertSucces(true)
      }
      else if (err.message.toLowerCase().includes("lead croris project")) {
        setCustomMessage('Prijava neuspješna: Registrirani ste kao voditelj na istraživačkim projektima u sustavu CroRIS')
        setInviteAlertFail(true)
      }
      else if (err.message.toLowerCase().includes("associate croris project")) {
        setCustomMessage('Prijava neuspješna: Registrirani ste kao suradnik na istraživačkim projektima u sustavu CroRIS')
        setInviteAlertFail(true)
      }
      else if (err.message.toLowerCase().includes("user croris project")) {
        setCustomMessage('Prijava neuspješna: Pristup ste već ostvarili temeljem istraživačkog projekta u sustavu CroRIS')
        setInviteAlertFail(true)
      }
      else if (err.message.toLowerCase().includes("user institute project")) {
        setCustomMessage('Prijava neuspješna: Već ste prijavljeni na jedan institucijski projekt')
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
      navigate(url_ui_prefix + '/clanstva')

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
                  <h4 className="ms-4 text-dark"><strong>Napredno računanje</strong> - <span className="fst-italic">Pozivnica</span></h4>
                </CardHeader>
                <CardBody className="pt-5">
                  <p className="fs-5 mb-4 text-center">
                    Pozvani ste na projekt pri usluzi Napredno računanje, potvrdom
                    ujedno potvrđujete da prihvaćate{' '}
                    <a href="https://www.srce.unizg.hr/napredno-racunanje/pravila" target="_blank" rel="noopener noreferrer">
                      Pravila korištenja usluge Napredno računanje
                    </a>
                  </p>
                  <Row>
                    <Col className="d-flex align-items-center justify-content-around">
                      <Button className="text-center" size="lg" color="success" onClick={acceptInvite}>
                        Potvrđujem
                      </Button>
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col>
                      <Alert color="success"
                        isOpen={inviteAlertSuccess}
                        toggle={() => {
                          setInviteAlertSucces(!inviteAlertSuccess)
                          setTimeout(() => {navigate(url_ui_prefix + '/clanstva')}, 800)
                        }}
                        fade={true}>
                        <p className="text-center fs-5">
                          Prijava uspješna, preusmjeravanje...
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
                              "Prijava neuspješna"
                          }
                        </p>
                      </Alert>
                    </Col>
                  </Row>
                </CardBody>
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

