import React, { useEffect, useState, useContext } from 'react';
import { Col, Row, Button, Alert } from 'reactstrap';
import { PageTitle } from '../components/PageTitle';
import { useParams } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../components/AuthContextProvider';
import { defaultUnAuthnRedirect} from '../config/default-redirect';
import NotFound from '../pages/notfound';
import { fetchInvite } from '../api/invite';


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
        <Row>
          <PageTitle pageTitle='Prijava putem pozivnog koda'/>
        </Row>
        <Row>
          <Col>
            <Button color="success" onClick={acceptInvite}>
              Klikni za potvrdu
            </Button>
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
      </>
    )
  else
    return <NotFound />
};

export default EmailInvitation;

