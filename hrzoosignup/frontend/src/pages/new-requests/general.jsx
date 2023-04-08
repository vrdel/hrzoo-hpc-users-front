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
import '../../styles/datepicker.css';


const GeneralRequest = () => {
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
      requestScientificSoftware: '',
      requestScientificSoftwareExtra: '',
      requestScientificSoftwareHelp: false
    }
  });

  const onSubmit = data => {
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
