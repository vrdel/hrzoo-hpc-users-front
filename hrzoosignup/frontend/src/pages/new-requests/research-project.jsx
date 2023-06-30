import React from 'react'
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCroRIS } from '../../api/croris';
import { fetchNrProjects } from '../../api/projects';
import RequestHorizontalRuler from '../../components/RequestHorizontalRuler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { GeneralInfo, Persons, Finance, Summary } from '../../components/GeneralProjectInfo';
import { defaultUnAuthnRedirect } from '../../config/default-redirect';


const ResearchProjectRequest = () => {
  const {status, data: croRisProjects, error, isFetching} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRIS,
      staleTime: 15 * 60 * 1000
  })
  const navigate = useNavigate()

  const {status: nrStatus, data: nrProjects, error: errProjects} = useQuery({
      queryKey: ['projects'],
      queryFn: fetchNrProjects
  })

  function isAlreadySubmitted(projId) {
    let existingProjectsIds = nrProjects.map(project => project['croris_identifier'])
    return existingProjectsIds.indexOf(projId) !== -1
  }

  useEffect(() => {
    if (nrStatus === 'error' && errProjects.message.includes('403'))
      navigate(defaultUnAuthnRedirect)
  }, [nrStatus])


  if (status === 'success' && nrStatus === 'success'
    && croRisProjects['status']['code'] === 200
    && croRisProjects['data'] && nrProjects)
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
                <Card className={isAlreadySubmitted(project.identifier)
                  ? `ms-3 mb-3 bg-secondary` : `ms-3 mb-4 bg-success`}
                  key={`card-${i}`}>
                  <CardHeader className="d-flex fs-5 text-white justify-content-between align-items-center">
                    { project.title }
                    { isAlreadySubmitted(project.identifier) && <Badge className="fs-5" color="success">prijavljen</Badge>}
                  </CardHeader>
                  <CardBody className={isAlreadySubmitted(project.identifier) ? "mb-1 bg-light": "mb-1 bg-white"}>
                    <Row>
                      <GeneralInfo project={project} isSubmitted={isAlreadySubmitted(project.identifier)} />
                      <div className="w-100"></div>
                      <Persons project={project} person_info={person_info} projectsLeadUsers={projectsLeadUsers} />
                      <div className="w-100"></div>
                      <Finance project={project}  />
                      <div className="w-100"></div>
                      <Summary project={project} isSubmitted={isAlreadySubmitted(project.identifier)} />
                    </Row>
                    {
                      !isAlreadySubmitted(project.identifier)
                        ?
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
                        : ''
                    }
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
