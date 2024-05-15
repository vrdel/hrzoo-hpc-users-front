import React, { useContext } from 'react'
import { CustomReactSelect } from 'Components/CustomReactSelect';
import { SharedData } from 'Pages/root';
import { AuthContext } from 'Components/AuthContextProvider';
import {
  Col,
  Input,
  FormFeedback,
  InputGroup,
  InputGroupText,
  Label,
  Row,
} from 'reactstrap';
import { ErrorMessage } from '@hookform/error-message';
import {
  Controller,
  useFormContext
} from "react-hook-form";
import { FormattedMessage } from 'react-intl';


export const CloudFields = ({fieldsDisabled=false}) => {
  const { control, formState: {errors} } = useFormContext();

  return (
    <>
      <Row>
        <Col className="fs-4 mb-3" md={{offset: 1}}>
          CLOUD
        </Col>
        <Col className="d-flex flex-column justify-content-end" md={{offset: 1, size: 3}} lg={{offset: 1, size: 2}}>
          <Label
            htmlFor="CLOUDnVM"
            aria-label="CLOUDnVM"
            className="mr-2 form-label text-center">
            <FormattedMessage
              description="cloudfields-nvm"
              defaultMessage="Broj virtualnih poslužitelja:"
            />
          </Label>
          <InputGroup>
            <Controller
              name="CLOUDnVM"
              aria-label="CLOUDnVM"
              control={control}
              render={ ({field}) =>
                <Input
                  {...field}
                  disabled={fieldsDisabled}
                  className={`form-control text-center ${errors && errors.CLOUDnVM ? "is-invalid" : ''}`}
                  type="number"
                />
              }
            />
            <InputGroupText>
              VM
            </InputGroupText>
            <ErrorMessage
              errors={errors}
              name="CLOUDnVM"
              render={({ message }) =>
                <FormFeedback className="end-0">
                  { message }
                </FormFeedback>
              }
            />
          </InputGroup>
        </Col>
        <Col className="d-flex flex-column justify-content-end" md={{size: 3}} lg={{size: 2}}>
          <Label
            htmlFor="CLOUDnSlotsCPU"
            aria-label="CLOUDnSlotsCPU"
            className="mr-2 form-label text-center">
            <FormattedMessage
              description="cloudfields-vcpu"
              defaultMessage="Ukupna količina virtualnih procesorskih jezgara:"
            />
          </Label>
          <InputGroup>
            <Controller
              name="CLOUDnSlotsCPU"
              aria-label="CLOUDnSlotsCPU"
              control={control}
              render={ ({field}) =>
                <Input
                  {...field}
                  className={`form-control text-center ${errors && errors.CLOUDnSlotsCPU ? "is-invalid" : ''}`}
                  disabled={fieldsDisabled}
                  type="number"
                />
              }
            />
            <InputGroupText>
              CPU
            </InputGroupText>
            <ErrorMessage
              errors={errors}
              name="CLOUDnSlotsCPU"
              render={({ message }) =>
                <FormFeedback className="end-0">
                  { message }
                </FormFeedback>
              }
            />
          </InputGroup>
        </Col>
        <Col className="d-flex flex-column justify-content-end" md={{size: 3}} lg={{size: 2}}>
          <Label
            htmlFor="CLOUDnRAM"
            aria-label="CLOUDnRAM"
            className="mr-2 form-label text-center">
            <FormattedMessage
              description="cloudfields-nram"
              defaultMessage="Ukupna količina radne memorije (GB):"
            />
          </Label>
          <InputGroup>
            <Controller
              name="CLOUDnRAM"
              aria-label="CLOUDnRAM"
              control={control}
              render={ ({field}) =>
                <Input
                  {...field}
                  disabled={fieldsDisabled}
                  className={`form-control text-center ${errors && errors.CLOUDnRAM ? "is-invalid" : ''}`}
                  type="number"
                />
              }
            />
            <InputGroupText>
              RAM
            </InputGroupText>
            <ErrorMessage
              errors={errors}
              name="CLOUDnRAM"
              render={({ message }) =>
                <FormFeedback className="end-0">
                  { message }
                </FormFeedback>
              }
            />
          </InputGroup>
        </Col>
        <Col className="d-flex flex-column justify-content-end offset-md-1 offset-lg-0 mt-sm-3" md={{size: 3}} lg={{size: 2}}>
          <Label
            htmlFor="CLOUDnRAMVM"
            aria-label="CLOUDnRAMVM"
            className="mr-2 form-label text-center">
            <FormattedMessage
              description="cloudfields-nramvm"
              defaultMessage="Maksimalna količina radne memorije po poslužitelju (GB):"
            />
          </Label>
          <InputGroup>
            <Controller
              name="CLOUDnRAMVM"
              aria-label="CLOUDnRAMVM"
              control={control}
              render={ ({field}) =>
                <Input
                  {...field}
                  className={`form-control text-center ${errors && errors.CLOUDnRAMVM ? "is-invalid" : ''}`}
                  disabled={fieldsDisabled}
                  type="number"
                />
              }
            />
            <InputGroupText>
              RAM
            </InputGroupText>
            <ErrorMessage
              errors={errors}
              name="CLOUDnRAMVM"
              render={({ message }) =>
                <FormFeedback className="end-0">
                  { message }
                </FormFeedback>
              }
            />
          </InputGroup>
        </Col>
        <Col className="d-flex flex-column justify-content-end offset-lg-0 mt-sm-3" md={{size: 3}} lg={{size: 2}}>
          <Label
            htmlFor="CLOUDnDiskGB"
            aria-label="CLOUDnDiskGB"
            className="mr-2 form-label text-center">
            <FormattedMessage
              description="cloudfields-ndiskgb"
              defaultMessage="Ukupna količina prostora za virtualne poslužitelje na standardnom spremištu (GB):"
            />
          </Label>
          <InputGroup>
            <Controller
              name="CLOUDnDiskGB"
              aria-label="CLOUDnDiskGB"
              control={control}
              render={ ({field}) =>
                <Input
                  {...field}
                  disabled={fieldsDisabled}
                  className={`form-control text-center ${errors && errors.CLOUDnDiskGB ? "is-invalid" : ''}`}
                  type="number"
                />
              }
            />
            <InputGroupText>
              Disk
            </InputGroupText>
            <ErrorMessage
              errors={errors}
              name="CLOUDnDiskGB"
              render={({ message }) =>
                <FormFeedback className="end-0">
                  { message }
                </FormFeedback>
              }
            />
          </InputGroup>
        </Col>
      </Row>
      <Row className="mt-5">
        <Col className="d-flex flex-column justify-content-end offset-md-1 offset-lg-0 mt-sm-3" md={{size: 3}} lg={{offset: 1, size: 2}}>
          <Label
            htmlFor="CLOUDnFastDiskGB"
            aria-label="CLOUDnFastDiskGB"
            className="mr-2 form-label text-center">
            <FormattedMessage
              description="cloudfields-nfastdiskgb"
              defaultMessage="Ukupna količina prostora za virtualne poslužitelje na brzom spremištu (GB):"
            />
          </Label>
          <InputGroup>
            <Controller
              name="CLOUDnFastDiskGB"
              aria-label="CLOUDnFastDiskGB"
              control={control}
              render={ ({field}) =>
                <Input
                  {...field}
                  className={`form-control text-center ${errors && errors.CLOUDnFastDiskGB ? "is-invalid" : ''}`}
                  disabled={fieldsDisabled}
                  type="number"
                />
              }
            />
            <InputGroupText>
              Disk
            </InputGroupText>
            <ErrorMessage
              errors={errors}
              name="CLOUDnFastDiskGB"
              render={({ message }) =>
                <FormFeedback className="end-0">
                  { message }
                </FormFeedback>
              }
            />
          </InputGroup>
        </Col>
        <Col className="d-flex flex-column justify-content-end mt-sm-3" md={{size: 3}} lg={{size: 2}}>
          <Label
            htmlFor="CLOUDnIPs"
            aria-label="CLOUDnIPs"
            className="mr-2 form-label text-center">
            <FormattedMessage
              description="cloudfields-nips"
              defaultMessage=" Broj javnih IPv4 adresa:"
            />
          </Label>
          <InputGroup>
            <Controller
              name="CLOUDnIPs"
              aria-label="CLOUDnIPs"
              control={control}
              render={ ({field}) =>
                <Input
                  {...field}
                  disabled={fieldsDisabled}
                  className={`form-control text-center ${errors && errors.CLOUDnIPs ? "is-invalid" : ''}`}
                  type="number"
                />
              }
            />
            <InputGroupText>
              IP
            </InputGroupText>
            <ErrorMessage
              errors={errors}
              name="CLOUDnIPs"
              render={({ message }) =>
                <FormFeedback className="end-0">
                  { message }
                </FormFeedback>
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
      <Col className="d-flex flex-column justify-content-end mt-sm-3" md={{offset: 1, size: 3}} lg={{offset: 1, size: 2}}>
        <Label
          htmlFor="HPCnSlotsCPU"
          aria-label="HPCnSlotsCPU"
          className="mr-2 form-label text-center">
          <FormattedMessage
            description="resourcefields-ncpu"
            defaultMessage="Prosječan broj procesorskih jezgri po poslu:"
          />
        </Label>
        <InputGroup>
          <Controller
            name="HPCnSlotsCPU"
            aria-label="HPCnSlotsCPU"
            control={control}
            render={ ({field}) =>
              <Input
                {...field}
                disabled={fieldsDisabled}
                className={`form-control text-center ${errors && errors.HPCnSlotsCPU ? "is-invalid" : ''}`}
                type="number"
              />
            }
          />
          <InputGroupText>
            CPU
          </InputGroupText>
          <ErrorMessage
            errors={errors}
            name="HPCnSlotsCPU"
            render={({ message }) =>
              <FormFeedback className="end-0">
                { message }
              </FormFeedback>
            }
          />
        </InputGroup>
      </Col>
      <Col className="d-flex flex-column justify-content-end mt-sm-3" md={{size: 3}} lg={{size: 2}}>
        <Label
          htmlFor="HPCnSlotsGPU"
          aria-label="HPCnSlotsGPU"
          className="mr-2 form-label text-center">
          <FormattedMessage
            description="resourcefields-ngpu"
            defaultMessage="Prosječan broj grafičkih procesora po poslu:"
          />
        </Label>
        <InputGroup>
          <Controller
            name="HPCnSlotsGPU"
            aria-label="HPCnSlotsGPU"
            control={control}
            render={ ({field}) =>
              <Input
                {...field}
                className={`form-control text-center ${errors && errors.HPCnSlotsGPU ? "is-invalid" : ''}`}
                disabled={fieldsDisabled}
                type="number"
              />
            }
          />
          <InputGroupText>
            GPU
          </InputGroupText>
          <ErrorMessage
            errors={errors}
            name="HPCnSlotsGPU"
            render={({ message }) =>
              <FormFeedback className="end-0">
                { message }
              </FormFeedback>
            }
          />
        </InputGroup>
      </Col>
      <Col className="d-flex flex-column justify-content-end mt-sm-3" md={{size: 3}} lg={{size: 2}}>
        <Label
          htmlFor="HPCnRAM"
          aria-label="HPCnRAM"
          className="mr-2 form-label text-center">
          <FormattedMessage
            description="resourcefields-ram"
            defaultMessage="Prosječna količina radne memorije po poslu (GB):"
          />
        </Label>
        <InputGroup>
          <Controller
            name="HPCnRAM"
            aria-label="HPCnRAM"
            control={control}
            render={ ({field}) =>
              <Input
                {...field}
                disabled={fieldsDisabled}
                className={`form-control text-center ${errors && errors.HPCnRAM ? "is-invalid" : ''}`}
                type="number"
              />
            }
          />
          <InputGroupText>
            RAM
          </InputGroupText>
          <ErrorMessage
            errors={errors}
            name="HPCnRAM"
            render={({ message }) =>
              <FormFeedback className="end-0">
                { message }
              </FormFeedback>
            }
          />
        </InputGroup>
      </Col>
      <Col className="d-flex flex-column justify-content-end offset-md-1 offset-lg-0 mt-sm-3" md={{size: 3}} lg={{size: 2}}>
        <Label
          htmlFor="HPCnTempGB"
          aria-label="HPCnTempGB"
          className="mr-2 form-label text-center">
          <FormattedMessage
            description="resourcefields-temp"
            defaultMessage="Prosječna količina privremenog prostora po poslu (GB):"
          />
        </Label>
        <InputGroup>
          <Controller
            name="HPCnTempGB"
            aria-label="HPCnTempGB"
            control={control}
            render={ ({field}) =>
              <Input
                {...field}
                className={`form-control text-center ${errors && errors.HPCnTempGB ? "is-invalid" : ''}`}
                disabled={fieldsDisabled}
                type="number"
              />
            }
          />
          <InputGroupText>
            Temp
          </InputGroupText>
          <ErrorMessage
            errors={errors}
            name="HPCnTempGB"
            render={({ message }) =>
              <FormFeedback className="end-0">
                { message }
              </FormFeedback>
            }
          />
        </InputGroup>
      </Col>
      <Col  className="d-flex flex-column justify-content-end mt-sm-3" md={{size: 3}} lg={{size: 2}}>
        <Label
          htmlFor="HPCnDiskGB"
          aria-label="HPCnDiskGB"
          className="mr-2 form-label text-center">
          <FormattedMessage
            description="resourcefields-disk"
            defaultMessage="Ukupna količina spremišnog prostora potrebna za projekt (GB):"
          />
        </Label>
        <InputGroup>
          <Controller
            name="HPCnDiskGB"
            aria-label="HPCnDiskGB"
            control={control}
            render={ ({field}) =>
              <Input
                {...field}
                disabled={fieldsDisabled}
                className={`form-control text-center ${errors && errors.HPCnDiskGB ? "is-invalid" : ''}`}
                type="number"
              />
            }
          />
          <InputGroupText>
            Disk
          </InputGroupText>
          <ErrorMessage
            errors={errors}
            name="HPCnDiskGB"
            render={({ message }) =>
              <FormFeedback className="end-0">
                { message }
              </FormFeedback>
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

  return (
    <>
      <Row className="mt-5">
        <Col>
          <h4 className="ms-4 mb-3 mt-4">Resursi</h4><br/>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col md={{size: 7, offset: 1}}>
          <Label
            htmlFor="requestResourceType"
            aria-label="requestResourceType"
            className="mr-2 text-right form-label">
            <FormattedMessage
              description="resourcefields-type"
              defaultMessage="Tip resursa:"
            />
          </Label>
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
                placeholder="Odaberi"
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
