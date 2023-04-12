import React, { useContext, useState, useEffect } from 'react';
import RequestHorizontalRuler, { RequestHorizontalRulerRed } from '../components/RequestHorizontalRuler';
import GeneralFields from '../components/fields-request/GeneralFields';
import { SharedData } from './root';
import { Col, Label, Row, Table, Tooltip, Button, Form } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../components/PageTitle';
import { StateIcons, StateString } from '../config/map-states';
import { fetchAllNrProjects, fetchNrSpecificProject } from '../api/projects';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ScientificSoftware from '../components/fields-request/ScientificSoftware';
import { TypeString, TypeColor } from '../config/map-projecttypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave,
  faCog,
  faTimes,
  faFile,
  faCheck,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { convertToEuropean } from '../utils/dates';
import { useParams } from 'react-router-dom';
import {
  useForm,
  Controller,
  useFormContext,
  FormProvider,
} from "react-hook-form";
import ResourceFields from '../components/fields-request/ResourceFields';


function extractLeaderName(projectUsers) {
  let target = projectUsers.filter(user => (
    user['role']['name'] === 'lead'
  ))
  target = target[0]

  return target.user.first_name + ' ' + target.user.last_name
}


export const ManageRequestsChange = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const [projectTarget, setProjectTarget] = useState(undefined)
  const { projId } = useParams()
  const [disabledFields, setDisabledFields] = useState(true)

  const {status, data: nrProject, error, isFetching} = useQuery({
      queryKey: ['change-project', projId],
      queryFn: () => fetchNrSpecificProject(projId),
  })

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
      scientificSoftware: '',
      scientificSoftwareExtra: '',
      scientificSoftwareHelp: ''
    }
  });

  useEffect(() => {
    if (status === 'success' && nrProject) {
      rhfProps.setValue('requestName', nrProject.name)
      rhfProps.setValue('requestExplain', nrProject.reason)
      rhfProps.setValue('startDate', nrProject.date_start)
      rhfProps.setValue('endDate', nrProject.date_end)
      rhfProps.setValue('scientificDomain', nrProject.science_field)
      rhfProps.setValue('scientificSoftware', nrProject.science_software.map(e => (
        {
          'label' : e,
          'value' : e
        }
      )))
      rhfProps.setValue('scientificSoftwareExtra', nrProject.science_extrasoftware)
      rhfProps.setValue('scientificSoftwareHelp', nrProject.science_extrasoftware_help)
      rhfProps.setValue('nSlotsCPU', nrProject.resources_numbers.nSlotsCPU)
      rhfProps.setValue('nSlotsGPU', nrProject.resources_numbers.nSlotsGPU)
      rhfProps.setValue('nRAM', nrProject.resources_numbers.nSlotsRAM)
      rhfProps.setValue('nTempGB', nrProject.resources_numbers.nTempGB)
      rhfProps.setValue('nDiskGB', nrProject.resources_numbers.nDiskGB)
      rhfProps.setValue('requestResourceType', nrProject.resources_type)
    }

    console.log('VRDEL DEBUG', nrProject)
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname, nrProject])

  const onSubmit = data => {
    alert(JSON.stringify(data, null, 2));
  }

  if (nrProject) {
    return (
      <>
        <Row>
          <PageTitle pageTitle={pageTitle}/>
        </Row>
        <Row>
          <Col>
            <FormProvider {...rhfProps}>
              <Form onSubmit={rhfProps.handleSubmit(onSubmit)} className="needs-validation">
                <GeneralFields fieldsDisabled={disabledFields} />
                <ScientificSoftware fieldsDisabled={disabledFields} />
                <ResourceFields fieldsDisabled={disabledFields} />
                <Row style={{height: '50px'}}>
                </Row>
                <RequestHorizontalRulerRed />
                <ProcessRequest disabledFields={disabledFields} setDisabledFields={setDisabledFields} />

              </Form>
            </FormProvider>
          </Col>
        </Row>
      </>
    )
  }
};


