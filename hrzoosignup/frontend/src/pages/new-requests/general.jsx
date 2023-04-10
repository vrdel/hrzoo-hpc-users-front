import React from 'react'
import RequestHorizontalRuler from '../../components/RequestHorizontalRuler';
import ResourceFields from '../../components/fields-request/ResourceFields';
import BaseNewScientificDomain from '../../components/fields-request/ScientificDomain';
import ScientificSoftware from '../../components/fields-request/ScientificSoftware';
import {
  Button,
  Col,
  Form,
  FormFeedback,
  Label,
  Row,
} from 'reactstrap';
import {
  useForm,
  Controller,
  FormProvider,
  useFormContext
} from "react-hook-form";
import DatePicker from 'react-date-picker';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
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


const GeneralRequest = ({projectType}) => {
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
          Zahtjev temeljem istraživačkog projekta je uspješno podnesen
        </span>, {
          toastId: 'genproj-ok-add',
          autoClose: 2500,
          delay: 500
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


  const onSubmit = data => {
    let dataToSend = new Object()

    data['project_type'] = projectType
    dataToSend['date_end'] =  data['endDate']
    dataToSend['date_start'] = data['startDate']
    dataToSend['name'] = data['requestName']
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
      'nSlotsCPU': data['nSlotsCPU'],
      'nSlotsGPU': data['nSlotsGPU'],
      'nSlotsRAM': data['nRAM'],
      'nTempGB': data['nTempGB'],
      'nDiskGB': data['nDiskGB']
    }
    dataToSend['resources_type'] = data['requestResourceType']
    dataToSend['state'] = 'submitted'
    // doAdd(dataToSend)
    alert(JSON.stringify(data, null, 2));
  }

  return (
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
  )
};


const GeneralFields = () => {
  const { control, formState: {errors} } = useFormContext();

  return (
    <>
      <Row>
        <Col>
          <h4 className="ms-4 mb-3 mt-4">Opći dio</h4><br/>
        </Col>
      </Row>
      <Row>
        <Col md={{size: 10, offset: 1}}>
          <Label
            htmlFor="requestName"
            aria-label="requestName">
            Naziv:
            <span className="ms-1 fw-bold text-danger">*</span>
          </Label>
          <Controller
            name="requestName"
            control={control}
            rules={{required: true}}
            render={ ({field}) =>
              <textarea
                id="requestName"
                {...field}
                aria-label="requestName"
                type="text"
                className={`form-control ${errors && errors.requestName ? "is-invalid" : ''}`}
                rows="1"
              />
            }
          />
          <ErrorMessage
            errors={errors}
            name="requestName"
            render={({ message }) =>
              <FormFeedback invalid className="end-0">
                { message }
              </FormFeedback>
            }
          />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={{size: 10, offset: 1}}>
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
                rows="4"
              />
            }
          />
          <ErrorMessage
            errors={errors}
            name="requestExplain"
            render={({ message }) =>
              <FormFeedback invalid className="end-0">
                { message }
              </FormFeedback>
            }
          />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={{size: 5, offset: 1}}>
          <Label
            htmlFor="requestName"
            aria-label="requestName">
            Period korištenja:
            <span className="ms-1 fw-bold text-danger">*</span>
          </Label>
        </Col>
        <Col md={{size: 10, offset: 1}} style={{whiteSpace: 'nowrap'}}>
          <Controller
            name="startDate"
            control={control}
            rules={{required: true}}
            render={ ({field}) =>
              <DatePicker
                {...field}
                locale="hr-HR"
                required={true}
                className={`mt-2 me-3 ${errors && errors.startDate ? "is-invalid" : ''}`}
              />
            }
          />
          {'\u2212'}
          <Controller
            name="endDate"
            control={control}
            rules={{required: true}}
            render={ ({field}) =>
              <DatePicker
                {...field}
                required={true}
                locale="hr-HR"
                className={`ms-3 ${errors && errors.endDate ? "is-invalid" : ''}`}
              />
            }
          />
        </Col>
        <Col className="ms-1">
          <BaseNewScientificDomain />
        </Col>
      </Row>
    </>
  )
}


export default GeneralRequest;
