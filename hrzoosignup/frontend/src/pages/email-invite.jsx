import React, { useEffect, useState, useContext } from 'react';
import { Col, Row } from 'reactstrap';
import { PageTitle } from '../components/PageTitle';
import { useParams } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../components/AuthContextProvider.jsx';
import { defaultUnAuthnRedirect} from '../config/default-redirect';




const EmailInvitation = ({sessionData=undefined}) => {
  const navigate = useNavigate()
  const { inviteKey } = useParams()
  const { isLoggedIn, setUserdetails } = useContext(AuthContext)
  const location = useLocation()


  useEffect(() => {
    if (!(isLoggedIn || sessionData.active))
      navigate(defaultUnAuthnRedirect, {replace: true, state: {"from": location}})
    else
      sessionData?.userdetails && setUserdetails(sessionData.userdetails)
  }, [sessionData, isLoggedIn])

  if (isLoggedIn || sessionData.active)
    return (
      <>
        <Row>
          <PageTitle pageTitle='Prijava putem pozivnog koda'/>
        </Row>
        <Row>
          <Col>
            { inviteKey }
          </Col>
        </Row>
      </>
    )
};

export default EmailInvitation;

