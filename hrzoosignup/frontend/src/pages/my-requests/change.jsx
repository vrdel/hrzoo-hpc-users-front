import React, { useContext, useState, useEffect } from 'react';
import { RequestHorizontalRulerRed } from 'Components/RequestHorizontalRuler';
import GeneralFields from 'Components/fields-request/GeneralFields';
import { SharedData } from '../root';
import { Col, Row, Form } from 'reactstrap';
import { PageTitle } from 'Components/PageTitle';
import { fetchNrSpecificProject, changeProject } from 'Api/projects';
import { useQuery, useMutation } from '@tanstack/react-query';
import ScientificSoftware from 'Components/fields-request/ScientificSoftware';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useForm,
  FormProvider,
} from "react-hook-form";
import ResourceFields from 'Components/fields-request/ResourceFields';
import { CustomReactSelect } from 'Components/CustomReactSelect';
import { toast } from 'react-toastify'
import ModalAreYouSure from 'Components/ModalAreYouSure';
import { RenderStateIcon } from 'Components/RenderState.jsx';
import { url_ui_prefix } from 'Config/general';
import { findTrueState } from 'Utils/reqstate';
import { convertToEuropean, convertTimeToEuropean } from 'Utils/dates';
import { defaultUnAuthnRedirect} from 'Config/default-redirect';
import { useIntl } from 'react-intl'
import { CroRisDescription } from 'Components/fields-request/GeneralFields';
import { FormattedMessage } from 'react-intl'

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


