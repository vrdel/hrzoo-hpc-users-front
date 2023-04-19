import React, { useContext, useState } from 'react'
import RequestHorizontalRuler from '../../components/RequestHorizontalRuler';
import ResourceFields from '../../components/fields-request/ResourceFields';
import GeneralFields from '../../components/fields-request/GeneralFields';
import ScientificSoftware from '../../components/fields-request/ScientificSoftware';
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
import { toast } from 'react-toastify'
import { addGeneralProject } from '../../api/projects';
import '../../styles/datepicker.css';
import { useMutation } from '@tanstack/react-query';
import { url_ui_prefix } from '../../config/general';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/AuthContextProvider';
import ModalAreYouSure from '../../components/ModalAreYouSure';
import validateDomainAndFields from '../../utils/validate-domain-fields';
import validateRequestDates from '../../utils/validate-dates-startend';


const GeneralRequest = ({projectType}) => {
  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYesCall, setOnYesCall] = useState(undefined)
  const [onYesCallArg, setOnYesCallArg] = useState(undefined)

  const { userDetails } = useContext(AuthContext)

  const navigate = useNavigate()

  const rhfProps = useForm({
    defaultValues: {
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
      scientificSoftwareHelp: ''
    }
  });

  const addMutation = useMutation({
    mutationFn: (data) => {
      return addGeneralProject(data)
    },
  })

  const doAdd = (data) => addMutation.mutate(data, {
    onSuccess: () => {
      //queryClient.invalidateQueries('my-projects');
      toast.success(
        <span className="font-monospace text-dark">
          Zahtjev je uspješno podnesen
        </span>, {
          toastId: 'genproj-ok-add',
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
    dataToSend['date_end'] =  data['endDate']
    dataToSend['date_start'] = data['startDate']
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
      'CLOUDnRAMVM': data['CLOUDnRAMVM'],
      'CLOUDnDiskGB': data['CLOUDnDiskGB'],
      'CLOUDnFastDiskGB': data['CLOUDnFastDiskGB'],
      'CLOUDnIPs': data['CLOUDnIPs'],
    }
    dataToSend['resources_type'] = data['requestResourceType']
    dataToSend['state'] = 'submit'
    // alert(JSON.stringify(dataToSend, null, 2));

    setAreYouSureModal(!areYouSureModal)
    setModalTitle("Podnošenje novog korisničkog zahtjeva")
    setModalMsg("Da li ste sigurni da želite podnijeti novi zahtjev?")
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
          <GeneralFields />
          <ScientificSoftware />
          <ResourceFields />
          <RequestHorizontalRuler />
          <Row className="mt-2 mb-5 text-center">
            <Col>
              <Button size="lg" color="success" id="submit-button" type="submit">
                <FontAwesomeIcon icon={faFile}/>{' '}
                Podnesi zahtjev
              </Button>
            </Col>
          </Row>
        </Form>
      </FormProvider>
    </>
  )
};


export default GeneralRequest;
