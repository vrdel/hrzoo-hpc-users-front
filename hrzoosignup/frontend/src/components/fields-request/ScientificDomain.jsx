import React from 'react'
import { CustomReactSelect } from 'Components/CustomReactSelect';
import {
  Card,
  CardHeader,
  CardBody,
  Col,
  Button,
  Input,
  FormFeedback,
  InputGroup,
  InputGroupText,
  Label,
  Row,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import {
  Controller,
  useFormContext,
  useFieldArray
} from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import { FormattedMessage, useIntl } from 'react-intl';
import { buildMapDomainsToFields, buildListScientificDomain } from 'Config/scientific-domain';
import { buildOptionsFromArray } from 'Utils/select-tools';


const BaseNewScientificDomain = ({fieldsDisabled=false}) => {
  const { control, watch, formState: {errors} } = useFormContext();
  const {
    fields: fields_domain,
    append: domain_append,
    remove: domain_remove
  } = useFieldArray({
    control,
    name: "scientificDomain",
  });
  const watchFieldArray = watch("scientificDomain");
  const controlledFieldsDomain = fields_domain.map((field, index) => {
    return {
      ...field,
      ...watchFieldArray[index]
    };
  });

  return (
    <Row className="mt-3 d-flex g-0">
      <Col md={{offset: 1}}>
        <Label
          htmlFor="scientificDomain"
          aria-label="scientificDomain"
          className="mt-2 text-right form-label">
          <FormattedMessage
            defaultMessage="Znanstveno područje:"
            description="scientific-domain-title"
          />
          <span className="ms-1 fw-bold text-danger">*</span>
        </Label>
        <Row>
          {
            controlledFieldsDomain.map((item, index) => (
              <React.Fragment key={index}>
                <Col className="mb-3" sm={{size: 12}} md={{size: 10}} lg={{size: 10}} xl={{size: 5}}>
                  <ScientificDomain control={control} index={index}
                    item={item} remove={domain_remove} fieldsDisabled={fieldsDisabled} />
                </Col>
                {
                  index === controlledFieldsDomain.length - 1 &&
                    <Col sm={{size: 11, offset: 1}} md={{size: 6, offset: 3}} lg={{size: 6, offset: 3}} xl={{size: 3, offset: 1}}>
                      <AddNewScientificDomain append={domain_append} fieldsDisabled={fieldsDisabled} />
                    </Col>
                }
              </React.Fragment>
            ))
          }
        </Row>
      </Col>
    </Row>
  )
}


const AddNewScientificDomain = ({fieldsDisabled, append}) => {
  return (
    <Button disabled={fieldsDisabled} outline color="success" onClick={() =>
      append({
      'name': '',
      'percent': '',
      'scientificfields': [{
        'name': '',
        'percent': ''
      }]})}>
      <FontAwesomeIcon icon={faPlus}/>{' '}
      <FormattedMessage
        defaultMessage="Novo znanstveno područje"
        description="scientific-domain-new-domain"
      />
    </Button>
  )
}

const ScientificDomain = ({fieldsDisabled=false, index: domain_index, item: domain_item, remove:
  domain_remove}) => {
  const { control, setValue, getValues, formState: {errors} } = useFormContext();
  const intl = useIntl()

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
              controlWidth="64%"
              forwardedRef={field.ref}
              id={fieldsDisabled ? "scientificDomain-disabled" : "scientificDomain"}
              error={errors && errors.scientificDomain
                && errors.scientificDomain[domain_index]
                && errors.scientificDomain[domain_index]['name'] ? true : false}
              onChange={(e) => setValue(`scientificDomain.${domain_index}.name`, e)}
              options={buildOptionsFromArray(buildListScientificDomain(intl))}
              isDisabled={fieldsDisabled}
              value={getValues(`scientificDomain.${domain_index}.name`)}
              placeholder={ intl.formatMessage({
                defaultMessage: "Područje",
                description: "scientific-domain-placeholder-field"
              }) }
            />
          }
        />
        <ErrorMessage
          errors={errors}
          name={`scientificDomain.${domain_index}.name`}
          render={({ message }) =>
            <FormFeedback className="end-0">
              { message }
            </FormFeedback>
          }
        />
        <InputGroup style={{minWidth: '30%'}}>
          <Controller
            name={`scientificDomain.${domain_index}.percent`}
            aria-label="scientificDomainPercent"
            control={control}
            rules={{required: true}}
            render={ ({field}) =>
              <Input
                {...field}
                className={`ms-1 form-control text-center ${errors && errors.scientificDomain
                  && errors.scientificDomain[domain_index]
                  && errors.scientificDomain[domain_index]['percent'] ? "is-invalid" : ''}`}
                placeholder={intl.formatMessage({
                  defaultMessage: "Udio",
                  description: "scientific-domain-placeholder-ratio"
                })}
                disabled={fieldsDisabled}
                min="0"
                max="100"
                step="10"
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
          disabled={fieldsDisabled}
          className="ms-1 text-center"
          onClick={() => domain_remove(domain_index)}
        >
          <FontAwesomeIcon icon={faTimes}/>
        </Button>
      </CardHeader>
      <CardBody >
        {
          fields_scientificfields.map((field_item, field_index) => (
            <Row key={field_item.id} className="g-0 mb-2" >
              <Col className="d-inline-flex align-items-center">
                <ScientificFields fieldsDisabled={fieldsDisabled} domain_index={domain_index} field_index={field_index} />
                <InputGroup style={{minWidth: '30%'}}>
                  <Controller
                    name={`scientificDomain.${domain_index}.scientificfields.${field_index}.percent`}
                    aria-label="scientificField"
                    control={control}
                    rules={{required: true}}
                    render={ ({field}) =>
                      <Input
                        {...field}
                        className={`ms-1 form-control text-center ${errors && errors.scientificDomain
                          && errors.scientificDomain[domain_index]
                          && errors.scientificDomain[domain_index]['scientificfields']
                          && errors.scientificDomain[domain_index]['scientificfields'][field_index]
                          && errors.scientificDomain[domain_index]['scientificfields'][field_index]['percent'] ? "is-invalid" : ''}`}
                        placeholder={intl.formatMessage({
                          defaultMessage: "Udio",
                          description: "scientific-domain-placeholder-ratio"
                        })}
                        disabled={fieldsDisabled}
                        min="0"
                        max="100"
                        step="1"
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
                      disabled={fieldsDisabled}
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
        <Row className="g-0">
          <Col className="text-center">
            <Button disabled={fieldsDisabled} className="mt-3" size="sm" outline color="success" onClick={() =>
              field_append({'name': '', 'percent': ''})}>
              <FontAwesomeIcon icon={faPlus}/>{' '}
              <FormattedMessage
                defaultMessage="Novo znanstveno polje"
                description="scientific-domain-science-field"
              />
            </Button>
          </Col>
        </Row>
      </CardBody>
    </Card>
  )
}

const ScientificFields = ({fieldsDisabled=false, domain_index, field_index}) => {
  const { control, setValue, getValues, formState: {errors} } = useFormContext();
  const intl = useIntl()

  const selectedDomain = getValues(`scientificDomain.${domain_index}.name`)['value']

  return (
    <Controller
      name={`scientificDomain.${domain_index}.scientificfields.${field_index}.name`}
      control={control}
      rules={{required: true}}
      render={ ({field}) =>
        <CustomReactSelect
          aria-label="scientificDomain"
          controlWidth="64%"
          forwardedRef={field.ref}
          id={fieldsDisabled ? "scientificDomain-disabled" : "scientificDomain"}
          error={errors && errors.scientificDomain
            && errors.scientificDomain[domain_index]
            && errors.scientificDomain[domain_index]['scientificfields']
            && errors.scientificDomain[domain_index]['scientificfields'][field_index]
            && errors.scientificDomain[domain_index]['scientificfields'][field_index]['name']
            ? true : false}
          onChange={(e) => setValue(`scientificDomain.${domain_index}.scientificfields.${field_index}.name`, e)}
          value={getValues(`scientificDomain.${domain_index}.scientificfields.${field_index}.name`)}
          isDisabled={fieldsDisabled}
          options={buildOptionsFromArray(buildMapDomainsToFields(intl, selectedDomain))}
          placeholder={ intl.formatMessage({
            defaultMessage: "Polje",
            description: "scientific-domain-placeholder-field"
          }) }
        />
      }
    />
  )
}


export default BaseNewScientificDomain