const ProcessRequest = ({disabledFields, setDisabledFields}) => {
  const { control, formState: {errors} } = useFormContext();

  return (
    <>
      <Row>
        <Col md={{size: 10}}>
          <span className="ps-2 pe-2 pt-1 pb-1 text-white fs-3 ms-4 mb-4 mt-4" style={{backgroundColor: "#b04c46"}}>
            Obrada:
          </span>
        </Col>
        <Col>
          <Button color="danger" onClick={() => setDisabledFields(!disabledFields)}>
            Editiraj zahtjev
          </Button>
        </Col>
      </Row>
      <Row>
        <Col className="text-left" md={{size: 10}}>
          <Label
            htmlFor="projectTitle"
            aria-label="projectTitle">
          </Label>
        </Col>
      </Row>
      <Row style={{'height': '100px'}}/>
      <Row className="mt-2 mb-5 text-center">
        <Col>
          <FontAwesomeIcon className="fa-5x text-success" style={{color: '#00ff00'}} icon={faCheck}/>{' '}
          <br/>
          <p className="fs-3">
            Prihvati
          </p>
          <Button style={{height: '50px', width: '50px'}} outline color="success"/>
        </Col>
        <Col>
          <FontAwesomeIcon className="fa-5x text-warning" style={{color: '#00ff00'}} icon={faCog}/>{' '}
          <br/>
          <p className="fs-3">
            Obrada
          </p>
          <Button style={{height: '50px', width: '50px'}} outline color="success"/>
        </Col>
        <Col>
          <FontAwesomeIcon className="fa-5x text-danger" style={{color: '#ff0000'}} icon={faTimes}/>{' '}
          <br/>
          <p className="fs-3">
            Odbij
          </p>
          <Button style={{height: '50px', width: '50px'}} outline color="success"/>
        </Col>
      </Row>
      <Row style={{'height': '100px'}}/>
      <Row className="mt-5 mb-5 text-center">
        <Col>
          <Button size="lg" color="success" id="submit-button" type="submit">
            <FontAwesomeIcon icon={faSave}/>{' '}
            Spremi promjene
          </Button>
        </Col>
      </Row>
    </>
  )
}


export const ManageRequestsList = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const navigate = useNavigate()

  const {status, data: nrProjects, error, isFetching} = useQuery({
      queryKey: ['all-projects'],
      queryFn: fetchAllNrProjects
  })

  const [tooltipOpened, setTooltipOpened] = useState(undefined);
  const showTooltip = (toolid) => {
    let showed = new Object()
    if (tooltipOpened === undefined && toolid) {
      showed[toolid] = true
      setTooltipOpened(showed)
    }
    else {
      showed = JSON.parse(JSON.stringify(tooltipOpened))
      showed[toolid] = !showed[toolid]
      setTooltipOpened(showed)
    }
  }
  const isOpened = (toolid) => {
    if (tooltipOpened !== undefined)
      return tooltipOpened[toolid]
  }

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname])

  if (nrProjects?.length > 0)
    return (
      <>
        <Row>
          <PageTitle pageTitle={pageTitle}/>
        </Row>
        <Row className="mt-4">
          <Col>
            <Table responsive hover className="shadow-sm">
              <thead id="hzsi-thead" className="table-active align-middle text-center text-white">
                <tr className="border-bottom border-2 border-dark">
                  <th className="fw-normal">
                    Stanje
                  </th>
                  <th className="fw-normal">
                    Tip
                  </th>
                  <th className="fw-normal">
                    Naziv
                  </th>
                  <th className="fw-normal">
                    Voditelj
                  </th>
                  <th className="fw-normal">
                    Završetak
                  </th>
                  <th className="fw-normal">
                    Podnesen
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
                      <td className="p-3 align-middle text-center" id={'Tooltip-' + index}>
                        { StateIcons(project.state.name) }
                        <Tooltip
                          placement='top'
                          isOpen={isOpened(project.identifier)}
                          target={'Tooltip-' + index}
                          toggle={() => showTooltip(project.identifier)}
                        >
                          { StateString(project.state.name) }
                        </Tooltip>
                      </td>
                      <td className="align-middle text-center">
                        <span className={`badge ${TypeColor(project.project_type.name)}`} >
                          { TypeString(project.project_type.name) }
                        </span>
                      </td>
                      <td className="p-3 align-middle fw-bold text-center">
                        { project.name}
                      </td>
                      <td className="p-3 align-middle text-center">
                        { extractLeaderName(project.userproject_set) }
                      </td>
                      <td className="align-middle text-center fs-6 font-monospace">
                        { convertToEuropean(project.date_end) }
                      </td>
                      <td className="align-middle text-center fs-6 font-monospace">
                        { convertToEuropean(project.date_submitted) }
                      </td>
                      <td className="align-middle text-center">
                        <Button color="light" onClick={() => navigate(project.identifier)}>
                          <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </Button>
                      </td>
                    </tr>
                  )
                }
                {
                  nrProjects.length < 5 && [...Array(5 - nrProjects.length)].map((_, i) =>
                    <tr key={i + 5}>
                      <td colSpan="7" style={{height: '60px', minHeight: '60px'}}>
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
