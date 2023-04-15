import React, { useEffect, useState, useContext } from 'react';
import { Col, Row, Button } from 'reactstrap';
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
  const location = useLocation()

  useEffect(() => {
    if (!(isLoggedIn || sessionData.active))
      navigate(defaultUnAuthnRedirect, {replace: true, state: {"from": location}})
    else {
      sessionData?.userdetails && setUserdetails(sessionData.userdetails)
    }
  }, [sessionData, isLoggedIn])

  if (isLoggedIn || sessionData.active)
    return (
      <>
        <Row>
          <PageTitle pageTitle='Prijava putem pozivnog koda'/>
        </Row>
        <Row>
          <Col>
            <Button color="success" onClick={() => fetchInvite(inviteKey)}>
              Klikni za potvrdu
            </Button>
          </Col>
        </Row>
      </>
    )
  else
    return <NotFound />
};

export default EmailInvitation;

