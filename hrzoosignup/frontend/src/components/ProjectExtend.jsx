import React, { useContext } from 'react';
import {
  Button,
  Badge,
  Modal,
  ModalBody,
  ModalHeader,
  FormFeedback,
  Form,
  Table
}
from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile,
  faCheckCircle,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import {FormattedMessage} from 'react-intl';
import DatePicker from 'react-date-picker';
import {
  Col,
  Label,
  Row,
} from 'reactstrap';
import {
  Controller,
  useForm,
} from "react-hook-form";
import { IntlContext } from 'Components/IntlContextProvider';
import { ErrorMessage } from '@hookform/error-message';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addExtendProject } from "Api/projects";
import { AuthContext } from 'Components/AuthContextProvider';
import { toast } from 'react-toastify'
import { convertToAmerican, addGraceMonths, addOneDayOffset } from 'Utils/dates';


export const ProjectExtend = ({isOpen, toggle, project}) => {
  const { locale } = useContext(IntlContext)
  const { csrfToken, backendConfig } = useContext(AuthContext)
  const queryClient = useQueryClient()

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      newEndDate: '',
      projectName: '',
      requestExplain: ''
    }
  });

  const onSubmit = (data) => {
    let dataToSend = new Object()
    dataToSend['reason'] = data['requestExplain']
    dataToSend['approved'] = false
    dataToSend['date_end'] = convertToAmerican(data['newEndDate'])
    doAdd(dataToSend)
  }

  const addMutation = useMutation({
    mutationFn: (data) => {
      return addExtendProject(project.identifier, data, csrfToken)
    },
  })

  const doAdd = (data) => addMutation.mutate(data, {
    onSuccess: () => {
      queryClient.invalidateQueries("projects-lead")
      toast.success(
        <span className="font-monospace text-dark">
          <FormattedMessage
            defaultMessage="Zahtjev je uspješno podnesen"
            description="newrequest-toast-ok"
          />
        </span>, {
          toastId: 'genproj-ok-add',
          autoClose: 2500,
          delay: 500,
          onClose: setTimeout(() => toggle(), 1500)
        }
      )
    },
    onError: (error) => {
      toast.error(
        <span className="font-monospace text-dark">
          <FormattedMessage
            defaultMessage="Zahtjev nije bilo moguće podnijeti: { errmsg }"
            description="newrequest-toast-fail"
            values={{
              errmsg: error.message
            }}
          />
        </span>, {
          toastId: 'genproj-fail-add',
          autoClose: 2500,
          delay: 500
        }
      )
    }
  })

  if (project) {
    setValue('projectName', project.name)
    return (
      <Modal isOpen={isOpen} toggle={toggle} centered={true} size="lg">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader toggle={toggle} className="text-bg-warning">
            <FormattedMessage
              defaultMessage="Zahtjev za produljenjem projekta"
              description="projectextend-title"
            />{' '}
            <Badge color={"secondary fw-normal"}>
              {project.identifier}
            </Badge>
          </ModalHeader>
          <ModalBody>
            <Row className="mt-3 mb-5">
              <Col className="d-flex flex-column justify-content-end"  md={{size: 10, offset: 1}}>
                <Label
                  htmlFor="projectName"
                  aria-label="projectName">
                  <FormattedMessage
                    description="projectextend-projectname"
                    defaultMessage="Naziv:"
                  />
                </Label>
                <Controller
                  name="projectName"
                  control={control}
                  rules={{required: true}}
                  render={ ({field}) =>
                    <textarea
                      id="projectName"
                      {...field}
                      aria-label="projectName"
                      type="text"
                      className="form-control fs-5"
                      disabled
                      rows="3"
                    />
                  }
                />
              </Col>
            </Row>
            <Row className="mt-3">
              <Col className="d-flex flex-column justify-content-end" md={{size: 4, offset: 2}}>
                <Label
                  htmlFor="currentDateEnd"
                  aria-label="currentDateEnd">
                  <FormattedMessage
                    description="projectextend-currentend"
                    defaultMessage="Trenutni završni datum:"
                  />
                </Label>
                <span>
                  <DatePicker
                    required={true}
                    disabled={true}
                    maxDate={new Date(2027, 1)}
                    locale="en-US"
                    value={project.date_end}
                    className="ms-0 ms-xxl-3 ms-xl-0 ms-sm-3 ms-md-0"
                  />
                </span>
              </Col>
              <Col className="d-flex flex-column justify-content-end" md={{size: 4}}>
                <Label
                  htmlFor="currentDateEnd"
                  aria-label="currentDateEnd">
                  <FormattedMessage
                    description="projectextend-currentend"
                    defaultMessage="Novi završni datum:"
                  />
                  <span className="ms-1 fw-bold text-danger">*</span>
                </Label>
                <span>
                  <Controller
                    name="newEndDate"
                    control={control}
                    rules={{required: true}}
                    render={ ({field}) =>
                      <DatePicker
                        forwardedRef={field.ref}
                        required={true}
                        disabled={false}
                        minDate={addOneDayOffset(new Date(project.date_end))}
                        maxDate={addGraceMonths(new Date(project.date_end), backendConfig.grace_months)}
                        onChange={(value) => {
                          if (value) {
                            value.setHours(23)
                            value.setMinutes(59)
                            value.setSeconds(59)
                            setValue('newEndDate', value)
                            return value
                          }
                          else
                            setValue('newEndDate', '')
                        }}
                        locale={locale === 'hr' ? 'hr-HR' : 'en-US'}
                        value={field.value}
                        className={`ms-0 ms-md-0 ms-xl-0 ms-xxl-3 ms-sm-3 ${errors && errors.endDate ? "is-invalid" : ''}`}
                      />
                    }
                  />
                </span>
              </Col>
            </Row>
            <Row className="mt-5 mb-5">
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
                      disabled={false}
                      className={`form-control ${errors && errors.requestExplain ? "is-invalid" : ''}`}
                      rows="10"
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
              <Col className="d-flex justify-content-center mb-4">
                <Button color="success" type="submit">
                  <FontAwesomeIcon icon={faFile}/>{' '}
                  <FormattedMessage
                    defaultMessage="Podnesi"
                    description="projectextend-buttonyes"
                  />
                </Button>{' '}
              </Col>
            </Row>
          </ModalBody>
        </Form>
      </Modal>
    )
  }
  else
    return null
}


