import React, { useContext } from 'react'
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
import { CustomReactSelect } from '../../components/CustomReactSelect';
import { SharedData } from '../../pages/root';
import { ErrorMessage } from '@hookform/error-message';


const ScientificSoftware = ({fieldsDisabled=false}) => {
  const { control, getValues, setValue, formState: {errors} } = useFormContext();
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
            htmlFor="scientificSoftware"
            aria-label="scientificSoftware"
            className="mr-2 text-right form-label">
            Aplikacije koje će se koristiti:
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
                placeholder="Odaberi"
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
            Dodatne aplikacije koje će biti potrebno instalirati:
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
              <FormFeedback invalid className="end-0">
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
            Potrebna pomoć pri instalaciji:
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
