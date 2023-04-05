import React from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Label,
} from 'reactstrap';
import { useQuery } from '@tanstack/react-query';
import { fetchCroRIS } from '../../api/croris';
import RequestHorizontalRuler from '../../components/RequestHorizontalRuler';

const ExtractUsers = ({projectUsers}) => {
  console.log('VRDEL DEBUG', projectUsers)
  return (
    projectUsers.map((user, i) =>
      <div key={`project-users-${i}`}>
        <span>
          { user.first_name }
        </span>
        {' '}
        <span>
          { user.last_name }
        </span>
      </div>
    )
  )
}


const ResearchProjectRequest = () => {
  const {status, data: croRisProjects, error, isFetching} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRIS,
      staleTime: 15 * 60 * 1000
  })

  if (status ==='success'
    && croRisProjects['status']['code'] === 200
    && croRisProjects['data'])
  {
    let projectsLead = croRisProjects['data']['projects_lead_info']
    let projectsLeadUsers = croRisProjects['data']['projects_lead_users']
    let person_info = croRisProjects['data']['person_info']

    return (
      <>
        <RequestHorizontalRuler />
        {
          projectsLead.map((project, i) =>
            <Row key={`row-${i}`}>
              <Col key={`col-${i}`}>
                <Card className="ms-2 me-2" key={`card-${i}`}>
                  <CardHeader className="fw-bold">
                    { project.title }
                  </CardHeader>
                  <CardBody className="mb-1">
                    <Row>
                      <Col className="text-left" md={{size: 2}}>
                        Šifra:
                      </Col>
                      <Col md={{size: 2}}>
                        <Label
                          htmlFor="projectPersons"
                          aria-label="projectPersons"
                          className="mr-1 form-label text-center">
                          Osobe:
                        </Label>
                      </Col>
                      <Col md={{size: 2}}>
                        <Label
                          htmlFor="projectTime"
                          aria-label="projectTime"
                          className="mr-1 form-label text-center">
                          Trajanje:
                        </Label>
                      </Col>
                      <Col md={{size: 2}}>
                        <Label
                          htmlFor="projectType"
                          aria-label="projectType"
                          className="mr-1 form-label text-center">
                          Vrsta:
                        </Label>
                      </Col>
                      <Col md={{size: 2}}>
                        <Label
                          htmlFor="projectInstitution"
                          aria-label="projectInstitution"
                          className="mr-1 form-label text-center">
                          Ustanova:
                        </Label>
                      </Col>
                      <Col md={{size: 2}}>
                        <Label
                          htmlFor="projectFinance"
                          aria-label="projectFinance"
                          className="mr-1 form-label text-center">
                          Financijer:
                        </Label>
                      </Col>

                      <div className="w-100"></div>

                      <Col md={{size: 2}}>
                        <div className="p-2 border rounded">
                          { project.identifier }
                        </div>
                      </Col>
                      <Col md={{size: 2}}>
                        <div className="p-2 border rounded">
                          <ExtractUsers projectUsers={[person_info, ...projectsLeadUsers[project['croris_id']]]} />
                        </div>
                      </Col>
                      <Col md={{size: 2}}>
                        <div className="p-2 border rounded">
                          { project.start }<br/>{ project.end }
                        </div>
                      </Col>
                      <Col md={{size: 2}}>
                        <div className="p-2 border rounded">
                          {project.type}
                        </div>
                      </Col>
                      <Col md={{size: 2}}>
                        <div className="p-2 border rounded">
                          {project.institute.class}<br/>
                          {project.institute.name}
                        </div>
                      </Col>
                      <Col md={{size: 2}}>
                        <div className="p-2 border rounded">
                          {project.finance}<br/>
                        </div>
                      </Col>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          )
        }
      </>
    )
  }
};

export default ResearchProjectRequest;
