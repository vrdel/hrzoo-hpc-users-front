import React, { useContext } from 'react'
import { CustomReactSelect } from 'Components/CustomReactSelect';
import { SharedData } from 'Pages/root';
import { AuthContext } from 'Components/AuthContextProvider';
import {
  Col,
  Form,
  InputGroup,
  Row,
} from 'react-bootstrap';
import { ErrorMessage } from '@hookform/error-message';
import {
  Controller,
  useFormContext
} from "react-hook-form";
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl'


export const CloudFields = ({fieldsDisabled=false}) => {
  const { control, formState: {errors} } = useFormContext();

  return (
    <>
      <Row>
        <Col className="fs-4 mb-3" md={{offset: 1}}>
          CLOUD
        </Col>
        <Col className="d-flex flex-column justify-content-end" md={{offset: 1, span: 3}} lg={{offset: 1, span: 2}}>
          <Form.Label
            htmlFor="CLOUDnVM"
            aria-label="CLOUDnVM"
            className="mr-2 form-label text-center">
            <FormattedMessage
              description="cloudfields-nvm"
              defaultMessage="Broj virtualnih poslužitelja:"
            />
          </Form.Label>
          <InputGroup>
            <Controller
              name="CLOUDnVM"
              aria-label="CLOUDnVM"
              control={control}
              render={ ({field}) =>
                <Form.Control
                  {...field}
                  disabled={fieldsDisabled}
                  className={`form-control text-center ${errors && errors.CLOUDnVM ? "is-invalid" : ''}`}
                  type="number"
                />
              }
            />
            <InputGroup.Text>
              VM
            </InputGroup.Text>
            <ErrorMessage
              errors={errors}
              name="CLOUDnVM"
              render={({ message }) =>
                <Form.Control.Feedback type="invalid" className="end-0">
                  { message }
                </Form.Control.Feedback>
              }
            />
          </InputGroup>
        </Col>
        <Col className="d-flex flex-column justify-content-end" md={{span: 3}} lg={{span: 2}}>
          <Form.Label
            htmlFor="CLOUDnSlotsCPU"
            aria-label="CLOUDnSlotsCPU"
            className="mr-2 form-label text-center">
            <FormattedMessage
              description="cloudfields-vcpu"
              defaultMessage="Ukupna količina virtualnih procesorskih jezgara:"
            />
          </Form.Label>
          <InputGroup>
            <Controller
              name="CLOUDnSlotsCPU"
              aria-label="CLOUDnSlotsCPU"
              control={control}
              render={ ({field}) =>
                <Form.Control
                  {...field}
                  className={`form-control text-center ${errors && errors.CLOUDnSlotsCPU ? "is-invalid" : ''}`}
                  disabled={fieldsDisabled}
                  type="number"
                />
              }
            />
            <InputGroup.Text>
              CPU
            </InputGroup.Text>
            <ErrorMessage
              errors={errors}
              name="CLOUDnSlotsCPU"
              render={({ message }) =>
                <Form.Control.Feedback type="invalid" className="end-0">
                  { message }
                </Form.Control.Feedback>
              }
            />
          </InputGroup>
        </Col>
        <Col className="d-flex flex-column justify-content-end" md={{span: 3}} lg={{span: 2}}>
          <Form.Label
            htmlFor="CLOUDnRAM"
            aria-label="CLOUDnRAM"
            className="mr-2 form-label text-center">
            <FormattedMessage
              description="cloudfields-nram"
              defaultMessage="Ukupna količina radne memorije (GB):"
            />
          </Form.Label>
          <InputGroup>
            <Controller
              name="CLOUDnRAM"
              aria-label="CLOUDnRAM"
              control={control}
              render={ ({field}) =>
                <Form.Control
                  {...field}
                  disabled={fieldsDisabled}
                  className={`form-control text-center ${errors && errors.CLOUDnRAM ? "is-invalid" : ''}`}
                  type="number"
                />
              }
            />
            <InputGroup.Text>
              RAM
            </InputGroup.Text>
            <ErrorMessage
              errors={errors}
              name="CLOUDnRAM"
              render={({ message }) =>
                <Form.Control.Feedback type="invalid" className="end-0">
                  { message }
                </Form.Control.Feedback>
              }
            />
          </InputGroup>
        </Col>
        <Col className="d-flex flex-column justify-content-end offset-md-1 offset-lg-0 mt-sm-3" md={{span: 3}} lg={{span: 2}}>
          <Form.Label
            htmlFor="CLOUDnRAMVM"
            aria-label="CLOUDnRAMVM"
            className="mr-2 form-label text-center">
            <FormattedMessage
              description="cloudfields-nramvm"
              defaultMessage="Maksimalna količina radne memorije po poslužitelju (GB):"
            />
          </Form.Label>
          <InputGroup>
            <Controller
              name="CLOUDnRAMVM"
              aria-label="CLOUDnRAMVM"
              control={control}
              render={ ({field}) =>
                <Form.Control
                  {...field}
                  className={`form-control text-center ${errors && errors.CLOUDnRAMVM ? "is-invalid" : ''}`}
                  disabled={fieldsDisabled}
                  type="number"
                />
              }
            />
            <InputGroup.Text>
              RAM
            </InputGroup.Text>
            <ErrorMessage
              errors={errors}
              name="CLOUDnRAMVM"
              render={({ message }) =>
                <Form.Control.Feedback type="invalid" className="end-0">
                  { message }
                </Form.Control.Feedback>
              }
            />
          </InputGroup>
        </Col>
        <Col className="d-flex flex-column justify-content-end offset-lg-0 mt-sm-3" md={{span: 3}} lg={{span: 2}}>
          <Form.Label
            htmlFor="CLOUDnDiskGB"
            aria-label="CLOUDnDiskGB"
            className="mr-2 form-label text-center">
            <FormattedMessage
              description="cloudfields-ndiskgb"
              defaultMessage="Ukupna količina prostora za virtualne poslužitelje na standardnom spremištu (GB):"
            />
          </Form.Label>
          <InputGroup>
            <Controller
              name="CLOUDnDiskGB"
              aria-label="CLOUDnDiskGB"
              control={control}
              render={ ({field}) =>
                <Form.Control
                  {...field}
                  disabled={fieldsDisabled}
                  className={`form-control text-center ${errors && errors.CLOUDnDiskGB ? "is-invalid" : ''}`}
                  type="number"
                />
              }
            />
            <InputGroup.Text>
              Disk
            </InputGroup.Text>
            <ErrorMessage
              errors={errors}
              name="CLOUDnDiskGB"
              render={({ message }) =>
                <Form.Control.Feedback type="invalid" className="end-0">
                  { message }
                </Form.Control.Feedback>
              }
            />
          </InputGroup>
        </Col>
      </Row>
      <Row className="mt-5">
        <Col className="d-flex flex-column justify-content-end offset-md-1 offset-lg-0 mt-sm-3" md={{span: 3}} lg={{offset: 1, span: 2}}>
          <Form.Label
            htmlFor="CLOUDnFastDiskGB"
            aria-label="CLOUDnFastDiskGB"
            className="mr-2 form-label text-center">
            <FormattedMessage
              description="cloudfields-nfastdiskgb"
              defaultMessage="Ukupna količina prostora za virtualne poslužitelje na brzom spremištu (GB):"
            />
          </Form.Label>
          <InputGroup>
            <Controller
              name="CLOUDnFastDiskGB"
              aria-label="CLOUDnFastDiskGB"
              control={control}
              render={ ({field}) =>
                <Form.Control
                  {...field}
                  className={`form-control text-center ${errors && errors.CLOUDnFastDiskGB ? "is-invalid" : ''}`}
                  disabled={fieldsDisabled}
                  type="number"
                />
              }
            />
            <InputGroup.Text>
              Disk
            </InputGroup.Text>
            <ErrorMessage
              errors={errors}
              name="CLOUDnFastDiskGB"
              render={({ message }) =>
                <Form.Control.Feedback type="invalid" className="end-0">
                  { message }
                </Form.Control.Feedback>
              }
            />
          </InputGroup>
        </Col>
        <Col className="d-flex flex-column justify-content-end mt-sm-3" md={{span: 3}} lg={{span: 2}}>
          <Form.Label
            htmlFor="CLOUDnIPs"
            aria-label="CLOUDnIPs"
            className="mr-2 form-label text-center">
            <FormattedMessage
              description="cloudfields-nips"
              defaultMessage=" Broj javnih IPv4 adresa:"
            />
          </Form.Label>
          <InputGroup>
            <Controller
              name="CLOUDnIPs"
              aria-label="CLOUDnIPs"
              control={control}
              render={ ({field}) =>
                <Form.Control
                  {...field}
                  disabled={fieldsDisabled}
                  className={`form-control text-center ${errors && errors.CLOUDnIPs ? "is-invalid" : ''}`}
                  type="number"
                />
              }
            />
            <InputGroup.Text>
              IP
            </InputGroup.Text>
            <ErrorMessage
              errors={errors}
              name="CLOUDnIPs"
              render={({ message }) =>
                <Form.Control.Feedback type="invalid" className="end-0">
                  { message }
                </Form.Control.Feedback>
              }
            />
          </InputGroup>
        </Col>
      </Row>
    </>
  )
}


