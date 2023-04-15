import React, { useEffect, useState, useContext } from 'react';
import { SharedData } from './root';
import { Col, Row } from 'reactstrap';
import { PageTitle } from '../components/PageTitle';
import { useParams } from 'react-router-dom';


const EmailInvitation = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const { inviteKey } = useParams()

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
    console.log('VRDEL DEBUG', inviteKey)
  }, [location.pathname])

  return (
    <>
      <Row>
        <PageTitle pageTitle={pageTitle}/>
      </Row>
      <Row>
        <Col>
        </Col>
      </Row>
    </>
  )
};

export default EmailInvitation;

