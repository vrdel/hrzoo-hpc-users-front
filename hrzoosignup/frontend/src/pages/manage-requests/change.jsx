import React, { useContext, useState, useEffect } from 'react';
import { RequestHorizontalRulerRed } from 'Components/RequestHorizontalRuler';
import GeneralFields, { CroRisDescription } from 'Components/fields-request/GeneralFields';
import { SharedData } from '../root';
import { Col, Label, Row, Button, Form, FormGroup, Input, Table } from 'reactstrap';
import { PageTitle } from 'Components/PageTitle';
import { fetchNrSpecificProject, changeProject, deleteProject } from 'Api/projects';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ScientificSoftware from 'Components/fields-request/ScientificSoftware';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave,
  faCog,
  faTimes,
  faTimeline,
  faCalendarXmark,
  faCheckDouble,
} from '@fortawesome/free-solid-svg-icons';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useForm,
  useFormContext,
  FormProvider,
  Controller,
} from "react-hook-form";
import ResourceFields from 'Components/fields-request/ResourceFields';
import { StateShortString } from 'Config/map-states';
import { CustomReactSelect } from 'Components/CustomReactSelect';
import { toast } from 'react-toastify'
import ModalAreYouSure from 'Components/ModalAreYouSure';
import { url_ui_prefix } from 'Config/general';
import { extractLeaderName } from 'Utils/users_help';
import { defaultUnAuthnRedirect} from 'Config/default-redirect';
import 'Styles/staff-change-disabled.css';
import { AuthContext } from 'Components/AuthContextProvider.jsx';
import { convertToAmerican } from "Utils/dates";


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

const LeadBasicInfo = ({leadInfo}) => {
  const user = leadInfo['user']
  return (
    <>
      <Row>
        <Col>
          <h4 className="ms-4 mb-3 mt-4">Voditelj</h4><br/>
        </Col>
      </Row>
      <Row className="gx-0">
        <Col md={{size: 10, offset: 1}}>
          <Table borderless responsive className="text-left">
            <thead>
              <tr>
                <th className="ms-0 ps-0 fw-bold" style={{width: '20%'}}>
                  Ime
                </th>
                <th className="ms-0 ps-0 fw-bold" style={{width: '20%'}}>
                  Prezime
                </th>
                <th className="ms-0 ps-0 fw-bold" style={{width: '30%'}}>
                  Email
                </th>
                <th className="ms-0 ps-0 fw-bold">
                  Korisnička oznaka
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="ms-0 ps-0">
                  { user.first_name ? user.first_name : '\u2212' }
                </td>
                <td className="ms-0 ps-0">
                  { user.last_name ? user.last_name :  '\u2212' }
                </td>
                <td className="ms-0 ps-0">
                  { user.person_mail ? user.person_mail : '\u2212' }
                </td>
                <td className="ms-0 ps-0">
                  { user.person_uniqueid ? user.person_uniqueid :  '\u2212' }
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row className="gx-0">
        <Col md={{size: 10, offset: 1}}>
          <Table borderless responsive className="text-left">
            <thead>
              <tr>
                <th className="ms-0 ps-0 fw-bold" style={{width: '20%'}}>
                  Povezanost
                </th>
                <th className="ms-0 ps-0 fw-bold" style={{width: '20%'}}>
                  Naziv ustanove
                </th>
                <th className="ms-0 ps-0 fw-bold" style={{width: '30%'}}>
                </th>
                <th className="ms-0 ps-0 fw-bold" style={{width: '30%'}}>
                  Organizacijska jedinica
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="ms-0 ps-0">
                  { user.person_affiliation ? user.person_affiliation :  '\u2212'}
                </td>
                <td className="ms-0 ps-0" colSpan="2">
                  { user.person_institution ? user.person_institution : '\u2212'}
                </td>
                <td className="ms-0 ps-0">
                  { user.person_organisation ? user.person_organisation : '\u2212'}
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  )
}


