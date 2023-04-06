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
  useFormContext
} from "react-hook-form";
import { CustomReactSelect } from '../../components/CustomReactSelect';
import { SharedData } from '../../pages/root';
import { ErrorMessage } from '@hookform/error-message';


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
            render={ ({field}) =>
              <CustomReactSelect
                aria-label="requestScientificSoftware"
                closeMenuOnSelect={false}
                forwardedRef={field.ref}
                id="requestScientificSoftware"
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
            htmlFor="requestScientificSoftwareExtra"
            aria-label="requestScientificSoftwareExtra">
            Dodatne aplikacije koje će biti potrebno instalirati:
          </Label>
          <Controller
            name="requestScientificSoftwareExtra"
            control={control}
            render={ ({field}) =>
              <textarea
                id="requestScientificSoftwareExtra"
                {...field}
                aria-label="requestScientificSoftwareExtra"
                type="text"
                className={`form-control ${errors && errors.requestScientificSoftwareExtra ? "is-invalid" : ''}`}
                rows="3"
              />
            }
          />
          <ErrorMessage
            errors={errors}
            name="requestScientificSoftwareExtra"
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
          <Controller
            name="requestScientificSoftwareHelp"
            control={control}
            render={ ({field}) =>
              <Input {...field} type="checkbox" className="ms-3 fw-bold"/>
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
