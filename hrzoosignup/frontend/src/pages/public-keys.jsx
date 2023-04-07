import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from './root';
import { Col, Row, Table } from 'reactstrap';
import { PageTitle } from '../components/PageTitle';


const PublicKeys = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname])

  return (
    <>
      <Row>
        <PageTitle pageTitle={pageTitle}/>
      </Row>
      <Row className="mt-4 ms-4 me-4 mb-3">
        <Col>
          <Table bordered responsive hover size="sm">
            <thead className="table-active table-bordered align-middle text-center">
              <tr>
                <th>
                  Ime kljuca
                </th>
                <th>
                  Digitalni otisak ključa
                </th>
                <th>
                  Tip
                </th>
                <th style={{'width': '60px'}}>
                  Akcije
                </th>
              </tr>
            </thead>
            <tbody>
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  )
};

export default PublicKeys;