export const ManageRequestsChange = ({manageProject=false}) => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const [commentDisabled, setCommentDisabled] = useState(undefined);
  const { projId } = useParams()
  const [disabledFields, setDisabledFields] = useState(true)
  const [requestState, setRequestState] = useState(undefined)
  const { csrfToken } = useContext(AuthContext)

  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYesCall, setOnYesCall] = useState(undefined)
  const [onYesCallArg, setOnYesCallArg] = useState(undefined)

  const navigate = useNavigate()
  const queryClient = useQueryClient();

  const {status, data: nrProject, error} = useQuery({
      queryKey: ['change-project', projId],
      queryFn: () => fetchNrSpecificProject(projId),
  })

  function checkAmericanDateAndConvert(checkDate) {
    if (typeof(checkDate) === 'string' &&
      checkDate.match(/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]/))
        return checkDate
    return convertToAmerican(checkDate)
  }

  const changeMutation = useMutation({
    mutationFn: (data) => {
      data['identifier'] = projId
      data['is_active'] = true
      data['name'] = data['requestName']
      data['reason'] = data['requestExplain']
      data['date_start'] = checkAmericanDateAndConvert(data['startDate'])
      data['date_end'] = checkAmericanDateAndConvert(data['endDate'])
      data['scientificSoftware'] = data['scientificSoftware'].map(e => e['value'])
      data['science_extrasoftware_help'] = data['scientificSoftwareHelp'] ? true : false

      if (!disabledFields)
        data['staff_emailSend'] = false

      data['resources_numbers'] = {
        'HPCnSlotsCPU': data['HPCnSlotsCPU'],
        'HPCnSlotsGPU': data['HPCnSlotsGPU'],
        'HPCnSlotsRAM': data['HPCnRAM'],
        'HPCnTempGB': data['HPCnTempGB'],
        'HPCnDiskGB': data['HPCnDiskGB'],
        'CLOUDnVM': data['CLOUDnVM'],
        'CLOUDnSlotsCPU': data['CLOUDnSlotsCPU'],
        'CLOUDnRAM': data['CLOUDnRAM'],
        'CLOUDnRAMVM': data['CLOUDnRAMVM'],
        'CLOUDnDiskGB': data['CLOUDnDiskGB'],
        'CLOUDnFastDiskGB': data['CLOUDnFastDiskGB'],
        'CLOUDnIPs': data['CLOUDnIPs'],
      }

      return changeProject(projId, data, csrfToken)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (projId) => {
      return deleteProject(projId, csrfToken)
    }
  })

  const rhfProps = useForm({
    defaultValues: {
      requestCroRisId: '',
      requestName: '',
      requestExplain: '',
      startDate: '',
      endDate: '',
      requestResourceType: '',
      HPCnSlotsCPU: '', HPCnSlotsGPU: '', HPCnRAM: '', HPCnTempGB: '', HPCnDiskGB: '',
      CLOUDnVM: '', CLOUDnSlotsCPU: '', CLOUDnRAM: '', CLOUDnRAMVM: '',
      CLOUDnFastDiskGB: '', CLOUDnDiskGB: '', CLOUDnIPs: '',
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
      staff_comment: '',
      staff_emailSend: true,
    }
  });

  useEffect(() => {
    if (status === 'success' && nrProject) {
      rhfProps.setValue('requestCroRisId', nrProject.croris_id)
      rhfProps.setValue('requestCroRisFinance', nrProject.croris_finance)
      rhfProps.setValue('requestName', nrProject.name)
      rhfProps.setValue('requestSummary', nrProject.croris_summary)
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
      rhfProps.setValue('staff_requestResourceType', nrProject.staff_resources_type)
      rhfProps.setValue('staff_emailSend', true)

      rhfProps.setValue('approved_by', nrProject.approved_by)
      rhfProps.setValue('changed_by', nrProject.changed_by)
      rhfProps.setValue('denied_by', nrProject.denied_by)

      if (nrProject.staffcomment_set?.length > 0
        && nrProject.state.name === 'deny') {
        let lenPr = nrProject.staffcomment_set.length
        let last = nrProject.staffcomment_set[lenPr - 1]
        rhfProps.setValue('staff_comment', last.comment)
      }
      setCommentDisabled(true)

      let newState = setInitialState()
      newState[nrProject.state.name] = true,
      setRequestState(newState)
    }

    setPageTitle(LinkTitles(location.pathname))

    if (status === 'error' && error.message.includes('403'))
      navigate(defaultUnAuthnRedirect)
  }, [location.pathname, nrProject, status])

  const onSubmit = (data) => {
    data['requestState'] = requestState
    let whichState = findTrueState(data['requestState'])
    if (whichState === 'approve'
      && (!data['staff_requestResourceType'] || data['staff_requestResourceType'].length === 0)) {
      toast.error(
        <span className="font-monospace text-dark">
          {`Pri odobravanju ${manageProject ? 'projekta' : 'zahtjeva'} morate se izjasniti o dodijeljenom tipu resursa.`}
        </span>, {
          autoClose: false,
          toastId: 'manreq-change-no-reqtype',
        }
      )
      return null
    }

    if (whichState === 'deny' && !data['staff_comment']) {
      toast.error(
        <span className="font-monospace text-dark">
          {`Pri odbijanju ${manageProject ? 'projekta' : 'zahtjeva'} morate se izjasniti o razlogu.`}
        </span>, {
          autoClose: false,
          toastId: 'manreq-change-no-reqcomment',
        }
      )
      return null
    }

    setAreYouSureModal(!areYouSureModal)
    setModalTitle(`${manageProject ? 'Obrada projekta' : 'Obrada korisničkog zahtjeva'}`)
    setModalMsg(`Da li ste sigurni da želite mijenjati ${manageProject ? 'projekt' : 'korisnički zahtjev?'}`)
    setOnYesCall('dochangereq')
    setOnYesCallArg(data)
    // alert(JSON.stringify(data, null, 2));
  }

  function onYesCallback() {
    if (onYesCall == 'dochangereq') {
      doChange(onYesCallArg)
    }
    if (onYesCall == 'dodeletereq') {
      doDelete()
    }
  }

  const doDelete = () => {
    deleteMutation.mutate(projId, {
      onSuccess: () => {
        queryClient.invalidateQueries('all-projects')
        toast.success(
          <span className="font-monospace text-dark">
            {`${manageProject ? 'Projekt' : 'Zahtjev'} je uspješno obrisan`}
          </span>, {
            toastId: 'manreq-ok-delete',
            autoClose: 2500,
            delay: 500,
            onClose: setTimeout(() => {navigate(url_ui_prefix + `${manageProject ? '/projekti' : '/zahtjevi'}`)}, 1500)
          }
        )
      },
      onError: (error) => {
        toast.error(
          <span className="font-monospace text-dark">
            {`${manageProject ? 'Projekt' : 'Zahtjev'} nije bilo moguće obrisati:`}
            { error.message }
          </span>, {
            toastId: 'manreq-ok-delete',
            autoClose: 2500,
            delay: 1000
          }
        )
      },
    })
  }

  const doChange = (data) => {
    // alert(JSON.stringify(data, null, 2))
    changeMutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries('change-project')
        toast.success(
          <span className="font-monospace text-dark">
            {`${manageProject ? 'Projekt' : 'Zahtjev'} je uspješno promijenjen`}
          </span>, {
            toastId: 'manreq-ok-change',
            autoClose: 2500,
            delay: 500,
            onClose: setTimeout(() => {navigate(url_ui_prefix + `${manageProject ? '/projekti' : '/zahtjevi'}`)}, 1500)
          }
        )
      },
      onError: (error) => {
        toast.error(
          <span className="font-monospace text-dark">
            {`${manageProject ? 'Projekt' : 'Zahtjev'} nije bilo moguće promijeniti:`}
            { error.message }
          </span>, {
            toastId: 'manreq-ok-change',
            autoClose: 2500,
            delay: 1000
          }
        )
      },
    })
  }

  if (nrProject && requestState) {
    return (
      <>
        <Row>
          <PageTitle pageTitle={pageTitle} isEditing={!disabledFields}/>
        </Row>
        <ModalAreYouSure
          isOpen={areYouSureModal}
          toggle={() => setAreYouSureModal(!areYouSureModal)}
          title={modalTitle}
          msg={modalMsg}
          onYes={onYesCallback} />
        <Row>
          <Col>
            <FormProvider {...rhfProps}>
              <Form onSubmit={rhfProps.handleSubmit(onSubmit)} className="needs-validation">
                <LeadBasicInfo leadInfo={ extractLeaderName(nrProject.userproject_set) } />
                {
                  nrProject.project_type.name === 'research-croris' &&
                    <CroRisDescription fieldsDisabled={
                      nrProject.project_type['name'] === 'research-croris'
                        && !disabledFields
                        ? true
                        : disabledFields
                      }
                    />
                }
                <GeneralFields fieldsDisabled={disabledFields}
                  projectInfo={nrProject} manageProject={manageProject}
                  isResearch={nrProject.project_type['name'] === 'research-croris'}
                />
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
                  commentDisabled={commentDisabled}
                  setCommentDisabled={setCommentDisabled}
                  modalProps={{setAreYouSureModal, setModalTitle, setModalMsg,
                    setOnYesCall, areYouSureModal}}
                  manageProject={manageProject}
                />
              </Form>
            </FormProvider>
          </Col>
        </Row>
      </>
    )
  }
};