export const MyRequestChange = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const { projId } = useParams()
  const [requestState, setRequestState] = useState(undefined)
  const intl = useIntl()

  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYesCall, setOnYesCall] = useState(undefined)
  const [onYesCallArg, setOnYesCallArg] = useState(undefined)

  const { ResourceTypesToSelect } = useContext(SharedData);

  const navigate = useNavigate()

  const {status, data: nrProject, error} = useQuery({
      queryKey: ['change-project', projId],
      queryFn: () => fetchNrSpecificProject(projId),
  })

  const changeMutation = useMutation({
    mutationFn: (data) => {
      data['identifier'] = projId
      data['is_active'] = true
      data['name'] = data['requestName']
      data['reason'] = data['requestExplain']
      data['science_extrasoftware_help'] = data['scientificSoftwareHelp'] ? true : false
      data['staff_resources_type'] = data['staff_requestResourceType']
      return changeProject(projId, data)
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
      staff_comment: ''
    }
  });

  useEffect(() => {
    if (status === 'success' && nrProject) {
      rhfProps.setValue('requestCroRisId', nrProject.croris_id)
      rhfProps.setValue('requestCroRisFinance', nrProject.croris_finance)
      rhfProps.setValue('requestName', nrProject.name)
      rhfProps.setValue('requestExplain', nrProject.reason)
      rhfProps.setValue('requestSummary', nrProject.croris_summary)
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

      if (nrProject.staffcomment_set?.length > 0
        && nrProject.state.name === 'deny') {
        let lenPr = nrProject.staffcomment_set.length
        let last = nrProject.staffcomment_set[lenPr - 1]
        rhfProps.setValue('staff_comment', last.comment)
      }

      let newState = setInitialState()
      newState[nrProject.state.name] = true,
      setRequestState(newState)
    }

    setPageTitle(LinkTitles(location.pathname, intl))

    if (status === 'error' && error.message.includes('403'))
      navigate(defaultUnAuthnRedirect)

  }, [location.pathname, nrProject, status, intl])

  const onSubmit = (data) => {
    data['requestState'] = requestState
    let whichState = findTrueState(data['requestState'])
    if (whichState === 'approve'
      && (!data['staff_requestResourceType'] || data['staff_requestResourceType'].length === 0)) {
      toast.error(
        <span className="font-monospace">
          <FormattedMessage
            defaultMessage="Pri odobravanju zahtjeva morate se izjasniti o dodijeljenom tipu resursa."
            description="myreq-change-resource"
          />
        </span>, {
          autoClose: false,
          toastId: 'manreq-change-no-reqtype',
        }
      )
      return null
    }

    setAreYouSureModal(!areYouSureModal)
    setModalTitle( intl.formatMessage({
      defaultMessage: "Obrada korisničkog zahtjeva",
      description: "manreq-change-modaltitle"
    }) )
    setModalMsg( intl.formatMessage({
      defaultMessage: "Da li ste sigurni da želite mijenjati korisnički zahtjev?",
      description: "manreq-change-modalmsg"
    }) )
    setOnYesCall('dochangereq')
    setOnYesCallArg(data)
  }

  function onYesCallback() {
    if (onYesCall == 'dochangereq') {
      doChange(onYesCallArg)
    }
  }

  const doChange = (data) => {
    // alert(JSON.stringify(data, null, 2))
    changeMutation.mutate(data, {
      onSuccess: () => {
        toast.success(
          <span className="font-monospace text-dark">
            <FormattedMessage
              defaultMessage="Zahtjev je uspješno promijenjen"
              description="manreq-change-success"
            />
          </span>, {
            toastId: 'manreq-ok-change',
            autoClose: 2500,
            delay: 500,
            onClose: () => setTimeout(() => {navigate(url_ui_prefix + '/requests')}, 1500)
          }
        )
      },
      onError: (error) => {
        toast.error(
          <span className="font-monospace text-dark">
            <FormattedMessage
              defaultMessage="Zahtjev nije bilo moguće promijeniti:"
              description="manreq-change-fail"
            />
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
          <PageTitle pageTitle={pageTitle}/>
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
                <Row>
                  <Col md={{size: 9}} className="mt-4 me-0">
                    <span className="ps-2 pe-2 pt-1 pb-1 fs-5 text-white ms-4 mb-4 mt-3" style={{backgroundColor: "#b04c46"}}>
                      <FormattedMessage
                        defaultMessage="Obrada"
                        description="manreq-change-title"
                      />
                    </span>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={{size: 4}} lg={{size: 2}} className="d-flex flex-column offset-md-0 offset-lg-1 align-items-center ps-2 pe-2 mt-4 pt-1 pb-3 mb-3 fw-bold fs-5 ms-4">
                    <span className="mb-5">
                      <FormattedMessage
                        defaultMessage="Stanje zahtjeva:"
                        description="manreq-change-request-state"
                      />
                    </span>
                    <p className="fw-normal">
                      <RenderStateIcon reqState={requestState} />
                    </p>
                  </Col>
                  <Col sm={{size: 10}} md={{size: 6}} lg={{size: 3}} className="d-flex flex-column ps-2 pe-2 mt-4 pt-1 pb-3 mb-3 fw-bold fs-5 ms-4">
                    <span className="mb-5">
                      <FormattedMessage
                        defaultMessage="Dodijeljeni tip resursa:"
                        description="manreq-change-request-resources"
                      />
                    </span>
                    <CustomReactSelect
                      aria-label="staff_requestResourceType"
                      closeMenuOnSelect={false}
                      id="staff_requestResourceType"
                      isMulti
                      className="fw-normal"
                      isDisabled={true}
                      controlWidth="30%"
                      options={ResourceTypesToSelect}
                      placeholder=""
                      value={rhfProps.getValues('staff_requestResourceType')}
                      activeReadOnlyResourceTypeMultiValue={true}
                    />
                  </Col>
                  <Col md={{size: 3}} lg={{size: 2}} className="d-flex flex-column ps-2 pe-2 mt-4 pt-1 pb-3 mb-3 fw-bold fs-5 ms-4">
                    <span className="mb-5">
                      <FormattedMessage
                        defaultMessage="Vrijeme:"
                        description="manreq-change-time"
                      />
                    </span>
                    <p  className={nrProject.date_changed ? "fw-normal font-monospace fs-5" : "fw-normal fs-5"}>
                      {
                        nrProject.date_changed ?
                          convertToEuropean(nrProject.date_changed)
                        :
                          '\u2212'
                      }
                      <br/>
                      { nrProject.date_changed ?
                          convertTimeToEuropean(nrProject.date_changed)
                        :
                          ""
                      }
                    </p>
                  </Col>
                  <Col sm={{size: 11}} md={{size: 8}} lg={{size: 4}} className="d-flex flex-column ps-2 pe-2 mt-4 pt-1 pb-3 mb-3 fw-bold fs-5 ms-4">
                    <span className="mb-5">
                      <FormattedMessage
                        defaultMessage="Komentar:"
                        description="manreq-change-comment"
                      />
                    </span>
                    <p className="fw-normal fs-6">
                      {
                        nrProject?.state?.name === 'deny' && nrProject.staffcomment_set?.length > 0 ?
                          nrProject.staffcomment_set[nrProject.staffcomment_set.length - 1].comment
                        :
                          '\u2212'
                      }
                    </p>
                  </Col>
                </Row>
                <Row style={{height: '50px'}}>
                </Row>
                <RequestHorizontalRulerRed />
                <GeneralFields projectInfo={nrProject} fieldsDisabled={true}/>
                {
                  nrProject.project_type.name === 'research-croris' &&
                    <CroRisDescription fieldsDisabled={true}/>
                }
                <ScientificSoftware fieldsDisabled={true} />
                <ResourceFields fieldsDisabled={true} />
                <Row style={{height: '50px'}}>
                </Row>
              </Form>
            </FormProvider>
          </Col>
        </Row>
      </>
    )
  }
};
