import React from 'react'
import RequestHorizontalRuler from 'Components/RequestHorizontalRuler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFile,
  faTimes,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Col,
  Label,
  Row,
  Card,
  CardBody,
  CardHeader,
  Input,
  InputGroup,
  InputGroupText,
} from 'reactstrap';
import DatePicker from 'react-date-picker';
import { FormattedMessage, useIntl } from 'react-intl';


const NewRequestIndex = () => {
  const intl = useIntl()

  return (
    <>
      <RequestHorizontalRuler />
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
            <FormattedMessage
              description="generalfields-explanation"
              defaultMessage="Obrazloženje:"
            />
            <span className="ms-1 fw-bold text-danger">*</span>
          </Label>
          <textarea
            id="requestExplain"
            aria-label="requestExplain"
            type="text"
            disabled={true}
            className="form-control"
            rows="7"
          />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={{size: 5, offset: 1}}>
          <Label
            htmlFor="requestName"
            aria-label="requestName">
            <FormattedMessage
              description="generalfields-duration"
              defaultMessage="Period korištenja:"
            />
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
            <FormattedMessage
              defaultMessage="Znanstveno područje:"
              description="newreqind-scientific-domain"
            />
            <span className="ms-1 fw-bold text-danger">*</span>
          </Label>
          <Row>
            <Col className="mb-3" sm={{size: 12}} md={{size: 10}} lg={{size: 10}} xl={{size: 5}}>
              <Card>
                <CardHeader className="d-inline-flex align-items-center">
                  <Input
                    aria-label="scientificDomain"
                    id="scientificDomain"
                    placeholder={ intl.formatMessage({
                      defaultMessage: "Područje",
                      description: "newreqind-scientific-field"
                    }) }
                    disabled={true}
                    style={{maxWidth: '64%'}}
                  />
                  <InputGroup style={{maxWidth: '30%'}}>
                    <Input
                      className={`ms-1 form-control text-center`}
                      disabled={true}
                      placeholder={ intl.formatMessage({
                        defaultMessage: "Udio",
                        description: "newreqind-scientific-ratio"
                      }) }
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
                        placeholder={ intl.formatMessage({
                          defaultMessage: "Polje",
                          description: "newreqind-scientific-field"
                        }) }
                        style={{maxWidth: '64%'}}
                      />
                      <InputGroup style={{maxWidth: '30%'}}>
                        <Input
                          className={`ms-1 form-control text-center`}
                          placeholder={ intl.formatMessage({
                            defaultMessage: "Udio",
                            description: "newreqind-scientific-ratio"
                          }) }
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
                        <FormattedMessage
                          defaultMessage="Novo znanstveno polje"
                          description="newreqind-scientific-newfield"
                        />
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
          <h4 className="ms-4 mb-3 mt-4">
            <FormattedMessage
              description="sciencesoftware-title"
              defaultMessage="Znanstveni softver"
            />
          </h4><br/>
        </Col>
      </Row>
      <Row className="mt-1">
        <Col md={{size: 10, offset: 1}}>
          <Label
            htmlFor="requestScientificSoftware"
            aria-label="requestScientificSoftware"
            className="mr-2 text-right form-label">
            <FormattedMessage
              description="sciencesoftware-list"
              defaultMessage="Aplikacije koje će se koristiti:"
            />
          </Label>
          <Input
            aria-label="requestScientificSoftware"
            disabled={true}
            id="requestScientificSoftware"
            placeholder={intl.formatMessage({
              defaultMessage: "Odaberi",
              description: 'sciencesoftware-placeholder'
            })}
          />
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={{size: 10, offset: 1}}>
          <Label
            htmlFor="requestScientificSoftwareExtra"
            aria-label="requestScientificSoftwareExtra">
            <FormattedMessage
              description="sciencesoftware-list"
              defaultMessage="Dodatne aplikacije koje će biti potrebno instalirati:"
            />
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
            <FormattedMessage
              description="sciencesoftware-help"
              defaultMessage="Potrebna pomoć pri instalaciji:"
            />
          </Label>
          <Input disabled={true} type="checkbox" className="ms-3 fw-bold"/>
        </Col>
        <div className="w-100"></div>
      </Row>
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
      <Row className="mt-3">
        <Col md={{size: 3, offset: 1}}>
          <Label
            htmlFor="requestResourceType"
            aria-label="requestResourceType"
            className="mr-2 text-right form-label">
            <FormattedMessage
              description="resourcefields-type"
              defaultMessage="Tip resursa:"
            />
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
        <Col className="d-flex flex-column justify-content-end offset-lg-0 mt-sm-3" md={{size: 3}} lg={{size: 2}}>
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
            <FormattedMessage
              defaultMessage="Podnesi zahtjev"
              description="researchselected-label-submit"
            />
          </Button>
        </Col>
      </Row>
    </>
  )
};

export default NewRequestIndex;

