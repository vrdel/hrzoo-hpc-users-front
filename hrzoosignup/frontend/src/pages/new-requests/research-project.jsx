import React, { useEffect } from 'react'
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Row,
  Col,
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchCroRISMe } from 'Api/croris';
import { fetchNrProjects } from 'Api/projects';
import RequestHorizontalRuler from 'Components/RequestHorizontalRuler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { GeneralInfo, Persons, Finance, Summary, CrorisUrl } from 'Components/GeneralProjectInfo';
import { defaultUnAuthnRedirect } from 'Config/default-redirect';
import {FormattedMessage} from 'react-intl';


const ResearchProjectRequest = () => {
  const {status, data: croRisProjects, error, isFetching} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRISMe,
      staleTime: 15 * 60 * 1000
  })
  const navigate = useNavigate()

  const {status: nrStatus, data: nrProjects, error: errProjects} = useQuery({
      queryKey: ['projects'],
      queryFn: fetchNrProjects
  })

  function isAlreadySubmitted(crorisId) {
    let existingProjectsIds = nrProjects.map(project => project['croris_id'])
    return existingProjectsIds.indexOf(crorisId) !== -1
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
                <Card className={isAlreadySubmitted(project.croris_id)
                  ? `ms-3 mb-3 bg-secondary` : `ms-3 mb-4 bg-success`}
                  key={`card-${i}`}>
                  <CardHeader className="d-flex fs-5 text-white justify-content-between align-items-center">
                    { project.title }
                    { isAlreadySubmitted(project.croris_id) && <Badge className="fs-5" color="success">prijavljen</Badge>}
                  </CardHeader>
                  <CardBody className={isAlreadySubmitted(project.croris_id) ? "mb-1 bg-light": "mb-1 bg-white"}>
                    <Row>
                      <GeneralInfo project={project} isSubmitted={isAlreadySubmitted(project.croris_id)} />
                      <div className="w-100"></div>
                      <Persons project={project} person_info={person_info} projectsLeadUsers={projectsLeadUsers} />
                      <div className="w-100"></div>
                      <Finance project={project}  />
                      <div className="w-100"></div>
                      <Summary project={project} isSubmitted={isAlreadySubmitted(project.croris_id)} />
                      <div className="w-100"></div>
                      <CrorisUrl project={project} />
                    </Row>
                    {
                      !isAlreadySubmitted(project.croris_id)
                        ?
                          <Row className="p-2 text-center">
                            <Col>
                              <Button
                                color="success"
                                className="ms-3"
                                onClick={() => {
                                  navigate(`/ui/new-request/research-project/${project.croris_id}`)
                                }}>
                                <FontAwesomeIcon icon={faArrowRight}/>{' '}
                                <FormattedMessage
                                  defaultMessage="Odaberi"
                                  description="researchproj-button-label"
                                />
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
  } else {
    return (
      <>
        <RequestHorizontalRuler />
        <Row className="mb-4">
          <Col>
            <Card className="ms-3 mb-4 bg-success">
              <CardHeader className="d-flex fs-5 text-white justify-content-between align-items-center">
                <FormattedMessage
                  defaultMessage="Istraživački projekt"
                  description="researchproj-cardtitle"
                />
              </CardHeader>
              <CardBody className="mb-1 bg-white">
                <Row>
                  <Col className="d-flex justify-content-center align-items-center p-5">
                    <Spinner
                      style={{
                        height: '25rem',
                        width: '25rem',
                        borderColor: '#b04c46',
                        borderRightColor: 'transparent'
                      }}
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </>
    )
  }

};


export default ResearchProjectRequest;
