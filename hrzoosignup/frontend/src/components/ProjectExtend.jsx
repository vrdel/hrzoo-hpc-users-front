import React, { useContext } from 'react';
import {
  Button,
  Badge,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  FormFeedback,
  Form
}
from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile,
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


export const ProjectExtend = ({isOpen, toggle, project}) => {
  const { locale } = useContext(IntlContext)

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      newEndDate: '',
    }
  });
  const onSubmit = (data) => {
    alert(JSON.stringify(data, null, 2))
    toggle()
  }

  if (project) {
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
                    defaultMessage="<b>Novi završni datum:</b>"
                    values={{
                      b: (chunks) => <b>{chunks}</b>
                    }}
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
          </ModalBody>
          <ModalFooter className="justify-content-center">
            <Button color="success" type="submit">
              <FontAwesomeIcon icon={faFile}/>{' '}
              <FormattedMessage
                defaultMessage="Podnesi"
                description="projectextend-buttonyes"
              />
            </Button>{' '}
          </ModalFooter>
        </Form>
      </Modal>
    )
  }
  else
    return null
}

export default ProjectExtend