export const HpcFields = ({fieldsDisabled=false}) => {
  const { control, formState: {errors} } = useFormContext();

  return (
    <Row>
      <Col className="fs-4 mb-3" md={{offset: 1}}>
        HPC
      </Col>
      <Col className="d-flex flex-column justify-content-end mt-sm-3" md={{offset: 1, span: 3}} lg={{offset: 1, span: 2}}>
        <Form.Label
          htmlFor="HPCnSlotsCPU"
          aria-label="HPCnSlotsCPU"
          className="mr-2 form-label text-center">
          <FormattedMessage
            description="resourcefields-ncpu"
            defaultMessage="Prosječan broj procesorskih jezgri po poslu:"
          />
        </Form.Label>
        <InputGroup>
          <Controller
            name="HPCnSlotsCPU"
            aria-label="HPCnSlotsCPU"
            control={control}
            render={ ({field}) =>
              <Form.Control
                {...field}
                disabled={fieldsDisabled}
                className={`form-control text-center ${errors && errors.HPCnSlotsCPU ? "is-invalid" : ''}`}
                type="number"
              />
            }
          />
          <InputGroup.Text>
            CPU
          </InputGroup.Text>
          <ErrorMessage
            errors={errors}
            name="HPCnSlotsCPU"
            render={({ message }) =>
              <Form.Control.Feedback type="invalid" className="end-0">
                { message }
              </Form.Control.Feedback>
            }
          />
        </InputGroup>
      </Col>
      <Col className="d-flex flex-column justify-content-end mt-sm-3" md={{span: 3}} lg={{span: 2}}>
        <Form.Label
          htmlFor="HPCnSlotsGPU"
          aria-label="HPCnSlotsGPU"
          className="mr-2 form-label text-center">
          <FormattedMessage
            description="resourcefields-ngpu"
            defaultMessage="Prosječan broj grafičkih procesora po poslu:"
          />
        </Form.Label>
        <InputGroup>
          <Controller
            name="HPCnSlotsGPU"
            aria-label="HPCnSlotsGPU"
            control={control}
            render={ ({field}) =>
              <Form.Control
                {...field}
                className={`form-control text-center ${errors && errors.HPCnSlotsGPU ? "is-invalid" : ''}`}
                disabled={fieldsDisabled}
                type="number"
              />
            }
          />
          <InputGroup.Text>
            GPU
          </InputGroup.Text>
          <ErrorMessage
            errors={errors}
            name="HPCnSlotsGPU"
            render={({ message }) =>
              <Form.Control.Feedback type="invalid" className="end-0">
                { message }
              </Form.Control.Feedback>
            }
          />
        </InputGroup>
      </Col>
      <Col className="d-flex flex-column justify-content-end mt-sm-3" md={{span: 3}} lg={{span: 2}}>
        <Form.Label
          htmlFor="HPCnRAM"
          aria-label="HPCnRAM"
          className="mr-2 form-label text-center">
          <FormattedMessage
            description="resourcefields-ram"
            defaultMessage="Prosječna količina radne memorije po poslu (GB):"
          />
        </Form.Label>
        <InputGroup>
          <Controller
            name="HPCnRAM"
            aria-label="HPCnRAM"
            control={control}
            render={ ({field}) =>
              <Form.Control
                {...field}
                disabled={fieldsDisabled}
                className={`form-control text-center ${errors && errors.HPCnRAM ? "is-invalid" : ''}`}
                type="number"
              />
            }
          />
          <InputGroup.Text>
            RAM
          </InputGroup.Text>
          <ErrorMessage
            errors={errors}
            name="HPCnRAM"
            render={({ message }) =>
              <Form.Control.Feedback type="invalid" className="end-0">
                { message }
              </Form.Control.Feedback>
            }
          />
        </InputGroup>
      </Col>
      <Col className="d-flex flex-column justify-content-end offset-md-1 offset-lg-0 mt-sm-3" md={{span: 3}} lg={{span: 2}}>
        <Form.Label
          htmlFor="HPCnTempGB"
          aria-label="HPCnTempGB"
          className="mr-2 form-label text-center">
          <FormattedMessage
            description="resourcefields-temp"
            defaultMessage="Prosječna količina privremenog prostora po poslu (GB):"
          />
        </Form.Label>
        <InputGroup>
          <Controller
            name="HPCnTempGB"
            aria-label="HPCnTempGB"
            control={control}
            render={ ({field}) =>
              <Form.Control
                {...field}
                className={`form-control text-center ${errors && errors.HPCnTempGB ? "is-invalid" : ''}`}
                disabled={fieldsDisabled}
                type="number"
              />
            }
          />
          <InputGroup.Text>
            Temp
          </InputGroup.Text>
          <ErrorMessage
            errors={errors}
            name="HPCnTempGB"
            render={({ message }) =>
              <Form.Control.Feedback type="invalid" className="end-0">
                { message }
              </Form.Control.Feedback>
            }
          />
        </InputGroup>
      </Col>
      <Col  className="d-flex flex-column justify-content-end mt-sm-3" md={{span: 3}} lg={{span: 2}}>
        <Form.Label
          htmlFor="HPCnDiskGB"
          aria-label="HPCnDiskGB"
          className="mr-2 form-label text-center">
          <FormattedMessage
            description="resourcefields-disk"
            defaultMessage="Ukupna količina spremišnog prostora potrebna za projekt (GB):"
          />
        </Form.Label>
        <InputGroup>
          <Controller
            name="HPCnDiskGB"
            aria-label="HPCnDiskGB"
            control={control}
            render={ ({field}) =>
              <Form.Control
                {...field}
                disabled={fieldsDisabled}
                className={`form-control text-center ${errors && errors.HPCnDiskGB ? "is-invalid" : ''}`}
                type="number"
              />
            }
          />
          <InputGroup.Text>
            Disk
          </InputGroup.Text>
          <ErrorMessage
            errors={errors}
            name="HPCnDiskGB"
            render={({ message }) =>
              <Form.Control.Feedback type="invalid" className="end-0">
                { message }
              </Form.Control.Feedback>
            }
          />
        </InputGroup>
      </Col>
    </Row>
  )
}


