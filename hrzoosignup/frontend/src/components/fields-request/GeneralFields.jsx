import React, { useState, useContext } from 'react'
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
  Popover
} from 'reactstrap';
import { ErrorMessage } from '@hookform/error-message';
import DatePicker from 'react-date-picker';
import BaseNewScientificDomain from 'Components/fields-request/ScientificDomain';
import { ProjectTypeBadge } from 'Components/GeneralProjectInfo';
import PopoverUserInfo from 'Components/PopoverUserInfo';
import { FormattedMessage } from 'react-intl';
import { MiniButton } from 'Components/MiniButton';
import { copyToClipboard } from 'Utils/copy-clipboard';
import { IntlContext } from 'Components/IntlContextProvider';
import { useIntl } from 'react-intl';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";


const GeneralProjectUsers = ({projectInfo}) => {
  const [popoverOpened, setPopoverOpened] = useState(undefined);
  const showPopover = (popid) => {
    let showed = new Object()
    if (popoverOpened === undefined && popid) {
      showed[popid] = true
      setPopoverOpened(showed)
    }
    else {
      showed = JSON.parse(JSON.stringify(popoverOpened))
      showed[popid] = !showed[popid]
      setPopoverOpened(showed)
    }
  }
  const isOpened = (toolid) => {
    if (popoverOpened !== undefined)
      return popoverOpened[toolid]
  }

  return (
    <Row>
      <Col md={{offset: 1, size: 10}}>
        {
          projectInfo.userproject_set.map((user, index) =>
            user.role.name === 'lead' &&
            <Badge
              color="secondary"
              className="fs-6 mt-2 mb-1 fw-normal text-decoration-underline"
              style={{cursor: 'pointer'}}
              key={`project-users-${index}`}
              id={`pop-lead-${index}-${user.user.id}`}
            >
              {
                user['user']['first_name'] + ' ' + user['user']['last_name']
              }
              <Popover
                placement="top"
                isOpen={isOpened(`${index}-${user.user.id}`)}
                target={`pop-lead-${index}-${user.user.id}`}
                toggle={() => {
                  showPopover(`${index}-${user.user.id}`)
                }}
              >
                <PopoverUserInfo
                  rhfId={`${index}-${user.user.id}`}
                  userName={user.user.username}
                  showPopover={showPopover}
                />
              </Popover>
            </Badge>
          )
        }
        {'   '}
        {
          projectInfo.userproject_set.map((user, index) =>
            user.role.name === 'collaborator' &&
            <React.Fragment key={`wrap-project-users-${index}`}>
              <Badge
                color="secondary"
                className="fs-6 mt-2 mb-1 fw-normal text-decoration-underline"
                style={{cursor: 'pointer'}}
                key={`project-users-${index}`}
                id={`pop-collab-${index}-${user.user.id}`}
              >
                {
                  user['user']['first_name'] + ' ' + user['user']['last_name']
                }
                <Popover
                  placement="top"
                  isOpen={isOpened(`${index}-${user.user.id}`)}
                  target={`pop-collab-${index}-${user.user.id}`}
                  toggle={() => {
                    showPopover(`${index}-${user.user.id}`)
                  }}
                >
                  <PopoverUserInfo
                    rhfId={`${index}-${user.user.id}`}
                    userName={user.user.username}
                    showPopover={showPopover}
                  />
                </Popover>
              </Badge>
              {'  '}
            </React.Fragment>
          )
        }
      </Col>
    </Row>
  )
}


const CrorisProjectUsers = ({projectInfo, manageProject=false}) => {
  const [popoverOpened, setPopoverOpened] = useState(undefined);
  const showPopover = (popid) => {
    let showed = new Object()
    if (popoverOpened === undefined && popid) {
      showed[popid] = true
      setPopoverOpened(showed)
    }
    else {
      showed = JSON.parse(JSON.stringify(popoverOpened))
      showed[popid] = !showed[popid]
      setPopoverOpened(showed)
    }
  }
  const isOpened = (toolid) => {
    if (popoverOpened !== undefined)
      return popoverOpened[toolid]
  }

  if (manageProject)
    return (
      <Row>
        <Col md={{offset: 1, size: 10}}>
          {
            projectInfo.userproject_set.map((user, index) =>
              user.role.name === 'lead' &&
              <Badge
                color="secondary"
                className="fs-6 mt-2 mb-1 fw-normal text-decoration-underline"
                key={`project-users-${index}`}
                style={{cursor: 'pointer'}}
                id={`pop-lead-${index}-${user.user.id}`}
              >
                {
                  user['user']['first_name'] + ' ' + user['user']['last_name']
                }
                <Popover
                  placement="top"
                  isOpen={isOpened(`${index}-${user.user.id}`)}
                  target={`pop-lead-${index}-${user.user.id}`}
                  toggle={() => {
                    showPopover(`${index}-${user.user.id}`)
                  }}
                >
                  <PopoverUserInfo
                    rhfId={`${index}-${user.user.id}`}
                    userName={user.user.username}
                    showPopover={showPopover}
                  />
                </Popover>
              </Badge>
            )
          }
          {'   '}
          {
            projectInfo.userproject_set.map((user, index) =>
              user.role.name === 'collaborator' &&
              <React.Fragment key={`wrap-project-users-${index}`}>
                <Badge
                  color="secondary"
                  className="fs-6 mt-2 mb-1 fw-normal text-decoration-underline"
                  key={`project-users-${index}`}
                  style={{cursor: 'pointer'}}
                  id={`pop-collab-${index}-${user.user.id}`}
                >
                  {
                    user &&
                    user['user']['first_name'] + ' ' + user['user']['last_name']
                  }
                  <Popover
                    placement="top"
                    isOpen={isOpened(`${index}-${user.user.id}`)}
                    target={`pop-collab-${index}-${user.user.id}`}
                    toggle={() => {
                      showPopover(`${index}-${user.user.id}`)
                    }}
                  >
                    <PopoverUserInfo
                      rhfId={`${index}-${user.user.id}`}
                      userName={user.user.username}
                      showPopover={showPopover}
                    />
                  </Popover>
                </Badge>
                {'  '}
              </React.Fragment>
            )
          }
        </Col>
      </Row>
    )
  else
    return (
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
    )
}


