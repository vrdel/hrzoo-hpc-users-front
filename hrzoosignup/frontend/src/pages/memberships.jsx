import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from './root';
import { Col, Row, Card, CardHeader, CardBody } from 'reactstrap';
import { PageTitle } from '../components/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { fetchNrProjects } from '../api/projects';
import { TypeString, TypeColor } from '../config/map-projecttypes';



const Memberships = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);

  const {status: nrStatus, data: nrProjects} = useQuery({
      queryKey: ['projects'],
      queryFn: fetchNrProjects
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname])

  if (nrStatus === 'success' && nrProjects) {
    let projectsApproved = nrProjects.filter(project =>
      project.state.name !== 'deny' && project.state.name !== 'submit'
    )

    return (
      <>
        <Row className="mb-5">
          <PageTitle pageTitle={pageTitle}/>
        </Row>
        {
          projectsApproved.length > 0 ?
            projectsApproved.map((project, i) =>
              <Row className="mb-5" key={`row-${i}`}>
                <Col key={`col-${i}`}>
                  <Card className="ms-3" key={`card-${i}`}>
                    <CardHeader className="d-flex justify-content-between">
                      <span className="fs-5 fw-bold text-dark">
                        { project?.name }
                      </span>
                      <span className={`badge fw-normal ${TypeColor(project.project_type.name)}`} >
                        { TypeString(project.project_type.name) }
                      </span>
                    </CardHeader>
                    <CardBody className="mb-1 bg-light">
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            )
          :
            <Row className="mt-3 mb-3">
              <Col className="d-flex align-items-center justify-content-center shadow-sm bg-light border border-danger rounded text-muted text-center p-3 fs-3" style={{height: '400px'}} md={{offset: 1, size: 10}}>
                Nemate prijavljenih sudjelovanja na projektima
              </Col>
            </Row>
        }
      </>
    )
  }
};

export default Memberships;
