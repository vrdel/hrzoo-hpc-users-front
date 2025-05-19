import React, { useContext } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Form,
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


export const ProjectExtend = ({isOpen, toggle, project}) => {
  const { locale } = useContext(IntlContext)

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      newEndDate: '',
    }
  });
  const onSubmit = (data) => {
    toggle()
    alert(JSON.stringify(data, null, 2))
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
            {project.identifier}
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
