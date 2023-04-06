import React from 'react';
import { useParams } from 'react-router-dom';
import {
  useForm,
  FormProvider,
} from "react-hook-form";
import RequestHorizontalRuler from '../../components/RequestHorizontalRuler';
import {
  Badge,
  Button,
  Col,
  Form,
  Input,
  Label,
  Row,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile,
} from '@fortawesome/free-solid-svg-icons';
import { fetchCroRIS } from '../../api/croris';
import { useQuery } from '@tanstack/react-query';
import ResourceFields from '../../components/fields-request/ResourceFields';
import BaseNewScientificDomain from '../../components/fields-request/ScientificDomain';
import ScientificSoftware from '../../components/fields-request/ScientificSoftware';


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


const ResearchProjectRequestSelected = () => {
  const { projId } = useParams()
  const rhfProps = useForm({
    defaultValues: {
      requestName: '',
      requestExplain: '',
      startDate: '',
      endDate: '',
      requestResourceType: '',
      nSlotsCPU: '', nSlotsGPU: '', nRAM: '', nTempGB: '', nDiskGB: '',
      scientificDomain: [
        {
          'name': '',
          'percent': '',
          'scientificfields': [
            {
              'name': '', 'percent': ''
            }
          ]
        },
      ],
      scientificSoftware: ''
    }
  });


  const {status, data: croRisProjects, error, isFetching} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRIS,
      staleTime: 15 * 60 * 1000
  })

  const onSubmit = data => {
    console.log('VRDEL DEBUG', data)
    alert(JSON.stringify(data, null, 2));
  }

  if (status ==='success'
    && croRisProjects['status']['code'] === 200
    && croRisProjects['data'])
  {
    let projectsLead = croRisProjects['data']['projects_lead_info']
    let projectTarget = projectsLead.filter(project =>
      project['croris_id'] === Number(projId)
    )
    let projectsLeadUsers = croRisProjects['data']['projects_lead_users'][projId]
    let person_info = croRisProjects['data']['person_info']
    return (
      <FormProvider {...rhfProps}>
        <Form onSubmit={rhfProps.handleSubmit(onSubmit)} className="needs-validation">
          <RequestHorizontalRuler />
          <Row>
            <Col>
              <h4 className="ms-4 mb-3 mt-4">Opći dio</h4><br/>
            </Col>
          </Row>
          <Row>
            <Col md={{size: 10, offset: 1}}>
              <GeneralInfo
                project={projectTarget[0]}
                person_info={person_info}
                projectsLeadUsers={projectsLeadUsers}
              />
            </Col>
          </Row>
          <BaseNewScientificDomain />
          <ScientificSoftware />
          <ResourceFields />
          <Row>
            <RequestHorizontalRuler />
            <Row className="mt-2 mb-2 text-center">
              <Col>
                <Button size="lg" color="success" id="submit-button" type="submit">
                  <FontAwesomeIcon icon={faFile}/>{' '}
                  Podnesi zahtjev
                </Button>
              </Col>
            </Row>
          </Row>
        </Form>
      </FormProvider>
    )
  }
};


const GeneralInfo = ({project, person_info, projectsLeadUsers}) => {
  return (
    <>
      <Row>
        <Col className="text-left" md={{size: 10}}>
          <Label
            htmlFor="projectTitle"
            aria-label="projectTitle">
            Naziv:
          </Label>
        </Col>
        <Col className="text-left" md={{size: 2}}>
          <Label
            htmlFor="projectIdentifier"
            aria-label="projectIdentifier">
            Šifra:
          </Label>
        </Col>
        <div className="w-100"/>
        <Col md={{size: 10}}>
          <textarea
            id="requestName"
            aria-label="requestName"
            type="text"
            disabled={true}
            className="form-control fs-5"
            defaultValue={project.title}
            rows="1"
          />
        </Col>
        <Col md={{size: 2}}>
          <div className="p-2 fs-5">
            <Badge color="secondary" className="fw-normal">
              { project.identifier }
            </Badge>
          </div>
        </Col>

      </Row>
      <Row className="mt-3">
        <Col md={{size: 4}}>
          <Label
            htmlFor="projectTime"
            aria-label="projectTime"
            className="mr-1">
            Period korištenja:
          </Label>
        </Col>
        <Col md={{size: 8}}>
          <Label
            htmlFor="projectTime"
            aria-label="projectTime"
            className="mr-1">
            Osobe:
          </Label>
        </Col>
        <div className="w-100"/>
        <Col md={{size: 4}}>
          <Input
            disabled={true}
            className="p-2 fs-5 font-monospace"
            defaultValue={`${project.start} − ${ project.end }`}
          />
        </Col>
        <Col md={{size: 8}}>
          <div className="p-2">
            <ExtractUsers projectUsers={[person_info, ...projectsLeadUsers]} />
          </div>
        </Col>
      </Row>
    </>
  )
}

export default ResearchProjectRequestSelected;