const GeneralFields = ({fieldsDisabled=false, projectInfo=false,
  isResearch=false, manageProject=false, isInstitute=false}) => {
  const { control, setValue, getValues, formState: {errors} } = useFormContext();
  let disabledRemain = fieldsDisabled
  const [endDate, setEndDate] = useState('')
  const { locale } = useContext(IntlContext)
  const intl = useIntl()

  const personInstitution = getValues('requestInstitute')

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
          <h4 className="ms-4 mb-3 mt-4">
            <FormattedMessage
              description="generalfields-title"
              defaultMessage="Opći dio"
            />
          </h4><br/>
        </Col>
      </Row>
      <Row>
        <Col md={{size: 10, offset: 1}}>
          <Label
            htmlFor="requestName"
            aria-label="requestName">
            <FormattedMessage
              description="generalfields-name"
              defaultMessage="Naziv:"
            />
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
            <FormattedMessage
              description="generalfields-explanation"
              defaultMessage="Obrazloženje:"
            />
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
        <Col className="d-flex flex-column justify-content-end" md={{size: 4, offset: 1}}>
          <Label
            htmlFor="requestName"
            aria-label="requestName">
            <FormattedMessage
              description="generalfields-duration"
              defaultMessage="Period korištenja:"
            />
            <span className="ms-1 fw-bold text-danger">*</span>
          </Label>
          <span>
            <Controller
              name="startDate"
              control={control}
              rules={{required: true}}
              render={ ({field}) =>
                <DatePicker
                  locale={locale === 'hr' ? 'hr-HR' : 'en-US'}
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
                      locale={locale === 'hr' ? 'hr-HR' : 'en-US'}
                      value={field.value}
                      className={`ms-0 ms-md-0 ms-xl-0 ms-xxl-3 ms-sm-3 ${errors && errors.endDate ? "is-invalid" : ''}`}
                    />
                  }
                />
              :
                <DatePicker
                  required={true}
                  disabled={true}
                  maxDate={new Date(2027, 1)}
                  locale="en-US"
                  value={endDate}
                  className="ms-0 ms-xxl-3 ms-xl-0 ms-sm-3 ms-md-0"
                />
            }
          </span>
        </Col>
        <Col className="d-flex flex-column mt-3" md={{size: 4}}>
          <Label
            htmlFor="requestInstitute"
            aria-label="requestInstitute">
            <FormattedMessage
              description="generalfields-leadinstitution"
              defaultMessage="Institucija nositelj:"
            />
          </Label>
          <span className="fst-italic">
            <Badge
              className="d-inline-block bg-secondary-subtle fw-normal text-dark fs-6 me-2 mt-sm-3"
              key="project-institute"
              style={{
                whiteSpace: "normal",
              }}
            >
              { projectInfo ?  projectInfo.institute : personInstitution }
            </Badge>
          </span>
        </Col>
        {
          projectInfo.identifier &&
            <Col className="mt-3 d-flex flex-column justify-content-start align-items-start">
              <span className="mb-3 d-flex justify-content-center flex-row">
                <Badge color={"secondary fw-normal"}>
                  { projectInfo.identifier }
                </Badge>
                <MiniButton
                  color="light"
                  onClick={(e) => copyToClipboard(
                    e, projectInfo.identifier,
                    intl.formatMessage({
                      defaultMessage: "Šifra projekta kopirana u međuspremnik",
                      description: "memberships-clipboard-ok"
                    }),
                    intl.formatMessage({
                      defaultMessage: "Greška prilikom kopiranja šifre projekta u međuspremnik",
                      description: "memberships-clipboard-fail"
                    }),
                    "id-request"
                  )}
                >
                  <FontAwesomeIcon size="xs" icon={faCopy} />
                </MiniButton>
              </span>
              <ProjectTypeBadge projectInfo={projectInfo} />
            </Col>
        }
      </Row>
      <Row>
        {
          projectInfo && projectInfo.project_type &&
          projectInfo.project_type.name === 'research-croris' ?
            <>
              <Row className="mt-4">
                <Col md={{offset: 1}}>
                  <FormattedMessage
                    description="generalfields-userslist"
                    defaultMessage="Korisnici:"
                  />
                </Col>
              </Row>
              <CrorisProjectUsers projectInfo={projectInfo} manageProject={manageProject} />
            </>
          :
            manageProject ?
              <>
                <Row className="mt-4">
                  <Col md={{offset: 1}}>
                    <FormattedMessage
                      description="generalfields-userslist"
                      defaultMessage="Korisnici:"
                    />
                  </Col>
                </Row>
                <GeneralProjectUsers projectInfo={projectInfo} />
              </>
            :
              null
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
          <h4 className="ms-4 mb-3 mt-4">
            <FormattedMessage
              defaultMessage="Opis projekta iz sustava CroRIS"
              description="croris-description-title"
            />
          </h4><br/>
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
          <FormattedMessage
            defaultMessage="Financijer:"
            description="croris-description-financier"
          />
          {' '}
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