const ProjectState = ({requestState, setCommentDisabled, setRequestState}) => {
  return (
    <>
      <Col md={{size: 2}}/>
      <Col md={{size: 2}}>
        <FontAwesomeIcon className="fa-3x text-success" style={{color: '#00ff00'}} icon={faCheckDouble}/>{' '}
        <br/>
        <p className="fs-5">
          Odobren
        </p>
        <Button
          style={{height: '30px', width: '30px'}}
          outline={!requestState['approve']}
          onClick={() => {
            setCommentDisabled(true)
            setRequestState(ToggleState(requestState, 'approve'))
          }}
          color="success"
        />
      </Col>
      <Col md={{size: 2}} className="mt-sm-4 mt-lg-0 mt-md-0 mt-4">
        <FontAwesomeIcon
          className="fa-3x text-warning"
          icon={faTimeline}/>{' '}
        <br/>
        <p className="fs-5">
          Produljenje
        </p>
        <Button
          outline={!requestState['extend']}
          style={{height: '30px', width: '30px'}}
          onClick={() => {
            setCommentDisabled(true)
            setRequestState(ToggleState(requestState, 'extend'))
          }}
          color="success"/>
      </Col>
      <Col md={{size: 2}} className="mt-sm-4 mt-lg-0 mt-md-0 mt-4">
        <FontAwesomeIcon
          className="fa-3x text-danger"
          icon={faCalendarXmark}/>{' '}
        <br/>
        <p className="fs-5">
          Istekao
        </p>
        <Button
          outline={!requestState['expire']}
          style={{height: '30px', width: '30px'}}
          onClick={() => {
            setCommentDisabled(true)
            setRequestState(ToggleState(requestState, 'expire'))
          }}
          color="success"/>
      </Col>
    </>
  )
}


