import React, { useContext, useState, useEffect } from 'react'
import {
  Col,
  FormFeedback,
  Input,
  Label,
  Row,
} from 'reactstrap';
import {
  Controller,
  useFormContext,
} from "react-hook-form";
import { CustomReactSelect } from 'Components/CustomReactSelect';
import { SharedData } from 'Pages/root';
import { ErrorMessage } from '@hookform/error-message';
import { fetchScienceSoftware } from 'Api/software';
import { useQuery } from '@tanstack/react-query';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl'
import _ from "lodash";


const ScientificSoftware = ({fieldsDisabled=false}) => {
  const { control, getValues, setValue, formState: {errors} } = useFormContext();
  const { buildOptionsFromArray } = useContext(SharedData);
  const [ listScientificSoftware, setListScientificSoftware ] = useState(undefined)
  const intl = useIntl()

  const {status, data: scienceSoftwareData } = useQuery({
      queryKey: ['science-software'],
      queryFn: fetchScienceSoftware,
      staleTime: 15 * 60 * 1000
  })

  useEffect(() => {
    if (status === 'success' && scienceSoftwareData.length > 0) {
      let softwareNames = _.sortBy(_.map(scienceSoftwareData,'name'))
      setListScientificSoftware(softwareNames)
    }
  }, [scienceSoftwareData])

  if (listScientificSoftware !== undefined)
    return (
      <>
        <Row className="mt-5">
          <Col>
            <h4 className="ms-4 mb-3 mt-4">
              <FormattedMessage
                description="sciencesoftware-title"
                defaultMessage="Znanstveni softver"
              />
            </h4><br/>
          </Col>
        </Row>
        <Row className="mt-1">
          <Col md={{size: 10, offset: 1}}>
            <Label
              htmlFor="scientificSoftware"
              aria-label="scientificSoftware"
              className="mr-2 text-right form-label">
              <FormattedMessage
                description="sciencesoftware-list"
                defaultMessage="Aplikacije koje će se koristiti:"
              />
            </Label>
            <Controller
              name="scientificSoftware"
              control={control}
              render={ ({field}) =>
                <CustomReactSelect
                  aria-label="scientificSoftware"
                  closeMenuOnSelect={false}
                  forwardedRef={field.ref}
                  id="scientificSoftware"
                  isMulti
                  isDisabled={fieldsDisabled}
                  scientificSoftwareMultiValue={true}
                  value={getValues(`scientificSoftware`)}
                  options={buildOptionsFromArray(listScientificSoftware)}
                  placeholder={intl.formatMessage({
                    defaultMessage: "Odaberi",
                    description: "sciencesoftware-placeholder"
                  })}
                  onChange={(e) => setValue('scientificSoftware', e)}
                />
              }
            />
          </Col>
        </Row>
        <Row className="mt-3">
          <Col md={{size: 10, offset: 1}}>
            <Label
              htmlFor="scientificSoftwareExtra"
              aria-label="scientificSoftwareExtra">
              <FormattedMessage
                description="sciencesoftware-list"
                defaultMessage="Dodatne aplikacije koje će biti potrebno instalirati:"
              />
            </Label>
            <Controller
              name="scientificSoftwareExtra"
              control={control}
              render={ ({field}) =>
                <textarea
                  id="scientificSoftwareExtra"
                  {...field}
                  aria-label="scientificSoftwareExtra"
                  type="text"
                  disabled={fieldsDisabled}
                  className={`form-control ${errors && errors.scientificSoftwareExtra ? "is-invalid" : ''}`}
                  rows="3"
                />
              }
            />
            <ErrorMessage
              errors={errors}
              name="scientificSoftwareExtra"
              render={({ message }) =>
                <FormFeedback className="end-0">
                  { message }
                </FormFeedback>
              }
            />
          </Col>
        </Row>
        <Row className="mt-3">
          <Col sm={{offset: 1}}>
            <Label
              htmlFor="scientificSoftwareHelp"
              aria-label="scientificSoftwareHelp"
              className="mr-2 text-right form-label">
              <FormattedMessage
                description="sciencesoftware-help"
                defaultMessage="Potrebna pomoć pri instalaciji:"
              />
            </Label>
            <Controller
              name="scientificSoftwareHelp"
              control={control}
              render={ ({field}) =>
                <Input {...field} disabled={fieldsDisabled} checked={getValues('scientificSoftwareHelp')} type="checkbox" className="ms-3 fw-bold"/>
              }
            />
          </Col>
          <div className="w-100"></div>
          <Col sm={{offset: 1, size: 1}}>
          </Col>
        </Row>
      </>
    )
}


export default ScientificSoftware
