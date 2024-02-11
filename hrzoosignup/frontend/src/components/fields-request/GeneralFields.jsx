import React, { useState } from 'react'
import {
  Controller,
  useFormContext
} from "react-hook-form";
import {
  Col,
  Badge,
  FormFeedback,
  Label,
  Row,
} from 'reactstrap';
import { ErrorMessage } from '@hookform/error-message';
import DatePicker from 'react-date-picker';
import BaseNewScientificDomain from './ScientificDomain';


const GeneralFields = ({fieldsDisabled=false, projectInfo=false, isResearch=false, isInstitute=false}) => {
  const { control, setValue, formState: {errors} } = useFormContext();
  let disabledRemain = fieldsDisabled
  const [startDateSelect, setStartDateSelect] = useState(undefined)
  const [endDate, setEndDate] = useState('')

  if (fieldsDisabled === false && isResearch)
    disabledRemain = true

  function oneYearAhead(currentDate) {
    if (currentDate) {
      let currentYear = currentDate.getFullYear()
      let newDate = ''

      newDate = currentDate.setFullYear(currentYear + 1)
      if (newDate)
        setValue('endDate', newDate)
      else
        setValue('endDate', '')

      return newDate
    }
  }

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
                className={`form-control fs-5 ${errors && errors.requestName ? "is-invalid" : ''}`}
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
        <Col md={{size: 4, offset: 1}}>
          <Label
            htmlFor="requestName"
            aria-label="requestName">
            Period korištenja:
            <span className="ms-1 fw-bold text-danger">*</span>
          </Label>
        </Col>
        <Col md={{size: 5}}>
          <Label
            htmlFor="requestInstitute"
            aria-label="requestInstitute">
            Institucija nositelj:
          </Label>
        </Col>
      </Row>
      <Row>
        <Col md={{size: 4, offset: 1}} style={{whiteSpace: 'nowrap'}}>
          <Controller
            name="startDate"
            control={control}
            rules={{required: true}}
            render={ ({field}) =>
              <DatePicker
                locale="hr-HR"
                forwardedRef={field.ref}
                disabled={disabledRemain}
                maxDate={new Date(2027, 1)}
                onChange={(value) => {
                  if (value) {
                    value.setHours(23)
                    value.setMinutes(59)
                    value.setSeconds(59)
                    setValue('startDate', value)
                    if (isInstitute)
                      setEndDate(oneYearAhead(value))
                    return value
                  }
                  else
                    setValue('startDate', '')
                }}
                value={field.value}
                required={true}
                className={`mt-2 me-3 ${errors && errors.startDate ? "is-invalid" : ''}`}
              />
            }
          />
          {'\u2212'}
          {
            !isInstitute ?
              <Controller
                name="endDate"
                control={control}
                rules={{required: true}}
                render={ ({field}) =>
                  <DatePicker
                    forwardedRef={field.ref}
                    required={true}
                    disabled={disabledRemain}
                    onChange={(value) => {
                      if (value) {
                        value.setHours(23)
                        value.setMinutes(59)
                        value.setSeconds(59)
                        setValue('endDate', value)
                        return value
                      }
                      else
                        setValue('endDate', '')
                    }}
                    maxDate={new Date(2027, 1)}
                    locale="hr-HR"
                    value={field.value}
                    className={`ms-3 ${errors && errors.endDate ? "is-invalid" : ''}`}
                  />
                }
              />
            :
              <DatePicker
                required={true}
                disabled={true}
                maxDate={new Date(2027, 1)}
                locale="hr-HR"
                value={endDate}
                className={`ms-3`}
              />
          }
        </Col>
        <Col md={{size: 5}}>
          <span className="fst-italic">
            <Badge className="bg-secondary-subtle fw-normal text-dark fs-6 me-2" key="project-institute">
              { projectInfo.institute }
            </Badge>
          </span>
        </Col>
      </Row>
      <Row>
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
                      <React.Fragment key={`wrap-project-users-${i}`}>
                        <Badge color="secondary" className="fs-6 mt-2 mb-1 fw-normal" key={`project-users-${i}`}>
                          {
                            user &&
                            user['first_name'] + ' ' + user['last_name']
                          }
                        </Badge>
                        {'  '}
                      </React.Fragment>
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
    </>
  )
}


export const CroRisDescription = ({fieldsDisabled=false}) => {
  const { control, getValues, formState: {errors} } = useFormContext();

  let crorisId = getValues('requestCroRisId')
  let crorisFinance = getValues('requestCroRisFinance')

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
      <Row className="mt-3">
        <Col md={{offset: 1, size: 11}}>
          Financijer:{' '}
          <span className="fst-italic">
            {
              crorisFinance.length > 1
                ?
                  crorisFinance.map((finance, i) =>
                    <Badge className="bg-warning-subtle fw-normal text-dark fs-6 me-2" key={`croris-finance-${i}`}>
                      { finance }
                    </Badge>
                  )
                :
                  <Badge className="bg-warning-subtle fw-normal text-dark fs-6">
                    { crorisFinance[0] }
                  </Badge>
            }
          </span>
        </Col>
      </Row>
    </>
  )
}

export default GeneralFields