const RequestState = ({requestState, setCommentDisabled, setRequestState}) => {
  return (
    <>
      <Col md={{size: 2}}>
        <FontAwesomeIcon className="fa-3x text-success" style={{color: '#00ff00'}} icon={faCheckDouble}/>{' '}
        <br/>
        <p className="fs-5">
          Odobren
        </p>
        <Button
          style={{height: '30px', width: '30px'}}
          outline={!requestState['approve']}
          onClick={() => {
            setCommentDisabled(true)
            setRequestState(ToggleState(requestState, 'approve'))
          }}
          color="success"
        />
      </Col>
      <Col md={{size: 2}} className="mt-sm-4 mt-lg-0 mt-md-0 mt-4">
        <FontAwesomeIcon
          className="fa-3x text-warning"
          icon={faCog}/>{' '}
        <br/>
        <p className="fs-<br/>5">
          Obrada
        </p>
        <Button
          style={{height: '30px', width: '30px'}}
          outline={!requestState['submit']}
          onClick={() => {
            setCommentDisabled(true)
            setRequestState(ToggleState(requestState, 'submit'))
          }}
          color="success"
        />
      </Col>
      <Col md={{size: 2}} className="mt-sm-4 mt-lg-0 mt-md-0 mt-4">
        <FontAwesomeIcon
          className="fa-3x text-warning"
          icon={faTimeline}/>{' '}
        <br/>
        <p className="fs-5">
          Produljenje
        </p>
        <Button
          outline={!requestState['extend']}
          style={{height: '30px', width: '30px'}}
          onClick={() => {
            setCommentDisabled(true)
            setRequestState(ToggleState(requestState, 'extend'))
          }}
          color="success"/>
      </Col>
      <Col md={{size: 2}} className="mt-sm-4 mt-lg-0 mt-md-0 mt-4">
        <FontAwesomeIcon
          className="fa-3x text-danger"
          icon={faTimes}/>{' '}
        <br/>
        <p className="fs-5">
          Odbijen
        </p>
        <Button
          outline={!requestState['deny']}
          style={{height: '30px', width: '30px'}}
          onClick={() => {
            setCommentDisabled(false)
            setRequestState(ToggleState(requestState, 'deny'))
          }}
          color="success"/>
      </Col>
      <Col md={{size: 2}} className="mt-sm-4 mt-lg-0 mt-md-0 mt-4">
        <FontAwesomeIcon
          className="fa-3x text-danger"
          icon={faCalendarXmark}/>{' '}
        <br/>
        <p className="fs-5">
          Istekao
        </p>
        <Button
          outline={!requestState['expire']}
          style={{height: '30px', width: '30px'}}
          onClick={() => {
            setCommentDisabled(true)
            setRequestState(ToggleState(requestState, 'expire'))
          }}
          color="success"/>
      </Col>
    </>
  )
}


