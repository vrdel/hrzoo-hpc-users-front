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


const ResourceFields = () => {
  const { control, setValue, formState: {errors} } = useFormContext();
  const { ResourceTypesToSelect } = useContext(SharedData);

  return (
    <>
      <Row className="mt-5">
        <Col>
          <h4 className="ms-4 mb-3 mt-4">Resursi</h4><br/>
        </Col>
      </Row>
      <Row>
        <Col md={{size: 2, offset: 1}}>
          <Label
            htmlFor="nSlotsCPU"
            aria-label="nSlotsCPU"
            className="mr-2 form-label text-center">
            Prosječan broj procesorskih jezgri po poslu:
          </Label>
        </Col>
        <Col md={{size: 2}}>
          <Label
            htmlFor="nSlotsGPU"
            aria-label="nSlotsGPU"
            className="mr-2 form-label text-center">
            Prosječan broj grafičkih procesora po poslu:
          </Label>
        </Col>
        <Col md={{size: 2}}>
          <Label
            htmlFor="nRAM"
            aria-label="nRAM"
            className="mr-2 form-label text-center">
            Prosječna količina radne memorije po poslu (GB):
          </Label>
        </Col>
        <Col md={{size: 2}}>
          <Label
            htmlFor="nTempGB"
            aria-label="nTempGB"
            className="mr-2 form-label text-center">
            Prosječna količina privremenog prostora po poslu (GB):
          </Label>
        </Col>
        <Col md={{size: 2}}>
          <Label
            htmlFor="nDiskGB"
            aria-label="nDiskGB"
            className="mr-2 form-label text-center">
            Ukupna količina spremišnog prostora po poslu (GB):
          </Label>
        </Col>
        <div className="w-100"></div>
        <Col md={{size: 2, offset: 1}}>
          <InputGroup>
            <Controller
              name="nSlotsCPU"
              aria-label="nSlotsCPU"
              control={control}
              rules={{required: true}}
              render={ ({field}) =>
                <Input
                  {...field}
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
              name="nSlotsGPU"
              aria-label="nSlotsGPU"
              control={control}
              rules={{required: true}}
              render={ ({field}) =>
                <Input
                  {...field}
                  className="form-control text-center"
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
              name="nRAM"
              aria-label="nRAM"
              control={control}
              rules={{required: true}}
              render={ ({field}) =>
                <Input
                  {...field}
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
              name="nTempGB"
              aria-label="nTempGB"
              control={control}
              rules={{required: true}}
              render={ ({field}) =>
                <Input
                  {...field}
                  className="form-control text-center"
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
              name="nDiskGB"
              aria-label="nDiskGB"
              control={control}
              rules={{required: true}}
              render={ ({field}) =>
                <Input
                  {...field}
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
      <Row className="mt-3">
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
            rules={{required: true}}
            render={ ({field}) =>
              <CustomReactSelect
                aria-label="requestResourceType"
                closeMenuOnSelect={false}
                controlWidth="400px"
                forwardedRef={field.ref}
                id="requestResourceType"
                isMulti
                options={ResourceTypesToSelect}
                placeholder="Odaberi"
                onChange={(e) => setValue('requestResourceType', e)}
                resourceTypeMultiValue={true}
              />
            }
          />
        </Col>
      </Row>
    </>
  )
}


export default ResourceFields
