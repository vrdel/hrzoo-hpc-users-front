import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from './root';
import { PageTitle } from '../components/PageTitle';
import '../styles/content.css';
import {
  Col,
  Row,
  Table,
  Collapse,
  Button,
  InputGroup,
  InputGroupText,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fetchNrProjects } from '../api/projects';
import { useQuery } from '@tanstack/react-query';
import {
  faCopy,
  faArrowDown,
  faKey,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';


const MyRequests = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);

  const {status, data: nrProjects, error, isFetching} = useQuery({
      queryKey: ['projects'],
      queryFn: fetchNrProjects
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname])

  if (nrProjects?.length > 0)
    return (
      <>
        <Row>
          <PageTitle pageTitle={pageTitle}/>
        </Row>
        <Row className="mt-4 ms-1 me-1 mb-5">
          <Col>
            <Table responsive hover className="shadow-sm">
              <thead id="hzsi-thead" className="table-active align-middle text-center text-white">
                <tr className="border-bottom border-2 border-dark">
                  <th className="fw-normal">
                    Šifra
                  </th>
                  <th className="fw-normal">
                    Naziv
                  </th>
                  <th className="fw-normal">
                    Trajanje
                  </th>
                  <th className="fw-normal">
                    Prijava
                  </th>
                  <th className="fw-normal">
                    Tip
                  </th>
                  <th className="fw-normal">
                    Radnje
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  nrProjects.map((project, index) =>
                    <tr key={index}>
                      <td className="p-3 align-middle text-center">
                        { project.croris_identifier }
                      </td>
                      <td className="p-3 align-middle text-center font-monospace" style={{maxLength: '5'}}>
                        { project.name}
                      </td>
                      <td className="align-middle text-center">
                        { project.date_start } { project.date_end}
                      </td>
                      <td className="align-middle text-center">
                        { project.date_submitted }
                      </td>
                      <td className="align-middle text-center">
                        { project.project_type.name }
                      </td>
                      <td className="align-middle text-center">
                        <Button size="sm" color="primary">
                          <FontAwesomeIcon icon={faCopy} />
                        </Button>
                      </td>
                    </tr>
                  )
                }
                {
                  nrProjects.length < 5 && [...Array(5 - nrProjects.length)].map((_, i) =>
                    <tr key={i + 5}>
                      <td colSpan="6" style={{height: '60px', minHeight: '60px'}}>
                      </td>
                    </tr>
                  )
                }
              </tbody>
            </Table>
          </Col>
        </Row>
      </>
    )
};

export default MyRequests;