export const ResourceFields = ({fieldsDisabled=false}) => {
  const { control, getValues, setValue, formState: {errors} } = useFormContext();
  const { ResourceTypesToSelect, ResourceTypesToSelectAdmin } = useContext(SharedData);
  const { userDetails } = useContext(AuthContext);
  const intl = useIntl()

  return (
    <>
      <Row className="mt-5">
        <Col>
          <h4 className="ms-4 mb-3 mt-4">
            <FormattedMessage
              description="resourcefields-title"
              defaultMessage="Resursi"
            />
          </h4><br/>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col md={{span: 7, offset: 1}}>
          <Form.Label
            htmlFor="requestResourceType"
            aria-label="requestResourceType"
            className="mr-2 text-right form-label">
            <FormattedMessage
              description="resourcefields-type"
              defaultMessage="Tip resursa:"
            />
          </Form.Label>
          <Controller
            name="requestResourceType"
            control={control}
            render={ ({field}) =>
              <CustomReactSelect
                aria-label="requestResourceType"
                closeMenuOnSelect={false}
                controlWidth="100%"
                forwardedRef={field.ref}
                id="requestResourceType"
                isMulti
                isDisabled={fieldsDisabled}
                options={userDetails.is_staff || userDetails.is_superuser ? ResourceTypesToSelectAdmin : ResourceTypesToSelect}
                placeholder={intl.formatMessage({
                  defaultMessage: "Odaberi",
                  description: "resourcefields-placeholder"
                })}
                value={getValues('requestResourceType')}
                onChange={(e) => setValue('requestResourceType', e)}
                resourceTypeMultiValue={true}
              />
            }
          />
        </Col>
      </Row>
      <Row style={{height: '50px'}}/>
      <HpcFields fieldsDisabled={fieldsDisabled} />
      <Row style={{height: '50px'}}/>
      <CloudFields fieldsDisabled={fieldsDisabled} />
    </>
  )
}


export default ResourceFields
