import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from './root';
import { Col, Row } from 'reactstrap';
import { PageTitle } from '../components/PageTitle';


const Memberships = () => {
  const { linkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);

  useEffect(() => {
    setPageTitle(linkTitles[location.pathname])
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

export default Memberships;
