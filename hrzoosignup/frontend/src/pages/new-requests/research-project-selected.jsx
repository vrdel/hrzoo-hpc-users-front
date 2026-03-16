import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  useForm,
  Controller,
  useFormContext,
  FormProvider,
} from "react-hook-form";
import RequestHorizontalRuler from 'Components/RequestHorizontalRuler';
import {
  Badge,
  Button,
  Col,
  Form,
  Row,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile,
} from '@fortawesome/free-solid-svg-icons';
import { fetchCroRISMe } from 'Api/croris';
import { useQuery, useMutation } from '@tanstack/react-query';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import ResourceFields from 'Components/fields-request/ResourceFields';
import BaseNewScientificDomain from 'Components/fields-request/ScientificDomain';
import { toast } from 'react-toastify'
import { addResearchProject } from 'Api/projects';
import { convertToIso8601 } from 'Utils/dates';
import { url_ui_prefix } from 'Config/general';
import ModalAreYouSure from 'Components/ModalAreYouSure';
import validateDomainAndFields from 'Utils/validate-domain-fields';
import { convertToAmerican } from 'Utils/dates';
import { FormattedMessage, useIntl } from 'react-intl';
import * as yup from "yup";
import { AuthContext } from 'Components/AuthContextProvider';
import RequestUsesAISelectOptions from 'Config/request-usesai';
import { CustomReactSelect } from 'Components/CustomReactSelect';
import { extractYesNoValue } from 'Utils/select-tools';


const ExtractUsers = ({projectUsers}) => {
  return (
    projectUsers.map((user, i) =>
      <React.Fragment key={`wrap-project-users-${i}`}>
        <Badge bg="secondary" className="fs-6 mb-2 fw-normal" key={`project-users-${i}`}>
          { user.first_name }
          {' '}
          { user.last_name }
        </Badge>
        {'   '}
      </React.Fragment>
    )
  )
}

