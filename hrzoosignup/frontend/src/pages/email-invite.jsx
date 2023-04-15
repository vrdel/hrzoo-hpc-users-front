import React, { useEffect, useState, useContext } from 'react';
import { Col, Row } from 'reactstrap';
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
    async function handleInvite() {
      return await fetchInvite(inviteKey)
    }
    if (!(isLoggedIn || sessionData.active))
      navigate(defaultUnAuthnRedirect, {replace: true, state: {"from": location}})
    else {
      sessionData?.userdetails && setUserdetails(sessionData.userdetails)
      handleInvite()
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
            { inviteKey }
          </Col>
        </Row>
      </>
    )
  else
    return <NotFound />
};

export default EmailInvitation;

