import React, { useContext } from 'react'
import {
  Controller,
  useFormContext
} from "react-hook-form";
import {
  Col,
  Badge,
  FormFeedback,
  Input,
  Label,
  Row,
} from 'reactstrap';
import { ErrorMessage } from '@hookform/error-message';
import DatePicker from 'react-date-picker';
import BaseNewScientificDomain from './ScientificDomain';


const GeneralFields = ({fieldsDisabled=false, projectInfo=false, isResearch=false}) => {
  const { control, setValue, formState: {errors} } = useFormContext();
  let disabledRemain = fieldsDisabled

  if (fieldsDisabled === false && isResearch)
    disabledRemain = true

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
                disabled={disabledRemain}
                className={`form-control ${errors && errors.requestName ? "is-invalid" : ''}`}
                rows="1"
              />
            }
          />
          <ErrorMessage
            errors={errors}
            name="requestName"
            render={({ message }) =>
              <FormFeedback className="end-0">
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
                disabled={fieldsDisabled}
                className={`form-control ${errors && errors.requestExplain ? "is-invalid" : ''}`}
                rows="7"
              />
            }
          />
          <ErrorMessage
            errors={errors}
            name="requestExplain"
            render={({ message }) =>
              <FormFeedback className="end-0">
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
                disabled={disabledRemain}
                maxDate={new Date(2027, 1)}
                onChange={(value) => {
                  value.setHours(23)
                  value.setMinutes(59)
                  value.setSeconds(59)
                  setValue('startDate', value)
                  return value
                }}
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
                disabled={disabledRemain}
                onChange={(value) => {
                  value.setHours(23)
                  value.setMinutes(59)
                  value.setSeconds(59)
                  setValue('endDate', value)
                  return value
                }}
                maxDate={new Date(2027, 1)}
                locale="hr-HR"
                className={`ms-3 ${errors && errors.endDate ? "is-invalid" : ''}`}
              />
            }
          />
        </Col>
        {
          projectInfo && projectInfo.project_type &&
          projectInfo.project_type.name === 'research-croris' &&
            <>
              <Row className="mt-4">
                <Col md={{offset: 1}}>
                  Korisnici:
                </Col>
              </Row>
              <Row>
                <Col md={{offset: 1, size: 10}}>
                  {
                    projectInfo.userproject_set.map((user, i) =>
                      user.role.name === 'lead' &&
                      <Badge color="secondary" className="fs-6 mt-2 mb-1 fw-normal" key={`project-users-${i}`}>
                        {
                          user['user']['first_name'] + ' ' + user['user']['last_name']
                        }
                      </Badge>
                    )
                  }
                  {'   '}
                  {
                    projectInfo.croris_collaborators.map((user, i) =>
                      <>
                        <Badge color="secondary" className="fs-6 mt-2 mb-1 fw-normal" key={`project-users-${i}`}>
                          {
                            user &&
                            user['first_name'] + ' ' + user['last_name']
                          }
                        </Badge>
                        {'  '}
                      </>
                    )
                  }
                </Col>
              </Row>
            </>
        }
        <Col className="ms-1">
          <BaseNewScientificDomain fieldsDisabled={fieldsDisabled} />
        </Col>
      </Row>
      <Row>
      </Row>
    </>
  )
}


export const CroRisDescription = ({fieldsDisabled=false}) => {
  const { control, getValues, formState: {errors} } = useFormContext();

  let crorisId = getValues('requestCroRisId')

  return (
    <>
      <Row className="mt-2">
        <Col>
          <h4 className="ms-4 mb-3 mt-4">Opis projekta iz sustava CroRIS</h4><br/>
        </Col>
      </Row>
      <Row className="mt-1 mb-4">
        <Col md={{size: 10, offset: 1}}>
          <Controller
            name="requestSummary"
            control={control}
            rules={{required: true}}
            render={ ({field}) =>
              <textarea
                id="requestSummary"
                {...field}
                aria-label="requestSummary"
                type="text"
                disabled={fieldsDisabled}
                className={`form-control ${errors && errors.requestSummary ? "is-invalid" : ''}`}
                rows="4"
              />
            }
          />
          <ErrorMessage
            errors={errors}
            name="requestExplain"
            render={({ message }) =>
              <FormFeedback className="end-0">
                { message }
              </FormFeedback>
            }
          />
        </Col>
      </Row>
      <Row>
        <Col md={{size: 10, offset: 1}}>
          <a href={`https://www.croris.hr/projekti/projekt/${crorisId}/`} target="_blank" style={{'textDecoration': 'none'}} rel="noopener noreferrer">
            https://www.croris.hr/projekti/projekt/{crorisId}
          </a>
        </Col>
      </Row>
    </>
  )
}

export default GeneralFields
