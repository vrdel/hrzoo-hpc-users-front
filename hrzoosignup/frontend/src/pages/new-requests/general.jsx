import React, { useContext, useState } from 'react'
import RequestHorizontalRuler from 'Components/RequestHorizontalRuler';
import ResourceFields from 'Components/fields-request/ResourceFields';
import GeneralFields from 'Components/fields-request/GeneralFields';
import ScientificSoftware from 'Components/fields-request/ScientificSoftware';
import {
  Button,
  Col,
  Form,
  Row,
} from 'reactstrap';
import {
  useForm,
  FormProvider,
} from "react-hook-form";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile,
} from '@fortawesome/free-solid-svg-icons';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify'
import { addGeneralProject } from 'Api/projects';
import 'Styles/datepicker.css';
import { useMutation } from '@tanstack/react-query';
import { url_ui_prefix } from 'Config/general';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from 'Components/AuthContextProvider';
import ModalAreYouSure from 'Components/ModalAreYouSure';
import validateDomainAndFields from 'Utils/validate-domain-fields';
import validateRequestDates from 'Utils/validate-dates-startend';
import { convertToAmerican } from 'Utils/dates.jsx';
import {FormattedMessage} from 'react-intl';
import { useIntl } from 'react-intl'
import * as yup from "yup";


function intlSchemaResolve(intl) {
  let schemaGeneralResolve = yup.object().shape({
    requestName: yup.string().required(
      intl.formatMessage({
        defaultMessage: "Obvezno",
        description: 'schema-mandatory'
      })
    ),
    requestExplain: yup.string().required(
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
    startDate: yup.date().required(
      intl.formatMessage({
        defaultMessage: "Obvezno",
        description: 'schema-mandatory'
      })
    ),
    endDate: yup.date().required(
      intl.formatMessage({
        defaultMessage: "Obvezno",
        description: 'schema-mandatory'
      })
    ),
    scientificSoftware: yup.array().min(0).of(yup.object()),
    scientificSoftwareExtra: yup.string(),
    scientificSoftwareHelp: yup.boolean(),
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

  return schemaGeneralResolve
}


export const GeneralRequest = ({projectType, schemaResolve=undefined}) => {
  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYesCall, setOnYesCall] = useState(undefined)
  const [onYesCallArg, setOnYesCallArg] = useState(undefined)

  const { userDetails, csrfToken } = useContext(AuthContext)
  const intl = useIntl()
  const navigate = useNavigate()

  const rhfProps = useForm({
    resolver: yupResolver(!schemaResolve ? intlSchemaResolve(intl) : schemaResolve),
    criteriaMode: "all",
    shouldFocusError: true,
    defaultValues: {
      requestName: '',
      requestExplain: '',
      startDate: '',
      endDate: '',
      requestInstitute: userDetails.person_institution,
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

  const addMutation = useMutation({
    mutationFn: (data) => {
      return addGeneralProject(data, csrfToken)
    },
  })

  const doAdd = (data) => addMutation.mutate(data, {
    onSuccess: () => {
      //queryClient.invalidateQueries('my-projects');
      toast.success(
        <span className="font-monospace text-dark">
          <FormattedMessage
            defaultMessage="Zahtjev je uspješno podnesen"
            description="newrequest-toast-ok"
          />
        </span>, {
          toastId: 'genproj-ok-add',
          autoClose: 2500,
          delay: 500,
          onClose: setTimeout(() => {navigate(url_ui_prefix + '/my-requests')}, 1500)
        }
      )
    },
    onError: (error) => {
      toast.error(
        <span className="font-monospace text-dark">
          <FormattedMessage
            defaultMessage="Zahtjev nije bilo moguće podnijeti: { errmsg }"
            description="newrequest-toast-fail"
            values={{
              errmsg: error.message
            }}
          />
        </span>, {
          toastId: 'genproj-fail-add',
          autoClose: 2500,
          delay: 500
        }
      )
    }
  })

  function onYesCallback() {
    if (onYesCall == 'doaddreq') {
      const resDates = validateRequestDates(onYesCallArg['date_start'],
        onYesCallArg['date_end'])
      const resDomains = validateDomainAndFields(onYesCallArg)
      if (resDomains && resDates)
        doAdd(onYesCallArg)
    }
  }

  const onSubmit = data => {
    let dataToSend = new Object()

    data['project_type'] = projectType
    dataToSend['date_end'] =  convertToAmerican(data['endDate'])
    dataToSend['date_start'] = convertToAmerican(data['startDate'])
    dataToSend['name'] = data['requestName']
    dataToSend['reason'] = data['requestExplain']
    dataToSend['institute'] = userDetails.person_institution
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
    //alert(JSON.stringify(dataToSend, null, 2));

    setAreYouSureModal(!areYouSureModal)
    setModalTitle(intl.formatMessage({
      defaultMessage: "Podnošenje novog korisničkog zahtjeva",
      description: "newrequest-modaltitle"
    }))
    setModalMsg(intl.formatMessage({
      defaultMessage: "Da li ste sigurni da želite podnijeti novi zahtjev?",
      description: "newrequest-modalmsg"
    }))
    setOnYesCall('doaddreq')
    setOnYesCallArg(dataToSend)
  }

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
          <GeneralFields isInstitute={projectType === 'research-institutional' ? true : false}/>
          <ScientificSoftware />
          <ResourceFields />
          <RequestHorizontalRuler />
          <Row className="mt-2 mb-5 text-center">
            <Col>
              <Button
                disabled={userDetails.person_type === 'foreign'}
                size="lg"
                color="success"
                id="submit-button"
                type="submit"
              >
                <FontAwesomeIcon icon={faFile}/>{' '}
                <FormattedMessage
                  defaultMessage="Podnesi zahtjev"
                  description="newrequest-general-button-label"
                />
              </Button>
            </Col>
          </Row>
        </Form>
      </FormProvider>
    </>
  )
};


export default GeneralRequest;
