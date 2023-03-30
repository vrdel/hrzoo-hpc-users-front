import React, { useState, useContext } from 'react'
import RequestHorizontalRuler from '../../components/RequestHorizontalRuler';
import { CustomReactSelect } from '../../components/CustomReactSelect';
import {
  Col,
  Card,
  CardBody,
  ButtonGroup,
  CardFooter,
  CardHeader,
  Row,
  Button,
  Label,
  Form,
  FormGroup,
  InputGroup,
  Input,
  InputGroupText
} from 'reactstrap';
import { useForm, Controller, useFieldArray, useFormContext } from "react-hook-form";
import { SharedData } from '../root';
import DatePicker from 'react-date-picker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import '../../styles/datepicker.css';


const GeneralRequest = () => {
  const { control, handleSubmit, formState: { errors } } = useForm({
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
      ]
    }
  });
  const onSubmit = data => {
    alert(JSON.stringify(data, null, 2));
  }

  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)} className="needs-validation">
        <RequestHorizontalRuler />
        <GeneralFields control={control} errors={errors} handleSubmit={handleSubmit} />
        <ResourceFields control={control} errors={errors} />
        <RequestHorizontalRuler />
        <Row className="mt-2 mb-2 text-center">
          <Col>
            <Button size="lg" color="success" id="submit-button" type="submit">Podnesi zahtjev</Button>
          </Col>
        </Row>
      </Form>
    </>
  )
};


const GeneralFields = ({control, errors}) => {
  const {
    fields: fields_domain,
    append: domain_append,
    remove: domain_remove
  } = useFieldArray({
    control,
    name: "scientificDomain",
  });

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
                className="form-control"
                rows="1"
                required={true}
              />
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
                className="form-control"
                rows="3"
                required={true}
              />
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
                className="mt-2 me-3"
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
                locale="hr-HR"
                className="ms-3"
              />
            }
          />
        </Col>
      </Row>
      <Row className="mt-3 d-flex g-0">
        <Col md={{offset: 1}}>
          <Label
            htmlFor="scientificDomain"
            aria-label="scientificDomain"
            className="mt-2 text-right form-label">
            Znanstveno područje:
          </Label>
          <Row>
            {
              fields_domain.map((item, index) => (
                <>
                  <Col className="mb-3" md={{size: 5}}>
                    <ScientificDomain control={control} index={index}
                      item={item} remove={domain_remove} />
                  </Col>
                  {
                    index === fields_domain.length - 1 &&
                      <Col md={{size: 3, offset: 1}}>
                        <AddNewScientificDomain append={domain_append} />
                      </Col>
                  }
                </>
              ))
            }
          </Row>
        </Col>
      </Row>
    </>
  )
}


const AddNewScientificDomain = ({append}) => {
  return (
    <Button outline color="secondary" onClick={() =>
      append({
      'name': '',
      'percent': '',
      'scientificfields': [{
        'name': '',
        'percent': ''
      }]})}>
      Dodaj novo znanstveno područje
    </Button>
  )
}


