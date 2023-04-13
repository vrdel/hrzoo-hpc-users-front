import React, { useContext, useState, useEffect } from 'react';
import { RequestHorizontalRulerRed } from '../../components/RequestHorizontalRuler';
import GeneralFields from '../../components/fields-request/GeneralFields';
import { SharedData } from '../root';
import { Col, Label, Row, Button, Form } from 'reactstrap';
import { PageTitle } from '../../components/PageTitle';
import { fetchNrSpecificProject } from '../../api/projects';
import { useQuery } from '@tanstack/react-query';
import ScientificSoftware from '../../components/fields-request/ScientificSoftware';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave,
  faCog,
  faTimes,
  faTimeline,
  faCalendarXmark,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useParams } from 'react-router-dom';
import {
  useForm,
  Controller,
  useFormContext,
  FormProvider,
} from "react-hook-form";
import ResourceFields from '../../components/fields-request/ResourceFields';



function ToggleState(request_state, which) {
  let old = request_state[which]
  let newState = new Object(
    {
      'submitted': false,
      'approved': false,
      'denied': false,
      'extended': false,
      'expired': false
    }
  )
  newState[which] = !old
  return JSON.parse(JSON.stringify(newState))
}


export const ManageRequestsChange = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const [ projectTarget, setProjectTarget ] = useState(undefined)
  const { projId } = useParams()
  const [disabledFields, setDisabledFields] = useState(true)
  const [ requestState, setRequestState ] = useState(undefined)

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
      rhfProps.setValue('HPCnSlotsCPU', nrProject.resources_numbers.HPCnSlotsCPU)
      rhfProps.setValue('HPCnSlotsGPU', nrProject.resources_numbers.HPCnSlotsGPU)
      rhfProps.setValue('HPCnRAM', nrProject.resources_numbers.HPCnSlotsRAM)
      rhfProps.setValue('HPCnTempGB', nrProject.resources_numbers.HPCnTempGB)
      rhfProps.setValue('HPCnDiskGB', nrProject.resources_numbers.HPCnDiskGB)
      rhfProps.setValue('CLOUDnVM', nrProject.resources_numbers.CLOUDnVM)
      rhfProps.setValue('CLOUDnSlotsCPU', nrProject.resources_numbers.CLOUDnSlotsCPU)
      rhfProps.setValue('CLOUDnRAM', nrProject.resources_numbers.CLOUDnRAM)
      rhfProps.setValue('CLOUDnRAMVM', nrProject.resources_numbers.CLOUDnRAMVM)
      rhfProps.setValue('CLOUDnDiskGB', nrProject.resources_numbers.CLOUDnDiskGB)
      rhfProps.setValue('CLOUDnFastDiskGB', nrProject.resources_numbers.CLOUDnFastDiskGB)
      rhfProps.setValue('CLOUDnIPs', nrProject.resources_numbers.CLOUDnIPs)
      rhfProps.setValue('requestResourceType', nrProject.resources_type)

      let newState = new Object(
        {
          'submitted': false,
          'approved': false,
          'denied': false,
          'extended': false,
          'expired': false
        }
      )
      newState[nrProject.state.name] = true,
      setRequestState(newState)
    }


    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname, nrProject])

  const onSubmit = data => {
    data['requestState'] = requestState
    alert(JSON.stringify(data, null, 2));
  }

  if (nrProject && requestState) {
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
                <ProcessRequest
                  disabledFields={disabledFields}
                  setDisabledFields={setDisabledFields}
                  requestState={requestState}
                  setRequestState={setRequestState}
                />

              </Form>
            </FormProvider>
          </Col>
        </Row>
      </>
    )
  }
};


const ProcessRequest = ({disabledFields, setDisabledFields, requestState, setRequestState}) => {
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
            Uredi zahtjev
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
      <Row style={{'height': '80px'}}/>
      <Row>
        <Col md={{size: 1}}>
        </Col>
        <Col style={{offset: 2, size: 8}} className="ps-2 pe-2 pt-1 pb-3 mb-3 fw-bold fs-5 ms-5">
          <span >
            Stanja zahtjeva:
          </span>
        </Col>
      </Row>
      <Row style={{'height': '30px'}}/>
      <Row className="mt-2 mb-5 text-center">
        <Col md={{size: 1}}>
        </Col>
        <Col md={{size: 2}}>
          <FontAwesomeIcon className="fa-4x text-success" style={{color: '#00ff00'}} icon={faCheck}/>{' '}
          <br/>
          <p className="fs-5">
            Odobren
          </p>
          <Button
            style={{height: '30px', width: '30px'}}
            outline={!requestState['approved']}
            onClick={() =>
              setRequestState(ToggleState(requestState, 'approved'))}
            color="success"
          />
        </Col>
        <Col md={{size: 2}}>
          <FontAwesomeIcon
            className="fa-4x text-warning"
            icon={faCog}/>{' '}
          <br/>
          <p className="fs-5">
            Obrada
          </p>
          <Button
            style={{height: '30px', width: '30px'}}
            outline={!requestState['submitted']}
            onClick={() =>
              setRequestState(ToggleState(requestState, 'submitted'))}
            color="success"
          />
        </Col>
        <Col md={{size: 2}}>
          <FontAwesomeIcon
            className="fa-4x text-warning"
            icon={faTimeline}/>{' '}
          <br/>
          <p className="fs-5">
            Produljenje
          </p>
          <Button
            outline={!requestState['extended']}
            style={{height: '30px', width: '30px'}}
            onClick={() =>
              setRequestState(ToggleState(requestState, 'extended'))}
            color="success"/>
        </Col>
        <Col md={{size: 2}}>
          <FontAwesomeIcon
            className="fa-4x text-danger"
            icon={faTimes}/>{' '}
          <br/>
          <p className="fs-5">
            Odbijen
          </p>
          <Button
            outline={!requestState['denied']}
            style={{height: '30px', width: '30px'}}
            onClick={() =>
              setRequestState(ToggleState(requestState, 'denied'))}
            color="success"/>
        </Col>
        <Col md={{size: 2}}>
          <FontAwesomeIcon
            className="fa-4x text-danger"
            icon={faCalendarXmark}/>{' '}
          <br/>
          <p className="fs-5">
            Istekao
          </p>
          <Button
            outline={!requestState['expired']}
            style={{height: '30px', width: '30px'}}
            onClick={() =>
              setRequestState(ToggleState(requestState, 'expired'))}
            color="success"/>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex justify-content-center fst-italic">
          <p className="fw-bold">Napomena:</p>&nbsp;
          <p>Voditelj će biti obaviješten emailom o promjeni stanja u "Odobren" ili "Odbijen"</p>
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
