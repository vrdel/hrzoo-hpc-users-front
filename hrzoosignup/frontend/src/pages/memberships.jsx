import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from './root';
import { Col, Row, Card, CardHeader, CardBody, Label, Badge } from 'reactstrap';
import { PageTitle } from '../components/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { fetchNrProjects } from '../api/projects';
import { TypeString, TypeColor } from '../config/map-projecttypes';
import { GeneralInfo, Persons, Finance, Summary } from '../components/GeneralProjectInfo';
import { convertToEuropean, convertTimeToEuropean } from '../utils/dates';


const BriefProjectInfo = ({project}) => {
  return (
    <>
      <Col className="text-left" md={{size: 2}}>
        Šifra:
      </Col>
      <Col md={{size: 3}}>
        <Label
          htmlFor="projectTime"
          aria-label="projectTime"
          className="mr-1">
          Trajanje:
        </Label>
      </Col>
      <Col md={{size: 4}}>
        <Label
          htmlFor="projectInstitution"
          aria-label="projectInstitution"
          className="mr-1">
          Ustanova:
        </Label>
      </Col>

      <div className="w-100"></div>

      <Col md={{size: 2}}>
        <div className="p-2">
          <Badge color={"secondary fw-normal"}>
            { project.identifier }
          </Badge>
        </div>
      </Col>
      <Col md={{size: 3}}>
        <div className="p-2 fs-5 font-monospace">
          { convertToEuropean(project.date_start) } &minus; { convertToEuropean(project.date_end) }
        </div>
      </Col>
      <Col md={{size: 4}}>
        <div className="p-2">
          {project?.institute}<br/>
        </div>
      </Col>
    </>
  )
}


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
                  <Card className="ms-3 border-0 bg-light shadow-sm" key={`card-${i}`}>
                    <CardHeader className="d-flex border-0 justify-content-between">
                      <span className="fs-5 text-dark fw-bold">
                        { project?.name }
                      </span>
                      <span className={`badge fw-normal ${TypeColor(project.project_type.name)}`} >
                        { TypeString(project.project_type.name) }
                      </span>
                    </CardHeader>
                    <CardBody className="border-0 bg-light">
                      <Row>
                        <BriefProjectInfo project={project} />
                      </Row>
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
