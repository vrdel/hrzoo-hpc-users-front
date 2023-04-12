import React, { useContext, useState, useEffect } from 'react';
import RequestHorizontalRuler from '../components/RequestHorizontalRuler';
import GeneralFields from '../components/fields-request/GeneralFields';
import { SharedData } from './root';
import { Col, Label, Row, Table, Tooltip, Button, Form } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../components/PageTitle';
import { StateIcons, StateString } from '../config/map-states';
import { fetchAllNrProjects } from '../api/projects';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ScientificSoftware from '../components/fields-request/ScientificSoftware';
import { TypeString, TypeColor } from '../config/map-projecttypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
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


export const ControlRequestsChange = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const [projectTarget, setProjectTarget] = useState(undefined)
  const { projId } = useParams()
  const [disabledFields, setDisabledFields] = useState(true)

  const queryClient = useQueryClient();

  const {status, data: nrProjects, error, isFetching} = useQuery({
      queryKey: ['all-projects'],
      queryFn: fetchAllNrProjects,
      initialData: () => queryClient.getQueryData(['all-projects'])?.filter(
        project => (project['identifier'] === projId)
      )
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
    setPageTitle(LinkTitles(location.pathname))
    if (status === 'success' && nrProjects.length > 0) {
      let targetProject = nrProjects.filter(project => (
        project['identifier'] === projId
      ))
      targetProject = targetProject[0]
      setProjectTarget(targetProject)
      rhfProps.setValue('requestName', targetProject.name)
      rhfProps.setValue('requestExplain', targetProject.reason)
      rhfProps.setValue('startDate', targetProject.date_start)
      rhfProps.setValue('endDate', targetProject.date_end)
      rhfProps.setValue('scientificDomain', targetProject.science_field)
      rhfProps.setValue('scientificSoftware', targetProject.science_software.map(e => (
        {
          'label' : e,
          'value' : e
        }
      )))
      rhfProps.setValue('scientificSoftwareExtra', targetProject.science_extrasoftware)
      rhfProps.setValue('scientificSoftwareHelp', targetProject.science_extrasoftware_help)
      rhfProps.setValue('nSlotsCPU', targetProject.resources_numbers.nSlotsCPU)
      rhfProps.setValue('nSlotsGPU', targetProject.resources_numbers.nSlotsGPU)
      rhfProps.setValue('nRAM', targetProject.resources_numbers.nRAM)
      rhfProps.setValue('nTempGB', targetProject.resources_numbers.nTempGB)
      rhfProps.setValue('nDiskGB', targetProject.resources_numbers.nDiskGB)
      rhfProps.setValue('requestResourceType', targetProject.resources_type)
    }
  }, [location.pathname, nrProjects?.length])

  const onSubmit = data => {
    alert(JSON.stringify(data, null, 2));
  }

  if (projectTarget) {
    return (
      <>
        <Row>
          <PageTitle pageTitle={pageTitle}/>
        </Row>
        <Row>
          <Col>
            <FormProvider {...rhfProps}>
              <Form onSubmit={rhfProps.handleSubmit(onSubmit)} className="needs-validation">
                <RequestHorizontalRuler />
                <GeneralFields fieldsDisabled={disabledFields} />
                <ScientificSoftware fieldsDisabled={disabledFields} />
                <Button color="danger" onClick={() => setDisabledFields(!disabledFields)}>
                  Editiraj zahtjev
                </Button>
                <ScientificSoftware fieldsDisabled={disabledFields} />
                <ResourceFields fieldsDisabled={disabledFields} />
              </Form>
            </FormProvider>
          </Col>
        </Row>
      </>
    )
  }
};


export const ControlRequestsList = () => {
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