function intlSchemaResolve(intl) {
  let schemaResolve = yup.object().shape({
    requestExplain: yup.string().required(
      intl.formatMessage({
        defaultMessage: "Obvezno",
        description: 'schema-mandatory'
      })
    ),
    requestUsesAI: yup.object().shape({
      'label': yup.string().required(),
      'value': yup.string().required()
    }).required(
      intl.formatMessage({
        defaultMessage: "Obvezno",
        description: 'schema-mandatory'
      })
    ),
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
    requestResourceType: yup.array().of(yup.object()),
    HPCnSlotsCPU: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(6656, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: 6656
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    HPCnSlotsGPU: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(80, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: 80
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    HPCnSlotsRAM: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(4000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: 4000
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    HPCnRAM: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(4000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: 4000
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    HPCnTempGB: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(580000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: '580TB'
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    HPCnDiskGB: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(2000000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: '2PB'
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    CLOUDnVM: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(100, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: 100
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    CLOUDnSlotsCPU: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(1000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: 1000
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    CLOUDnRAM: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(2000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: '2TB'
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    CLOUDnRAMVM: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(2000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: '2TB'
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    CLOUDnFastDiskGB: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(500, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: '500GB'
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    CLOUDnDiskGB: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(10000, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: '10TB'
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
    CLOUDnIPs: yup.number()
      .min(1, intl.formatMessage({
        defaultMessage: "Broj ne može biti manji od 1",
        description: "schema-less-1"
      }))
      .max(10, intl.formatMessage({
          defaultMessage: "Broj ne može biti veći od {number}",
          description: "schema-great-n"
        },
        {
          number: 10
        }
      ))
      .transform((value) => (isNaN(value) ? undefined : value)).nullable(),
  });

  return schemaResolve
}



const ResearchProjectRequestSelected = ({projectType}) => {
  const [projectTarget, setProjectTarget] = useState(undefined)
  const navigate = useNavigate()

  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYesCall, setOnYesCall] = useState(undefined)
  const [onYesCallArg, setOnYesCallArg] = useState(undefined)
  const { userDetails, csrfToken } = useContext(AuthContext)
  const intl = useIntl()

  const { projId } = useParams()
  const rhfProps = useForm({
    resolver: yupResolver(intlSchemaResolve(intl)),
    criteriaMode: "all",
    shouldFocusError: true,
    defaultValues: {
      requestName: '',
      requestExplain: '',
      requestUsesAI: '',
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
    }
  });

  const {status, data: croRisProjects, error, isFetching} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRISMe,
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
      return addResearchProject(data, csrfToken)
    },
  })

  const doAdd = (data) => addMutation.mutate(data, {
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      toast.success(
        <span className="font-monospace text-dark">
          <FormattedMessage
            defaultMessage="Zahtjev temeljem istraživačkog projekta je uspješno podnesen"
            description="researchselected-toast-msg-success"
          />
        </span>, {
          toastId: 'researchproj-ok-add',
          autoClose: 2500,
          delay: 500,
          onClose: () => {navigate(url_ui_prefix + '/my-requests')}
        }
      )
    },
    onError: (error) => {
      toast.error(
        <span className="font-monospace text-dark">
          <FormattedMessage
            defaultMessage="Zahtjev nije bilo moguće podnijeti:"
            description="researchselected-toast-msg-fail"
          />
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
      const res = validateDomainAndFields(onYesCallArg, intl)
      if (res)
        doAdd(onYesCallArg)
    }
  }

  const onSubmit = data => {
    let dataToSend = new Object()

    dataToSend['croris_collaborators'] = croRisProjects['data']['projects_lead_users'][projId]
    dataToSend['croris_end'] = convertToAmerican(convertToIso8601(projectTarget.end))
    dataToSend['croris_finance'] = projectTarget.finance
    dataToSend['croris_institute'] = projectTarget.institute
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
    dataToSend['uses_ai_tech'] = extractYesNoValue(data['requestUsesAI'])
    dataToSend['project_type'] = projectType
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
    setModalTitle(intl.formatMessage({
      defaultMessage: "Podnošenje novog korisničkog zahtjeva",
      description: "research-project-selected-modaltitle"
    }))
    setModalMsg(intl.formatMessage({
      defaultMessage: "Da li ste sigurni da želite podnijeti novi zahtjev?",
      description: "research-project-selected-modalmsg"
    }))
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
                <h4 className="ms-4 mb-3 mt-4">
                  <FormattedMessage
                    description="researchselected-general"
                    defaultMessage="Opći dio"
                  />
                </h4><br/>
              </Col>
            </Row>
            <Row>
              <Col md={{span: 10, offset: 1}}>
                <GeneralInfo
                  project={projectTarget}
                  person_info={person_info}
                  projectsLeadUsers={projectsLeadUsers}
                />
              </Col>
            </Row>
            <RequestUsesAI />
            <BaseNewScientificDomain />
            <ResourceFields />
            <Row>
              <RequestHorizontalRuler />
              <Row className="mt-2 mb-5 text-center">
                <Col>
                  <Button
                    disabled={userDetails.person_type === 'foreign'}
                    size="lg"
                    variant="success"
                    id="submit-button"
                    type="submit"
                  >
                    <FontAwesomeIcon icon={faFile}/>{' '}
                    <FormattedMessage
                      defaultMessage="Podnesi zahtjev"
                      description="researchselected-label-submit"
                    />
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
        <Col className="text-left" md={{span: 10}}>
          <Form.Label
            htmlFor="projectTitle"
            aria-label="projectTitle">
            <FormattedMessage
              description="researchselected-projecttitle"
              defaultMessage="Naziv:"
            />
          </Form.Label>
        </Col>
        <Col className="text-left" md={{span: 2}}>
          <Form.Label
            htmlFor="projectIdentifier"
            aria-label="projectIdentifier">
            <FormattedMessage
              description="researchselected-projectid"
              defaultMessage="Šifra:"
            />
          </Form.Label>
        </Col>
        <div className="w-100"/>
        <Col md={{span: 10}}>
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
        <Col md={{span: 2}}>
          <div className="p-2 fs-5">
            {
              project.identifier ?
                <Badge bg="secondary" className="fw-normal">
                  { project.identifier }
                </Badge>
              :
                '\u2212'
            }
          </div>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={{span: 4}}>
          <Form.Label
            htmlFor="projectTime"
            aria-label="projectTime"
            className="mr-1">
            <FormattedMessage
              description="researchselected-usageperiod"
              defaultMessage="Period korištenja:"
            />
          </Form.Label>
        </Col>
        <Col md={{span: 8}}>
          <Form.Label
            htmlFor="projectTime"
            aria-label="projectTime"
            className="mr-1">
            <FormattedMessage
              description="researchselected-users"
              defaultMessage="Osobe:"
            />
          </Form.Label>
        </Col>
        <div className="w-100"/>
        <Col md={{span: 4}}>
          <Form.Control
            disabled={true}
            className="p-2 fs-5 font-monospace"
            defaultValue={`${project.start} − ${ project.end }`}
          />
        </Col>
        <Col md={{span: 8}}>
          <div className="p-2">
            <Badge bg="dark" className="fs-6 mb-2 fw-normal">
              { person_info.first_name }
              {' '}
              { person_info.last_name }
            </Badge>
            {'   '}
            <ExtractUsers projectUsers={[...projectsLeadUsers]} />
          </div>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={{span: 12}}>
          <Form.Label
            htmlFor="requestExplain"
            aria-label="requestExplain">
            <FormattedMessage
              description="researchselected-explain"
              defaultMessage="Obrazloženje:"
            />
            <span className="ms-1 fw-bold text-danger">*</span>
          </Form.Label>
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
              <Form.Control.Feedback type="invalid" className="end-0">
                { message }
              </Form.Control.Feedback>
            }
          />
        </Col>
        <Col>
        </Col>
      </Row>
    </>
  )
}


const RequestUsesAI = ({fieldsDisabled=false}) => {
  const { control, getValues, setValue, formState: {errors} } = useFormContext();
  const intl = useIntl()

  return (
    <Row className="mt-4">
      <Row>
        <Col md={{span: 4, offset: 1}} sm={{span: 10}} lg={{span: 10, offset: 1}}  xl={{span: 10, offset: 1}} xxl={{span: 10, offset: 1}}>
          <Form.Label
            htmlFor="requestUsesAI"
            aria-label="requestUsesAI"
            className="mr-2 text-right form-label">
            <FormattedMessage
              description="requestusesai-description"
              defaultMessage="Projekt koristi tehnologije umjetne inteligencije:"
            />
          </Form.Label>
          <span className="ms-1 fw-bold text-danger">*</span>
        </Col>
      </Row>
      <Row>
        <Col md={{span: 1, offset: 1}} lg={{offset: 1, span: 2}} xs={{span: 6}} sm={{span: 6}}>
          <Controller
            name="requestUsesAI"
            rules={{required: true}}
            control={control}
            render={ ({field}) =>
              <CustomReactSelect
                aria-label="requestUsesAI"
                closeMenuOnSelect={true}
                controlWidth="100%"
                forwardedRef={field.ref}
                error={errors && errors.requestUsesAI ? true : false}
                id="requestUsesAI"
                isDisabled={fieldsDisabled}
                options={RequestUsesAISelectOptions(intl)}
                placeholder={intl.formatMessage({
                  defaultMessage: "Odaberi",
                  description: "requestusesai-placeholder"
                })}
                value={getValues('requestUsesAI')}
                onChange={(e) => setValue('requestUsesAI', e)}
              />
            }
          />
          <ErrorMessage
            errors={errors}
            name="requestUsesAI"
            render={({ message }) =>
              <Form.Control.Feedback type="invalid" className="end-0">
                { message }
              </Form.Control.Feedback>
            }
          />
        </Col>
      </Row>
    </Row>
  )
}


export default ResearchProjectRequestSelected;