export const ProjectExtendTable = ({projectsExtends, myView=true}) => {
  let colTitle = "ps-2 pe-2 mt-4 pt-1 pb-3 fw-bold fs-5 ms-4"
  let tableSize = { size: 12 }
  let rowTable = "ms-5 me-5"

  if (!myView) {
    colTitle = "fw-bold fs-5 pb-2 ms-md-3"
    tableSize = {}
    rowTable = "ms-md-1"
  }

  return (
    <>
      <Row>
        <Col className={colTitle}>
          <span>
            <FormattedMessage
              defaultMessage="Produljenja:"
              description="myreq-change-exten-table-title"
            />
          </span>
        </Col>
      </Row>
      <Row className={rowTable}>
        <Col md={tableSize}>
          <Table responsive hover className="shadow-sm">
            <thead id="hzsi-thead" className="align-middle text-center text-white">
              <tr>
                <th className="fw-normal" style={{width: '52px'}}>
                  <FormattedMessage
                    defaultMessage="Odobreno"
                    description="myreq-change-exten-state"
                  />
                </th>
                <th className="fw-normal" style={{width: '200px'}}>
                  <FormattedMessage
                    defaultMessage="Datum završetka"
                    description="myreq-change-exten-dateend"
                  />
                </th>
                <th className="fw-normal">
                  <FormattedMessage
                    defaultMessage="Obrazloženje"
                    description="myreq-change-exten-dateend"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {
                projectsExtends.map((extend, index) =>
                  <tr key={index}>
                    <td className="p-3 align-middle text-center">
                      {
                        extend.approved ?
                          <FontAwesomeIcon size="xl" icon={faCheckCircle} style={{ color: "#339900" }}/>
                        :
                          <FontAwesomeIcon size="xl" icon={faTimesCircle} style={{ color: "#CC0000" }} />
                      }
                    </td>
                    <td className={`p-3 align-middle text-center ${extend.approved ? 'text-success' : 'text-muted'} fs-5 font-monospace font-monospace`}>
                      { extend.date_end }
                    </td>
                    <td className="p-3 align-middle text-center">
                      <textarea
                        id="extendReason"
                        aria-label="extendReason"
                        type="text"
                        disabled={true}
                        className="form-control fs-6"
                        rows="1"
                        defaultValue={extend.reason}
                      />
                    </td>
                  </tr>
                )
              }
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  )
}


export default ProjectExtend
