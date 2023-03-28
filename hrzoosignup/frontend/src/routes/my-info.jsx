import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from '../main';
import { Col, Row } from 'reactstrap';
import { PageTitle } from '../ui/PageTitle';


const MyInfo = () => {
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

export default MyInfo;

