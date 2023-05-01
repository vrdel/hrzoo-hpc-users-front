import React from 'react'
import RequestHorizontalRuler from '../../components/RequestHorizontalRuler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile,
  faTimes,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Col,
  Form,
  FormFeedback,
  Label,
  Row,
  Card,
  CardBody,
  CardHeader,
  Input,
  InputGroup,
  InputGroupText,
  Placeholder,
} from 'reactstrap';
import DatePicker from 'react-date-picker';


const NewRequestIndex = () => {
  return (
    <>
      <RequestHorizontalRuler />
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
          <textarea
            id="requestName"
            aria-label="requestName"
            type="text"
            disabled={true}
            className="form-control"
            rows="1"
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
          <textarea
            id="requestExplain"
            aria-label="requestExplain"
            type="text"
            disabled={true}
            className="form-control"
            rows="4"
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
          <DatePicker
            locale="hr-HR"
            required={true}
            disabled={true}
            className="mt-2 me-3"
          />
          {'\u2212'}
          <DatePicker
            required={true}
            disabled={true}
            locale="hr-HR"
            className="ms-3"
          />
        </Col>
      </Row>
      <Row className="mt-3 ms-2 d-flex g-0">
        <Col md={{offset: 1}}>
          <Label
            htmlFor="scientificDomain"
            aria-label="scientificDomain"
            className="mt-2 text-right form-label">
            Znanstveno područje:
            <span className="ms-1 fw-bold text-danger">*</span>
          </Label>
          <Row>
            <Col className="mb-3" sm={{size: 12}} md={{size: 10}} lg={{size: 10}} xl={{size: 5}}>
              <Card>
                <CardHeader className="d-inline-flex align-items-center">
                  <Input
                    aria-label="scientificDomain"
                    id="scientificDomain"
                    placeholder="Područje"
                    disabled={true}
                    style={{maxWidth: '64%'}}
                  />
                  <InputGroup style={{maxWidth: '30%'}}>
                    <Input
                      className={`ms-1 form-control text-center`}
                      disabled={true}
                      placeholder="Udio"
                      type="number"
                    />
                    <InputGroupText>
                      %
                    </InputGroupText>
                  </InputGroup>
                  <Button
                    size="sm"
                    color="danger"
                    type="button"
                    disabled={true}
                    className="ms-1"
                  >
                    <FontAwesomeIcon icon={faTimes}/>
                  </Button>
                </CardHeader>
                <CardBody >
                  <Row className="g-0 mb-2" >
                    <Col className="d-inline-flex align-items-center">
                      <Input
                        aria-label="scientificDomain"
                        disabled={true}
                        className="rounded"
                        id="scientificDomain"
                        placeholder="Polje"
                        style={{maxWidth: '64%'}}
                      />
                      <InputGroup style={{maxWidth: '30%'}}>
                        <Input
                          className={`ms-1 form-control text-center`}
                          placeholder="Udio"
                          type="number"
                          disabled={true}
                        />
                        <InputGroupText>
                          %
                        </InputGroupText>
                      </InputGroup>
                      <Button
                        size="sm"
                        color="danger"
                        className="ms-1"
                        disabled={true}
                        type="button"
                      >
                        <FontAwesomeIcon icon={faTimes}/>
                      </Button>
                    </Col>
                  </Row>
                  <Row className="g-0">
                    <Col className="text-center">
                      <Button className="mt-3" size="sm" disabled={true} outline color="success">
                        <FontAwesomeIcon icon={faPlus}/>{' '}
                        Novo znanstveno polje
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mt-5">
        <Col>
          <h4 className="ms-4 mb-3 mt-4">Znanstveni softver</h4><br/>
        </Col>
      </Row>
      <Row className="mt-1">
        <Col md={{size: 10, offset: 1}}>
          <Label
            htmlFor="requestScientificSoftware"
            aria-label="requestScientificSoftware"
            className="mr-2 text-right form-label">
            Aplikacije koje će se koristiti:
          </Label>
          <Input
            aria-label="requestScientificSoftware"
            disabled={true}
            id="requestScientificSoftware"
            placeholder="Odaberi"
          />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={{size: 10, offset: 1}}>
          <Label
            htmlFor="requestScientificSoftwareExtra"
            aria-label="requestScientificSoftwareExtra">
            Dodatne aplikacije koje će biti potrebno instalirati:
          </Label>
          <textarea
            id="requestScientificSoftwareExtra"
            aria-label="requestScientificSoftwareExtra"
            type="text"
            disabled={true}
            className={`form-control`}
            rows="3"
          />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col sm={{offset: 1}}>
          <Label
            htmlFor="requestScientificSoftwareHelp"
            aria-label="requestScientificSoftwareHelp"
            className="mr-2 text-right form-label">
            Potrebna pomoć pri instalaciji:
          </Label>
          <Input disabled={true} type="checkbox" className="ms-3 fw-bold"/>
        </Col>
        <div className="w-100"></div>
      </Row>
      <Row className="mt-5">
        <Col>
          <h4 className="ms-4 mb-3 mt-4">Resursi</h4><br/>
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
          <Input
            aria-label="requestResourceType"
            disabled={true}
            id="requestResourceType"
          />
        </Col>
      </Row>
      <Row style={{height: '50px'}}/>
      <Row>
        <Col className="fs-4 mb-3" md={{offset: 1}}>
          HPC
        </Col>
        <Col className="d-flex align-items-center" md={{size: 2, offset: 1}}>
          <Label
            htmlFor="HPCnSlotsCPU"
            aria-label="HPCnSlotsCPU"
            className="mr-2 form-label text-center">
            Prosječan broj procesorskih jezgri po poslu:
          </Label>
        </Col>
        <Col className="d-flex align-items-center" md={{size: 2}}>
          <Label
            htmlFor="HPCnSlotsGPU"
            aria-label="HPCnSlotsGPU"
            className="mr-2 form-label text-center">
            Prosječan broj grafičkih procesora po poslu:
          </Label>
        </Col>
        <Col className="d-flex align-items-center" md={{size: 2}}>
          <Label
            htmlFor="HPCnRAM"
            aria-label="HPCnRAM"
            className="mr-2 form-label text-center">
            Prosječna količina radne memorije po poslu (GB):
          </Label>
        </Col>
        <Col className="d-flex align-items-center" md={{size: 2}}>
          <Label
            htmlFor="HPCnTempGB"
            aria-label="HPCnTempGB"
            className="mr-2 form-label text-center">
            Prosječna količina privremenog prostora po poslu (GB):
          </Label>
        </Col>
        <Col className="d-flex align-items-center" md={{size: 2}}>
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
            <Input
              disabled={true}
              className="form-control text-center"
              type="number"
            />
            <InputGroupText>
              CPU
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Input
              className="form-control text-center"
              disabled={true}
              type="number"
            />
            <InputGroupText>
              GPU
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Input
              className="form-control text-center"
              disabled={true}
              type="number"
            />
            <InputGroupText>
              RAM
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Input
              className="form-control text-center"
              disabled={true}
              type="number"
            />
            <InputGroupText>
              Temp
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Input
              className="form-control text-center"
              disabled={true}
              type="number"
            />
            <InputGroupText>
              Disk
            </InputGroupText>
          </InputGroup>
        </Col>
      </Row>
      <Row style={{height: '50px'}}/>
      <Row>
        <Col className="fs-4 mb-3" md={{offset: 1}}>
          CLOUD
        </Col>
        <Col className="d-flex align-items-center" md={{size: 2, offset: 1}}>
          <Label
            htmlFor="CLOUDnVM"
            aria-label="CLOUDnVM"
            className="mr-2 form-label text-center">
            Broj virtualnih poslužitelja:
          </Label>
        </Col>
        <Col className="d-flex align-items-center" md={{size: 2}}>
          <Label
            htmlFor="CLOUDnSlotsCPU"
            aria-label="CLOUDnSlotsCPU"
            className="mr-2 form-label text-center">
            Ukupna količina virtualnih procesorskih jezgara:
          </Label>
        </Col>
        <Col className="d-flex align-items-center" md={{size: 2}}>
          <Label
            htmlFor="CLOUDnRAM"
            aria-label="CLOUDnRAM"
            className="mr-2 form-label text-center">
            Ukupna količina radne memorije (GB):
          </Label>
        </Col>
        <Col className="d-flex align-items-center" md={{size: 2}}>
          <Label
            htmlFor="CLOUDnRAMVM"
            aria-label="CLOUDnRAMVM"
            className="mr-2 form-label text-center">
            Maksimalna količina radne memorije po poslužitelju (GB):
          </Label>
        </Col>
        <Col className="d-flex align-items-center" md={{size: 2}}>
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
            <Input
              disabled={true}
              className="form-control text-center"
              type="number"
            />
            <InputGroupText>
              VM
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Input
              disabled={true}
              className="form-control text-center"
              type="number"
            />
            <InputGroupText>
              CPU
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Input
              disabled={true}
              className="form-control text-center"
              type="number"
            />
            <InputGroupText>
              RAM
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Input
              disabled={true}
              className="form-control text-center"
              type="number"
            />
            <InputGroupText>
              RAM
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Input
              disabled={true}
              className="form-control text-center"
              type="number"
            />
            <InputGroupText>
              Disk
            </InputGroupText>
          </InputGroup>
        </Col>
      </Row>
      <Row className="mt-5">
        <Col className="d-flex align-items-center" md={{size: 2, offset: 1}}>
          <Label
            htmlFor="CLOUDnFastDiskGB"
            aria-label="CLOUDnFastDiskGB"
            className="mr-2 form-label text-center">
            Ukupna količina prostora za virtualne poslužitelje na brzom spremištu (GB):
          </Label>
        </Col>
        <Col className="d-flex align-items-center" md={{size: 2}}>
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
            <Input
              className="form-control text-center"
              disabled={true}
              type="number"
            />
            <InputGroupText>
              Disk
            </InputGroupText>
          </InputGroup>
        </Col>
        <Col md={{size: 2}}>
          <InputGroup>
            <Input
              disabled={true}
              className="form-control text-center"
              type="number"
            />
            <InputGroupText>
              IP
            </InputGroupText>
          </InputGroup>
        </Col>
      </Row>
      <RequestHorizontalRuler />
      <Row className="mt-2 mb-5 text-center">
        <Col>
          <Button size="lg" disabled={true} color="success">
            <FontAwesomeIcon icon={faFile}/>{' '}
            Podnesi zahtjev
          </Button>
        </Col>
      </Row>
    </>
  )
};

export default NewRequestIndex;

