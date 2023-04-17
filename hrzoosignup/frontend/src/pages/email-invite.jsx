import React, { useEffect, useState, useContext } from 'react';
import { Col, Row,
  Button,
  Alert, Container,
  Card, CardHeader,
  CardBody } from 'reactstrap';
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


const EmailInvitation = ({sessionData=undefined}) => {
  const navigate = useNavigate()
  const { inviteKey } = useParams()
  const { isLoggedIn, setUserdetails } = useContext(AuthContext)
  const [inviteAlertFail, setInviteAlertFail] = useState(false);
  const [inviteAlertSuccess, setInviteAlertSucces] = useState(false);
  const [customMessage, setCustomMessage] = useState(undefined);
  const location = useLocation()

  useEffect(() => {
    if (!(isLoggedIn || sessionData.active))
      navigate(defaultUnAuthnRedirect, {replace: true, state: {"from": location}})
    else {
      sessionData?.userdetails && setUserdetails(sessionData.userdetails)
    }
  }, [sessionData, isLoggedIn])

  async function acceptInvite() {
    try {
      const ret = await fetchInvite(inviteKey)
      setInviteAlertSucces(true)
    }
    catch (err) {
      if (err.message.toLowerCase().includes("410 gone")) {
        setCustomMessage('Pozivni kod je iskorišten')
        setInviteAlertFail(true)
      }
      else if (err.message.toLowerCase().includes("duplicate key")) {
        setCustomMessage('Već jeste suradnik na pozvanom projektu')
        setInviteAlertSucces(true)
      }
      else
        setInviteAlertFail(true)
    }
  }

  if (isLoggedIn || sessionData.active)
    return (
      <>
        <Container fluid className="image-background d-flex justify-content-center" style={{minHeight: '100vh'}}>
          <Row>
            <Col>
              <Row style={{'height': '200px'}}/>
              <Card className="shadow-lg pt-2" style={{width: '550px'}}>
                <CardHeader
                  id='hzsi-loginheader'
                  className="d-sm-inline-flex align-items-center justify-content-around"
                >
                  <FontAwesomeIcon icon={faLaptopCode} style={{color: "#c00000"}} size="3x" />
                  <h4 className="text-dark"><strong>Napredno računanje</strong></h4>
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
                        toggle={() => setInviteAlertSucces(false)} fade={false}>
                        <p className="text-center">
                          Prijava uspješna
                        </p>
                      </Alert>
                      <Alert color="danger"
                        isOpen={inviteAlertFail}
                        toggle={() => setInviteAlertFail(false)} fade={false}>
                        <p className="text-center">
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
          </Row>
        </Container>
      </>
    )
  else
    return <NotFound />
};

export default EmailInvitation;

