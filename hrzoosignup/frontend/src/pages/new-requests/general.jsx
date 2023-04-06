import React, { useContext } from 'react'
import RequestHorizontalRuler from '../../components/RequestHorizontalRuler';
import { CustomReactSelect } from '../../components/CustomReactSelect';
import ResourceFields from '../../components/fields-request/ResourceFields';
import BaseNewScientificDomain from '../../components/fields-request/ScientificDomain';
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Row,
} from 'reactstrap';
import {
  useForm,
  Controller,
  useFieldArray,
  FormProvider,
  useFormContext
} from "react-hook-form";
import { SharedData } from '../root';
import DatePicker from 'react-date-picker';
import { yupResolver } from '@hookform/resolvers/yup';
import { ErrorMessage } from '@hookform/error-message';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faFile,
  faPlus
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
      scientificSoftware: ''
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
        <Row className="mt-2 mb-2 text-center">
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
        <Col>
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
                rows="3"
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
        <Col>
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
        <BaseNewScientificDomain />
      </Row>
    </>
  )
}


const ScientificSoftware = () => {
  const { control, setValue, formState: {errors} } = useFormContext();
  const { listScientificSoftware, buildOptionsFromArray } = useContext(SharedData);

  return (
    <>
      <Row className="mt-5">
        <Col>
          <h4 className="ms-4 mb-3 mt-4">Znanstveni softver</h4><br/>
        </Col>
      </Row>
      <Row className="mt-1">
        <Col md={{size: 10, offset: 1}}>
          <Label
            htmlFor="requestScientificSoftware"
            aria-label="requestScientificSoftware"
            className="mr-2 text-right form-label">
            Aplikacije koje će se koristiti:
          </Label>
          <Controller
            name="requestScientificSoftware"
            control={control}
            rules={{required: true}}
            render={ ({field}) =>
              <CustomReactSelect
                aria-label="requestScientificSoftware"
                closeMenuOnSelect={false}
                forwardedRef={field.ref}
                id="requestResourceType"
                isMulti
                scientificSoftwareMultiValue={true}
                options={buildOptionsFromArray(listScientificSoftware)}
                placeholder="Popis aplikacija dostupnih na klasteru Supek"
                onChange={(e) => setValue('requestScientificSoftware', e)}
              />
            }
          />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={{size: 10, offset: 1}}>
          <Label
            htmlFor="requestExplain"
            aria-label="requestExplain">
            Dodatne aplikacije koje će biti potrebno instalirati:
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
                rows="3"
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
        <Col>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col sm={{offset: 1}}>
          <Label
            htmlFor="requestScientificSoftwareHelp"
            aria-label="requestScientificSoftwareHelp"
            className="mr-2 text-right form-label">
            Potrebna pomoć pri instalaciji:
          </Label>
          <Input type="checkbox" className="ms-3 fw-bold"/>
        </Col>
        <div className="w-100"></div>
        <Col sm={{offset: 1, size: 1}}>
        </Col>
      </Row>
    </>
  )
}


export default GeneralRequest;