const ProcessRequest = ({disabledFields, setDisabledFields, requestState,
  setRequestState, initialProjectState, commentDisabled, setCommentDisabled,
  modalProps, manageProject}) => {
  const { control, getValues, setValue, formState: {errors} } = useFormContext();
  const { ResourceTypesToSelect } = useContext(SharedData);

  const deniedBy = getValues('denied_by')
  const approvedBy = getValues('approved_by')
  const changedBy = getValues('changed_by')

  let sendEmailDisabled = true
  setValue('staff_emailSend', false)

  if (initialProjectState === 'approve' && requestState['approve']) {
    sendEmailDisabled = false
    setValue('staff_emailSend', false)
  }
  else if (requestState['approve']) {
    sendEmailDisabled = false
    setValue('staff_emailSend', true)
  }
  else if (requestState['deny']) {
    sendEmailDisabled = false
    setValue('staff_emailSend', true)
  }

  return (
    <>
      <Row>
        <Col md={{size: 12}} className="me-0">
          <span className="ps-2 pe-2 pt-1 pb-1 text-white fs-3 ms-4 mb-4 mt-4" style={{backgroundColor: "#b04c46"}}>
            {
              manageProject ?
                "Promjena"
              :
                "Obrada"
            }
          </span>
        </Col>
      </Row>
      <Row className="d-flex flex-row justify-content-end">
        <Col md={{size: 6}} lg={{size: 5}} xl={{size: 3}} className="d-flex flex-row mt-md-3 mt-sm-3 ms-sm-4 mt-lg-0 mt-3 justify-content-center">
          <Button color="danger" className="me-lg-1 me-md-1 me-sm-1 me-1" onClick={() => {
            modalProps.setAreYouSureModal(!modalProps.areYouSureModal)
            modalProps.setModalTitle('Brisanje korisničkog zahtjeva')
            modalProps.setModalMsg('Da li ste sigurni da želite brisati korisnički zahtjev?')
            modalProps.setOnYesCall('dodeletereq')}}
          >
            {`Obriši ${manageProject ? 'projekt' : 'zahtjev'}`}
          </Button>
          <Button color="danger"
            className="me-lg-1 me-md-3 me-sm-3"
            onClick={() => setDisabledFields(!disabledFields)}
            active={!disabledFields}
          >
            {`Uredi ${manageProject ? 'projekt' : 'zahtjev'}`}
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
            {`Stanje ${manageProject ? 'projekta:' : 'zahtjeva:'}`}
          </span>
        </Col>
      </Row>
      <Row style={{'height': '30px'}}/>
      <Row className="mt-2 mb-5 text-center">
        <Col md={{size: 1}}>
        </Col>
        {
          manageProject ?
            <ProjectState
              requestState={requestState}
              setCommentDisabled={setCommentDisabled}
              setRequestState={setRequestState}
            />
          :
            <RequestState
              requestState={requestState}
              setCommentDisabled={setCommentDisabled}
              setRequestState={setRequestState}
            />
        }
      </Row>
      {
        !manageProject &&
        <Row>
          <Col className="d-flex justify-content-center fst-italic">
            <p className="fw-bold">Napomena:</p>&nbsp;
            <p>Inicijalno stanje zahtjeva: <span className="text-decoration-underline">{ StateShortString(initialProjectState) }</span><br/>
              Voditelj će biti obaviješten emailom o promjeni stanja u "Odobren" ili "Odbijen".
            </p>
          </Col>
        </Row>
      }
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
      {
        !manageProject &&
        <>
          <Row className="mt-3">
            <Col style={{width: '150px'}} md={{size: 1}}/>
            <Col md={{size: 10}}>
              <Label
                htmlFor="staff_comment"
                className="fw-bold mt-3 fs-5 form-label"
                aria-label="staff_comment">
                Dodatni komentar prilikom <u><i>odbijanja</i></u> zahtjeva:
              </Label>
              <Controller
                name="staff_comment"
                control={control}
                render={ ({field}) =>
                  <textarea
                    id="staff_comment"
                    {...field}
                    aria-label="staff_comment"
                    disabled={commentDisabled}
                    type="text"
                    className="form-control"
                    rows="10"
                  />
                }
              />
            </Col>
          </Row>
          <Row className="mt-3">
            <Col style={{width: '150px'}} md={{size: 1}}/>
            <Col md={{size: 9}}>
              <FormGroup switch>
                <Controller
                  name="staff_emailSend"
                  control={control}
                  render={({field}) =>
                    <Input
                      {...field}
                      type="switch"
                      role="switch"
                      disabled={sendEmailDisabled}
                      checked={disabledFields ? getValues('staff_emailSend') : false}
                      className="form-control fw-bold fst-italic"
                    />
                  }
                />
                <Label className="fw-bold fst-italic" check>Šalji email voditelju</Label>
              </FormGroup>
            </Col>
          </Row>
          <Row style={{'height': '100px'}}/>
        </>
      }
      <Row style={{'height': '50px'}}/>
      <Row className="justify-content-end fst-italic">
        <Col md={{size: 4}} className="fs-6 mt-3">
          <span className="fw-bold">
            Obradio{'  '}
          </span>
          {
            ['approve', 'extend', 'expire'].indexOf(initialProjectState) >= 0 ?
              approvedBy ? approvedBy.first_name + ' ' + approvedBy.last_name : '\u2212'
            :
              initialProjectState === 'deny' ?
                deniedBy ? deniedBy.first_name + ' ' + deniedBy.last_name :  '\u2212'
              :
                '\u2212'
          }
        </Col>
      </Row>
      {
        changedBy &&
        <Row className="justify-content-end fst-italic">
          <Col md={{size: 4}} className="fs-6 mt-1">
            <span className="fw-bold">
              Promijenio:{'  '}
            </span>
            {
              changedBy ? changedBy.first_name + ' ' + changedBy.last_name : '\u2212'
            }
          </Col>
        </Row>
      }
      <Row className="mt-5 mb-5 text-center">
        <Col>
          <Button disabled={!disabledFields} size="lg" color="success"
            id="submit-button" type="submit">
            <FontAwesomeIcon icon={faSave}/>{' '}
            Spremi promjene
          </Button>
        </Col>
      </Row>
    </>
  )
}
