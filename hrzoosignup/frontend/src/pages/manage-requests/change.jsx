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
  useFormContext,
  FormProvider,
  Controller,
} from "react-hook-form";
import ResourceFields from '../../components/fields-request/ResourceFields';
import { StateShortString } from '../../config/map-states';
import { CustomReactSelect } from '../../components/CustomReactSelect';
import { toast } from 'react-toastify'


function setInitialState() {
  let newState = new Object(
    {
      'submit': false,
      'approve': false,
      'deny': false,
      'extend': false,
      'expire': false
    }
  )
  return newState
}


function findTrueState(request_state) {
  let target = null

  for (var state in request_state)
    if (request_state[state] === true)
      target = state

  return target
}


function ToggleState(request_state, which) {
  let old = request_state[which]
  let newState = setInitialState()
  newState[which] = !old
  return JSON.parse(JSON.stringify(newState))
}


export const ManageRequestsChange = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
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
      scientificSoftwareHelp: '',
      staff_requestResourceType: '',
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

      let newState = setInitialState()
      newState[nrProject.state.name] = true,
      setRequestState(newState)
    }


    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname, nrProject])

  const onSubmit = data => {
    data['requestState'] = requestState
    let whichState = findTrueState(data['requestState'])
    if (whichState === 'approve' && !data['staff_requestResourceType'])
      toast.error(
        <span className="font-monospace">
          Pri odobravanju zahtjeva morate se izjasniti o dodijeljenom tipu resursa.
        </span>, {
          theme: 'colored',
          autoClose: false,
          toastId: 'manreq-change-no-reqtype',
        }
      )
    if (nrProject.state.name === whichState)
      toast.error(
        <span className="font-monospace">
          Stanje je nepromijenjeno.
        </span>, {
          theme: 'warning',
          autoClose: false,
          toastId: 'manreq-change-no-statechange',
        }
      )
    //alert(JSON.stringify(data, null, 2));
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
                  initialProjectState={nrProject.state.name}
                />
              </Form>
            </FormProvider>
          </Col>
        </Row>
      </>
    )
  }
};


const ProcessRequest = ({disabledFields, setDisabledFields, requestState, setRequestState, initialProjectState}) => {
  const { control, getValues, setValue, formState: {errors} } = useFormContext();
  const { ResourceTypesToSelect } = useContext(SharedData);


  return (
    <>
      <Row>
        <Col md={{size: 10}}>
          <span className="ps-2 pe-2 pt-1 pb-1 text-white fs-3 ms-4 mb-4 mt-4" style={{backgroundColor: "#b04c46"}}>
            Obrada:
          </span>
        </Col>
        <Col>
          <Button disabled={true} color="danger" onClick={() => setDisabledFields(!disabledFields)}>
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
      <Row style={{'height': '10px'}}/>
      <Row>
        <Col md={{size: 1}}>
        </Col>
        <Col md={{offset: 2, size: 8}} className="ps-2 pe-2 pt-1 pb-3 mb-3 fw-bold fs-5 ms-5">
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
            outline={!requestState['approve']}
            onClick={() =>
              setRequestState(ToggleState(requestState, 'approve'))}
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
            outline={!requestState['submit']}
            onClick={() =>
              setRequestState(ToggleState(requestState, 'submit'))}
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
            outline={!requestState['extend']}
            style={{height: '30px', width: '30px'}}
            onClick={() =>
              setRequestState(ToggleState(requestState, 'extend'))}
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
            outline={!requestState['deny']}
            style={{height: '30px', width: '30px'}}
            onClick={() =>
              setRequestState(ToggleState(requestState, 'deny'))}
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
            outline={!requestState['expire']}
            style={{height: '30px', width: '30px'}}
            onClick={() =>
              setRequestState(ToggleState(requestState, 'expire'))}
            color="success"/>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex justify-content-center fst-italic">
          <p className="fw-bold">Napomena:</p>&nbsp;
          <p>Inicijalno stanje zahtjeva: <span className="text-decoration-underline">{ StateShortString(initialProjectState) }</span><br/>
            Voditelj će biti obaviješten emailom o promjeni stanja u "Odobren" ili "Odbijen".
          </p>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col style={{width: '150px'}} md={{size: 1}}/>
        <Col md={{size: 9}}>
          <Label
            htmlFor="staff_comment"
            className="fw-bold mt-3 fs-5 form-label"
            aria-label="staff_comment">
            Dodatan komentar voditelju u emailu uz generičku poruku:
          </Label>
          <Controller
            name="staff_comment"
            control={control}
            render={ ({field}) =>
              <textarea
                id="staff_comment"
                {...field}
                aria-label="staff_comment"
                type="text"
                className="form-control"
                rows="5"
              />
            }
          />
        </Col>
      </Row>
      <Row className="mt-4">
        <Col style={{width: '150px'}} md={{size: 1}}/>
        <Col md={{size: 8}}>
          <Label
            htmlFor="staff_requestResourceType"
            aria-label="staff_requestResourceType"
            className="fw-bold mt-3 fs-5 text-right form-label">
            Dodijeljeni tip resursa:
          </Label>
          <Controller
            name="staff_requestResourceType"
            control={control}
            render={ ({field}) =>
              <CustomReactSelect
                aria-label="staff_requestResourceType"
                closeMenuOnSelect={false}
                forwardedRef={field.ref}
                id="staff_requestResourceType"
                isMulti
                options={ResourceTypesToSelect}
                placeholder="Odaberi"
                value={getValues('staff_requestResourceType')}
                onChange={(e) => setValue('staff_requestResourceType', e)}
                resourceTypeMultiValue={true}
              />
            }
          />
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
