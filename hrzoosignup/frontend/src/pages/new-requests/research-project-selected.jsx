import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useForm,
  Controller,
  useFormContext,
  FormProvider,
} from "react-hook-form";
import RequestHorizontalRuler from '../../components/RequestHorizontalRuler';
import {
  Badge,
  Button,
  Col,
  FormFeedback,
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
import { useQuery, useMutation } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import ResourceFields from '../../components/fields-request/ResourceFields';
import BaseNewScientificDomain from '../../components/fields-request/ScientificDomain';
import ScientificSoftware from '../../components/fields-request/ScientificSoftware';
import { toast } from 'react-toastify'
import { addResearchProject } from '../../api/projects';
import { convertToIso8601 } from '../../utils/dates';
import { url_ui_prefix } from '../../config/general';
import ModalAreYouSure from '../../components/ModalAreYouSure';
import validateDomainAndFields from '../../utils/validate-domain-fields';
import { convertToAmerican } from '../../utils/dates.jsx';
import * as yup from "yup";


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

const schemaResolve = yup.object().shape({
  requestExplain: yup.string().required("Obvezno"),
  scientificDomain: yup.array().of(yup.object().shape(
    {
      name: yup.object().shape({
            'label': yup.string().required(),
            'value': yup.string().required()
          }),
      percent: yup.number().positive().lessThan(101).required("0-100"),
      scientificfields: yup.array().of(yup.object().shape(
        {
          name: yup.object().shape({
            'label': yup.string().required(),
            'value': yup.string().required()
          }),
          percent: yup.number().positive().lessThan(101).required("0-100")

        }
      ))
    }
  )).required(),
  scientificSoftware: yup.array().min(0).of(yup.object()),
  scientificSoftwareExtra: yup.string(),
  scientificSoftwareHelp: yup.boolean(),
  requestResourceType: yup.array().of(yup.object()),
  HPCnSlotsCPU: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(6656, "Broj ne može biti veći od 6656")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  HPCnSlotsGPU: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(80, "Broj ne može biti veći od 80")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  HPCnSlotsRAM: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(80, "Broj ne može biti veći od 4000")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  HPCnRAM: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(4000, "Broj ne može biti veći od 4000")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  HPCnTempGB: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(580000, "Broj ne može biti veći od 580TB")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  HPCnDiskGB: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(2000000, "Broj ne može biti veći od 2PB")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  CLOUDnVM: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(100, "Broj ne može biti veći od 100")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  CLOUDnSlotsCPU: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(1000, "Broj ne može biti veći od 1000")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  CLOUDnRAM: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(1000, "Broj ne može biti veći od 2TB")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  CLOUDnRAMVM: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(1000, "Broj ne može biti veći od 2TB")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  CLOUDnFastDiskGB: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(500, "Broj ne može biti veći od 500GB")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  CLOUDnDiskGB: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(10000, "Broj ne može biti veći od 10TB")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  CLOUDnIPs: yup.number()
    .min(1, "Broj ne može biti manji od 1")
    .max(10, "Broj ne može biti veći od 10")
    .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
});


const ResearchProjectRequestSelected = ({projectType}) => {
  const [projectTarget, setProjectTarget] = useState(undefined)
  const navigate = useNavigate()

  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYesCall, setOnYesCall] = useState(undefined)
  const [onYesCallArg, setOnYesCallArg] = useState(undefined)

  const { projId } = useParams()
  const rhfProps = useForm({
    resolver: yupResolver(schemaResolve),
    criteriaMode: "all",
    shouldFocusError: true,
    defaultValues: {
      requestName: '',
      requestExplain: '',
      startDate: '',
      endDate: '',
      requestResourceType: [],
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
      scientificSoftware: [],
      scientificSoftwareExtra: '',
      scientificSoftwareHelp: false
    }
  });

  const {status, data: croRisProjects, error, isFetching} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRIS,
      staleTime: 15 * 60 * 1000
  })

  useEffect(() => {
    if (status ==='success'
      && croRisProjects['status']['code'] === 200
      && croRisProjects['data']) {

      let projectsLead = croRisProjects['data']['projects_lead_info']
      let projectTarget = projectsLead.filter(project =>
        project['croris_id'] === Number(projId)
      )

      setProjectTarget(projectTarget[0])
    }
  }, [croRisProjects?.data?.projects_lead_info])

  const addMutation = useMutation({
    mutationFn: (data) => {
      return addResearchProject(data)
    },
  })

  const doAdd = (data) => addMutation.mutate(data, {
    onSuccess: () => {
      //queryClient.invalidateQueries('my-projects');
      toast.success(
        <span className="font-monospace text-dark">
          Zahtjev temeljem istraživačkog projekta je uspješno podnesen
        </span>, {
          toastId: 'researchproj-ok-add',
          autoClose: 2500,
          delay: 500,
          onClose: setTimeout(() => {navigate(url_ui_prefix + '/moji-zahtjevi')}, 1500)
        }
      )
    },
    onError: (error) => {
      toast.error(
        <span className="font-monospace text-dark">
          Zahtjev nije bilo moguće podnijeti:
          { error.message }
        </span>, {
          toastId: 'researchproj-fail-add',
          autoClose: 2500,
          delay: 500
        }
      )
    }
  })


  function onYesCallback() {
    if (onYesCall == 'doaddreq') {
      const res = validateDomainAndFields(onYesCallArg)
      if (res)
        doAdd(onYesCallArg)
    }
  }

  const onSubmit = data => {
    let dataToSend = new Object()

    dataToSend['croris_collaborators'] = croRisProjects['data']['projects_lead_users'][projId]
    dataToSend['croris_end'] = convertToAmerican(convertToIso8601(projectTarget.end))
    dataToSend['croris_finance'] = projectTarget.finance
    dataToSend['croris_institute'] = projectTarget.institute.name
    dataToSend['croris_id'] = projId
    dataToSend['croris_identifier'] = projectTarget.identifier
    dataToSend['croris_lead'] = `${croRisProjects['data']['person_info']['first_name']} ${croRisProjects['data']['person_info']['last_name']}`
    dataToSend['croris_start'] = convertToAmerican(convertToIso8601(projectTarget.start))
    dataToSend['croris_summary'] = projectTarget.summary
    dataToSend['croris_title'] = projectTarget.title
    dataToSend['croris_type'] = projectTarget.type
    dataToSend['date_end'] =  convertToAmerican(convertToIso8601(projectTarget.end))
    dataToSend['date_start'] = convertToAmerican(convertToIso8601(projectTarget.start))
    dataToSend['name'] = projectTarget.title
    dataToSend['reason'] = data['requestExplain']
    dataToSend['project_type'] = projectType
    if (data.scientificSoftware)
      dataToSend['science_software'] = data.scientificSoftware.map(e => e.value)
    else
      dataToSend['science_software'] = []
    dataToSend['science_extrasoftware'] = data['scientificSoftwareExtra']
    dataToSend['science_extrasoftware_help'] = data['scientificSoftwareHelp'] ? true : false
    dataToSend['science_field'] = data['scientificDomain']
    dataToSend['resources_numbers'] = {
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
    dataToSend['resources_type'] = data['requestResourceType']
    dataToSend['state'] = 'submit'
    // doAdd(dataToSend)
    // alert(JSON.stringify(dataToSend, null, 2));

    setAreYouSureModal(!areYouSureModal)
    setModalTitle("Podnošenje novog korisničkog zahtjeva")
    setModalMsg("Da li ste sigurni da želite podnijeti novi zahtjev?")
    setOnYesCall('doaddreq')
    setOnYesCallArg(dataToSend)
  }

  if (projectTarget)
  {
    let projectsLeadUsers = croRisProjects['data']['projects_lead_users'][projId]
    let person_info = croRisProjects['data']['person_info']

    return (
      <>
        <ModalAreYouSure
          isOpen={areYouSureModal}
          toggle={() => setAreYouSureModal(!areYouSureModal)}
          title={modalTitle}
          msg={modalMsg}
          onYes={onYesCallback}
        />
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
                  project={projectTarget}
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
              <Row className="mt-2 mb-5 text-center">
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
      </>
    )
  }
};


const GeneralInfo = ({project, person_info, projectsLeadUsers}) => {
  const { control, formState: {errors} } = useFormContext();

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
            rows="2"
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
      <Row className="mt-3">
        <Col md={{size: 12}}>
          <Label
            htmlFor="requestExplain"
            aria-label="requestExplain">
            Obrazloženje:
            <span className="ms-1 fw-bold text-danger">*</span>
          </Label>
          <Controller
            name="requestExplain"
            control={control}
            rules={{required: true}}
            render={ ({field}) =>
              <textarea
                id="requestExplain"
                {...field}
                aria-label="requestExplain"
                type="text"
                className={`form-control ${errors && errors.requestExplain ? "is-invalid" : ''}`}
                rows="7"
              />
            }
          />
          <ErrorMessage
            errors={errors}
            name="requestExplain"
            render={({ message }) =>
              <FormFeedback className="end-0">
                { message }
              </FormFeedback>
            }
          />
        </Col>
        <Col>
        </Col>
      </Row>
    </>
  )
}

export default ResearchProjectRequestSelected;