const ScientificDomain = ({control, index: domain_index, item: domain_item,
  remove: domain_remove}) => {
  const { listScientificDomain, buildOptionsFromArray } = useContext(SharedData);

  const {
    fields: fields_scientificfields,
    append: field_append,
    remove: field_remove
  } = useFieldArray({
    control,
    name: `scientificDomain.${domain_index}.scientificfields`
  })


  return (
    <Card key={domain_item.id}>
      <CardHeader className="d-inline-flex align-items-center">
        <Controller
          name={`scientificDomain.${domain_index}.name`}
          control={control}
          rules={{required: true}}
          render={ ({field}) =>
            <CustomReactSelect
              aria-label="scientificDomain"
              controlWidth="300px"
              forwardedRef={field.ref}
              id="scientificDomain"
              options={buildOptionsFromArray(listScientificDomain)}
              placeholder="Područje"
            />
          }
        />
        <InputGroup>
          <Controller
            name={`scientificDomain.${domain_index}.percent`}
            aria-label="scientificDomainPercent"
            control={control}
            rules={{required: true}}
            render={ ({field}) =>
              <Input
                {...field}
                className="ms-1 form-control text-center"
                placeholder="Udio"
                type="number"
              />
            }
          />
          <InputGroupText>
            %
          </InputGroupText>
        </InputGroup>
        <Button
          size="sm"
          color="danger"
          type="button"
          className="ms-1"
          onClick={() => domain_remove(domain_index)}
        >
          <FontAwesomeIcon icon={faTimes}/>
        </Button>
      </CardHeader>
      <CardBody >
        {
          fields_scientificfields.map((field_item, field_index) => (
            <Row noGutters key={field_item.id} className="mb-2" >
              <Col className="d-inline-flex align-items-center">
                <ScientificFields control={control} index={field_index} />
                <InputGroup>
                  <Controller
                    name={`scientificfields.${field_index}.percent`}
                    aria-label="scientificField"
                    control={control}
                    rules={{required: true}}
                    render={ ({field}) =>
                      <Input
                        {...field}
                        className="ms-1 form-control text-center"
                        placeholder="Udio"
                        type="number"
                      />
                    }
                  />
                  <InputGroupText>
                    %
                  </InputGroupText>
                </InputGroup>
                {
                  field_index > 0 ?
                    <Button
                      size="sm"
                      color="danger"
                      className="ms-1"
                      type="button"
                      onClick={() => field_remove(field_index)}
                    >
                      <FontAwesomeIcon icon={faTimes}/>
                    </Button>
                  :
                    <Button
                      size="sm"
                      color="white"
                      className="ms-1 border-white"
                      disabled={true}
                      type="button"
                    >
                      <FontAwesomeIcon color="white" icon={faTimes}/>
                    </Button>
                }
              </Col>
            </Row>
          ))
        }
        <Row noGutters>
          <Col className="text-center">
            <Button className="mt-3" size="sm" outline color="secondary" onClick={() =>
              field_append({'name': '', 'percent': ''})}>
              Dodaj novo znanstveno polje
            </Button>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const ScientificFields = ({control, index}) => {
  const { mapDomainsToFields, listScientificDomain, buildOptionsFromArray } = useContext(SharedData);

  return (
    <Controller
      name={`scientificDomain.${index}.name`}
      control={control}
      rules={{required: true}}
      render={ ({field}) =>
        <CustomReactSelect
          aria-label="scientificDomain"
          controlWidth="300px"
          forwardedRef={field.ref}
          id="scientificDomain"
          options={buildOptionsFromArray(mapDomainsToFields['TEHNIČKE ZNANOSTI'])}
          placeholder="Polje"
        />
      }
    />
  )
}


const ResourceFields = ({control, errors}) => {
  const { ResourceTypesToSelect } = useContext(SharedData);

  return (
    <>
      <Row className="mt-5">
        <Col>
          <h4 className="ms-4 mb-3 mt-4">Resursi</h4><br/>
        </Col>
      </Row>
      <Row>
        <Col md={{size: 2, offset: 1}}>
          <Label
            htmlFor="nSlotsCPU"
            aria-label="nSlotsCPU"
            className="mr-2 form-label text-center">
            Prosječan broj procesorskih jezgri po poslu:
          </Label>
        </Col>
        <Col md={{size: 2}}>
          <Label
            htmlFor="nSlotsGPU"
            aria-label="nSlotsGPU"
            className="mr-2 form-label text-center">
            Prosječan broj grafičkih procesora po poslu:
          </Label>
        </Col>
        <Col md={{size: 2}}>
          <Label
            htmlFor="nRAM"
            aria-label="nRAM"
            className="mr-2 form-label text-center">
            Prosječna količina radne memorije po poslu (GB):
          </Label>
        </Col>
        <Col md={{size: 2}}>
          <Label
            htmlFor="nTempGB"
            aria-label="nTempGB"
            className="mr-2 form-label text-center">
            Prosječna količina privremenog prostora po poslu (GB):
          </Label>
        </Col>
        <Col md={{size: 2}}>
          <Label
            htmlFor="nDiskGB"
            aria-label="nDiskGB"
            className="mr-2 form-label text-center">
            Ukupna količina spremišnog prostora po poslu (GB):
          </Label>
        </Col>
        <div className="w-100"></div>
        <Col md={{size: 2, offset: 1}}>
          <InputGroup>
            <Controller
              name="nSlotsCPU"
              aria-label="nSlotsCPU"
              control={control}
              rules={{required: true}}
              render={ ({field}) =>
                <Input
                  {...field}
                  className="form-control text-center"
                  type="number"
                />
              }
            />
            <InputGroupText>
              CPU
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Controller
              name="nSlotsGPU"
              aria-label="nSlotsGPU"
              control={control}
              rules={{required: true}}
              render={ ({field}) =>
                <Input
                  {...field}
                  className="form-control text-center"
                  type="number"
                />
              }
            />
            <InputGroupText>
              GPU
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Controller
              name="nRAM"
              aria-label="nRAM"
              control={control}
              rules={{required: true}}
              render={ ({field}) =>
                <Input
                  {...field}
                  className="form-control text-center"
                  type="number"
                />
              }
            />
            <InputGroupText>
              RAM
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Controller
              name="nTempGB"
              aria-label="nTempGB"
              control={control}
              rules={{required: true}}
              render={ ({field}) =>
                <Input
                  {...field}
                  className="form-control text-center"
                  type="number"
                />
              }
            />
            <InputGroupText>
              Temp
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Controller
              name="nDiskGB"
              aria-label="nDiskGB"
              control={control}
              rules={{required: true}}
              render={ ({field}) =>
                <Input
                  {...field}
                  className="form-control text-center"
                  type="number"
                />
              }
            />
            <InputGroupText>
              Disk
            </InputGroupText>
          </InputGroup>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={{size: 3, offset: 1}}>
          <Label
            htmlFor="requestResourceType"
            aria-label="requestResourceType"
            className="mr-2 text-right form-label">
            Tip resursa:
          </Label>
          <Controller
            name="requestResourceType"
            control={control}
            rules={{required: true}}
            render={ ({field}) =>
              <CustomReactSelect
                aria-label="requestResourceType"
                closeMenuOnSelect={false}
                controlWidth="400px"
                forwardedRef={field.ref}
                id="requestResourceType"
                isMulti
                options={ResourceTypesToSelect}
                placeholder="Odaberi"
                resourceTypeMultiValue={true}
              />
            }
          />
        </Col>
      </Row>
    </>
  )
}



export default GeneralRequest;
