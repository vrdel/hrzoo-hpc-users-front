import React, { useContext } from 'react'
import { CustomReactSelect } from '../../components/CustomReactSelect';
import { SharedData } from '../../pages/root';
import {
  Col,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Row,
} from 'reactstrap';
import {
  Controller,
  useFormContext
} from "react-hook-form";


export const CloudFields = ({fieldsDisabled=false}) => {
  const { control, formState: {errors} } = useFormContext();

  return (
    <>
      <Row>
        <Col className="fs-4 mb-3 text-decoration-underline" md={{offset: 1}}>
          CLOUD
        </Col>
        <Col md={{size: 2, offset: 1}}>
          <Label
            htmlFor="CLOUDnVM"
            aria-label="CLOUDnVM"
            className="mr-2 form-label text-center">
            Broj virtualnih poslužitelja:
          </Label>
        </Col>
        <Col md={{size: 2}}>
          <Label
            htmlFor="CLOUDnSlotsCPU"
            aria-label="CLOUDnSlotsCPU"
            className="mr-2 form-label text-center">
            Ukupna količina virtualnih procesorskih jezgara:
          </Label>
        </Col>
        <Col md={{size: 2}}>
          <Label
            htmlFor="CLOUDnRAM"
            aria-label="CLOUDnRAM"
            className="mr-2 form-label text-center">
            Ukupna količina radne memorije (GB):
          </Label>
        </Col>
        <Col md={{size: 2}}>
          <Label
            htmlFor="CLOUDnRAMVM"
            aria-label="CLOUDnRAMVM"
            className="mr-2 form-label text-center">
            Maksimalna količina radne memorije po poslužitelju (GB):
          </Label>
        </Col>
        <Col md={{size: 2}}>
          <Label
            htmlFor="CLOUDnDiskGB"
            aria-label="CLOUDnDiskGB"
            className="mr-2 form-label text-center">
            Ukupna količina prostora za virtualne poslužitelje na standardnom spremištu (GB):
          </Label>
        </Col>
        <div className="w-100"></div>
        <Col md={{size: 2, offset: 1}}>
          <InputGroup>
            <Controller
              name="CLOUDnVM"
              aria-label="CLOUDnVM"
              control={control}
              render={ ({field}) =>
                <Input
                  {...field}
                  disabled={fieldsDisabled}
                  className="form-control text-center"
                  type="number"
                />
              }
            />
            <InputGroupText>
              VM
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Controller
              name="CLOUDnSlotsCPU"
              aria-label="CLOUDnSlotsCPU"
              control={control}
              render={ ({field}) =>
                <Input
                  {...field}
                  className="form-control text-center"
                  disabled={fieldsDisabled}
                  type="number"
                />
              }
            />
            <InputGroupText>
              CPU
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Controller
              name="CLOUDnRAM"
              aria-label="CLOUDnRAM"
              control={control}
              render={ ({field}) =>
                <Input
                  {...field}
                  disabled={fieldsDisabled}
                  className="form-control text-center"
                  type="number"
                />
              }
            />
            <InputGroupText>
              RAM
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Controller
              name="CLOUDnRAMVM"
              aria-label="CLOUDnRAMVM"
              control={control}
              render={ ({field}) =>
                <Input
                  {...field}
                  className="form-control text-center"
                  disabled={fieldsDisabled}
                  type="number"
                />
              }
            />
            <InputGroupText>
              RAM
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Controller
              name="CLOUDnDiskGB"
              aria-label="CLOUDnDiskGB"
              control={control}
              render={ ({field}) =>
                <Input
                  {...field}
                  disabled={fieldsDisabled}
                  className="form-control text-center"
                  type="number"
                />
              }
            />
            <InputGroupText>
              Disk
            </InputGroupText>
          </InputGroup>
        </Col>
      </Row>
      <Row className="mt-5">
        <Col md={{size: 2, offset: 1}}>
          <Label
            htmlFor="CLOUDnFastDiskGB"
            aria-label="CLOUDnFastDiskGB"
            className="mr-2 form-label text-center">
            Ukupna količina prostora za virtualne poslužitelje na brzom spremištu (GB):
          </Label>
        </Col>
        <Col md={{size: 2}}>
          <Label
            htmlFor="CLOUDnIPs"
            aria-label="CLOUDnIPs"
            className="mr-2 form-label text-center">
            Broj javnih IPv4 adresa:
          </Label>
        </Col>
        <div className="w-100"></div>
        <Col md={{size: 2, offset: 1}}>
          <InputGroup>
            <Controller
              name="CLOUDnFastDiskGB"
              aria-label="CLOUDnFastDiskGB"
              control={control}
              render={ ({field}) =>
                <Input
                  {...field}
                  className="form-control text-center"
                  disabled={fieldsDisabled}
                  type="number"
                />
              }
            />
            <InputGroupText>
              Disk
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Controller
              name="CLOUDnIPs"
              aria-label="CLOUDnIPs"
              control={control}
              render={ ({field}) =>
                <Input
                  {...field}
                  disabled={fieldsDisabled}
                  className="form-control text-center"
                  type="number"
                />
              }
            />
            <InputGroupText>
              IP
            </InputGroupText>
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
      <Col className="fs-4 mb-3 text-decoration-underline" md={{offset: 1}}>
        HPC
      </Col>
      <Col md={{size: 2, offset: 1}}>
        <Label
          htmlFor="HPCnSlotsCPU"
          aria-label="HPCnSlotsCPU"
          className="mr-2 form-label text-center">
          Prosječan broj procesorskih jezgri po poslu:
        </Label>
      </Col>
      <Col md={{size: 2}}>
        <Label
          htmlFor="HPCnSlotsGPU"
          aria-label="HPCnSlotsGPU"
          className="mr-2 form-label text-center">
          Prosječan broj grafičkih procesora po poslu:
        </Label>
      </Col>
      <Col md={{size: 2}}>
        <Label
          htmlFor="HPCnRAM"
          aria-label="HPCnRAM"
          className="mr-2 form-label text-center">
          Prosječna količina radne memorije po poslu (GB):
        </Label>
      </Col>
      <Col md={{size: 2}}>
        <Label
          htmlFor="HPCnTempGB"
          aria-label="HPCnTempGB"
          className="mr-2 form-label text-center">
          Prosječna količina privremenog prostora po poslu (GB):
        </Label>
      </Col>
      <Col md={{size: 2}}>
        <Label
          htmlFor="HPCnDiskGB"
          aria-label="HPCnDiskGB"
          className="mr-2 form-label text-center">
          Ukupna količina spremišnog prostora potrebna za projekt (GB):
        </Label>
      </Col>
      <div className="w-100"></div>
      <Col md={{size: 2, offset: 1}}>
        <InputGroup>
          <Controller
            name="HPCnSlotsCPU"
            aria-label="HPCnSlotsCPU"
            control={control}
            render={ ({field}) =>
              <Input
                {...field}
                disabled={fieldsDisabled}
                className="form-control text-center"
                type="number"
              />
            }
          />
          <InputGroupText>
            CPU
          </InputGroupText>
        </InputGroup>
      </Col>
      <Col md={{size: 2}}>
        <InputGroup>
          <Controller
            name="HPCnSlotsGPU"
            aria-label="HPCnSlotsGPU"
            control={control}
            render={ ({field}) =>
              <Input
                {...field}
                className="form-control text-center"
                disabled={fieldsDisabled}
                type="number"
              />
            }
          />
          <InputGroupText>
            GPU
          </InputGroupText>
        </InputGroup>
      </Col>
      <Col md={{size: 2}}>
        <InputGroup>
          <Controller
            name="HPCnRAM"
            aria-label="HPCnRAM"
            control={control}
            render={ ({field}) =>
              <Input
                {...field}
                disabled={fieldsDisabled}
                className="form-control text-center"
                type="number"
              />
            }
          />
          <InputGroupText>
            RAM
          </InputGroupText>
        </InputGroup>
      </Col>
      <Col md={{size: 2}}>
        <InputGroup>
          <Controller
            name="HPCnTempGB"
            aria-label="HPCnTempGB"
            control={control}
            render={ ({field}) =>
              <Input
                {...field}
                className="form-control text-center"
                disabled={fieldsDisabled}
                type="number"
              />
            }
          />
          <InputGroupText>
            Temp
          </InputGroupText>
        </InputGroup>
      </Col>
      <Col md={{size: 2}}>
        <InputGroup>
          <Controller
            name="HPCnDiskGB"
            aria-label="HPCnDiskGB"
            control={control}
            render={ ({field}) =>
              <Input
                {...field}
                disabled={fieldsDisabled}
                className="form-control text-center"
                type="number"
              />
            }
          />
          <InputGroupText>
            Disk
          </InputGroupText>
        </InputGroup>
      </Col>
    </Row>
  )
}


export const ResourceFields = ({fieldsDisabled=false}) => {
  const { control, getValues, setValue, formState: {errors} } = useFormContext();
  const { ResourceTypesToSelect } = useContext(SharedData);

  return (
    <>
      <Row className="mt-5">
        <Col>
          <h4 className="ms-4 mb-3 mt-4">Resursi</h4><br/>
        </Col>
      </Row>
      <Row className="mt-2">
        <Col md={{size: 3, offset: 1}}>
          <Label
            htmlFor="requestResourceType"
            aria-label="requestResourceType"
            className="mr-2 text-right form-label">
            Tip resursa:
          </Label>
          <Controller
            name="requestResourceType"
            control={control}
            render={ ({field}) =>
              <CustomReactSelect
                aria-label="requestResourceType"
                closeMenuOnSelect={false}
                controlWidth="400px"
                forwardedRef={field.ref}
                id="requestResourceType"
                isMulti
                isDisabled={fieldsDisabled}
                options={ResourceTypesToSelect}
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
