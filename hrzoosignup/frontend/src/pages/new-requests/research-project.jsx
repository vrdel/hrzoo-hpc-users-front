import React from 'react'
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Label,
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCroRIS } from '../../api/croris';
import RequestHorizontalRuler from '../../components/RequestHorizontalRuler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';


const ExtractUsers = ({projectUsers}) => {
  return (
    projectUsers.map((user, i) =>
      <>
        <Badge color="secondary" className="fs-6 mb-2 fw-normal" key={`project-users-${i}`}>
          { user.first_name }
          {' '}
          { user.last_name }
        </Badge>
        {'   '}
      </>
    )
  )
}


const ResearchProjectRequest = () => {
  const {status, data: croRisProjects, error, isFetching} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRIS,
      staleTime: 15 * 60 * 1000
  })
  const navigate = useNavigate()

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
            <Row className="mb-4" key={`row-${i}`}>
              <Col key={`col-${i}`}>
                <Card className="ms-3 bg-success" key={`card-${i}`}>
                  <CardHeader className="fs-5 text-white">
                    { project.title }
                  </CardHeader>
                  <CardBody className="mb-1 bg-white">
                    <Row>
                      <GeneralInfo project={project} />
                      <div className="w-100"></div>
                      <Persons project={project} person_info={person_info} projectsLeadUsers={projectsLeadUsers} />
                      <div className="w-100"></div>
                      <Finance project={project} />
                      <div className="w-100"></div>
                      <Summary project={project} />
                    </Row>
                    <Row className="p-2 text-center">
                      <Col>
                        <Button
                          color="success"
                          className="ms-3"
                          onClick={() => {
                            navigate(`/ui/novi-zahtjev/istrazivacki-projekt/${project.croris_id}`)
                          }}>
                          <FontAwesomeIcon icon={faArrowRight}/>{' '}
                          Odaberi
                        </Button>
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


const GeneralInfo = ({project}) => {
  return (
    <>
      <Col className="text-left fw-bold" md={{size: 2}}>
        Šifra:
      </Col>
      <Col md={{size: 3}}>
        <Label
          htmlFor="projectTime"
          aria-label="projectTime"
          className="mr-1 fw-bold">
          Trajanje:
        </Label>
      </Col>
      <Col md={{size: 3}}>
        <Label
          htmlFor="projectType"
          aria-label="projectType"
          className="mr-1 fw-bold">
          Vrsta:
        </Label>
      </Col>
      <Col md={{size: 4}}>
        <Label
          htmlFor="projectInstitution"
          aria-label="projectInstitution"
          className="mr-1 fw-bold">
          Ustanova:
        </Label>
      </Col>

      <div className="w-100"></div>

      <Col md={{size: 2}}>
        <div className="p-2 fs-6">
          <Badge color="success" className="fw-normal">
            { project.identifier }
          </Badge>
        </div>
      </Col>
      <Col md={{size: 3}}>
        <div className="p-2 fs-5 font-monospace">
          { project.start } &minus; { project.end }
        </div>
      </Col>
      <Col md={{size: 3}}>
        <div className="p-2 fs-6">
          <Badge color="primary" className="fw-normal">
            {project.type}
          </Badge>
        </div>
      </Col>
      <Col md={{size: 4}}>
        <div className="p-2">
          {project.institute.name}<br/>
          <small>{project.institute.class}</small>
        </div>
      </Col>
    </>
  )
}


const Persons = ({project, person_info, projectsLeadUsers}) => {
  return (
    <>
      <Col md={{size: 12}}>
        <Label
          htmlFor="projectPersons"
          aria-label="projectPersons"
          className="mr-1 form-label fw-bold">
          Osobe:
        </Label>
      </Col>

      <Col md={{size: 12}}>
        <div className="p-2">
          <ExtractUsers projectUsers={[person_info, ...projectsLeadUsers[project['croris_id']]]} />
        </div>
      </Col>
    </>
  )
}


const Finance = ({project}) => {
  return (
    <>
      <Col md={{size: 12}}>
        <Label
          htmlFor="projectFinance"
          aria-label="projectFinance"
          className="mr-1 mt-3 form-label fw-bold">
          Financijer:
        </Label>
      </Col>
      <Col md={{size: 12}} className="mb-2">
        <div className="p-2">
          { project.finance }
        </div>
      </Col>
    </>
  )
}


const Summary = ({project}) => {
  return (
    <>
      <Col md={{size: 12}}>
        <Label
          htmlFor="projectSummary"
          aria-label="projectSummary"
          className="mr-1 mt-2 form-label fw-bold">
          Opis:
        </Label>
      </Col>
      <Col md={{size: 12}} className="mb-3">
        <textarea
          id="projectSummary"
          className="form-control fst-italic"
          rows="6"
          defaultValue={
            project.summary
          }
        />
      </Col>
    </>
  )
}


export default ResearchProjectRequest;
