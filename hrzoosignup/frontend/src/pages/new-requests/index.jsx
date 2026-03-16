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
  Row,
  Card,
  Form,
  InputGroup,
} from 'react-bootstrap';
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
        <Col md={{span: 10, offset: 1}}>
          <Form.Label
            htmlFor="requestName"
            aria-label="requestName">
            <FormattedMessage
              description="generalfields-name"
              defaultMessage="Naziv:"
            />
            <span className="ms-1 fw-bold text-danger">*</span>
          </Form.Label>
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
        <Col md={{span: 10, offset: 1}}>
          <Form.Label
            htmlFor="requestExplain"
            aria-label="requestExplain">
            <FormattedMessage
              description="generalfields-explanation"
              defaultMessage="Obrazloženje:"
            />
            <span className="ms-1 fw-bold text-danger">*</span>
          </Form.Label>
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
        <Col md={{span: 5, offset: 1}}>
          <Form.Label
            htmlFor="requestName"
            aria-label="requestName">
            <FormattedMessage
              description="generalfields-duration"
              defaultMessage="Period korištenja:"
            />
            <span className="ms-1 fw-bold text-danger">*</span>
          </Form.Label>
        </Col>
        <Col md={{span: 10, offset: 1}} style={{whiteSpace: 'nowrap'}}>
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
      <Row className="mt-4">
        <Row>
          <Col md={{span: 4, offset: 1}} sm={{span: 10}} lg={{span: 10, offset: 1}}  xl={{span: 10, offset: 1}} xxl={{span: 10, offset: 1}}>
            <Form.Label
              htmlFor="requestUsesAI"
              aria-label="requestUsesAI"
              className="mr-2 text-right form-label">
              <FormattedMessage
                description="requestusesai-description"
                defaultMessage="Projekt koristi tehnologije umjetne inteligencije:"
              />
            </Form.Label>
            <span className="ms-1 fw-bold text-danger">*</span>
          </Col>
        </Row>
        <Row>
          <Col md={{span: 1, offset: 1}} lg={{offset: 1, span: 2}} xs={{span: 6}} sm={{span: 6}}>
            <Form.Control
              aria-label="requestUsesAI"
              disabled={true}
              id="requestUsesAI"
              placeholder={intl.formatMessage({
                defaultMessage: "Odaberi",
                description: "requestusesai-placeholder"
              })}
            />
          </Col>
        </Row>
      </Row>
      <Row className="mt-3 ms-2 d-flex g-0">
        <Col md={{offset: 1}}>
          <Form.Label
            htmlFor="scientificDomain"
            aria-label="scientificDomain"
            className="mt-2 text-right form-label">
            <FormattedMessage
              defaultMessage="Znanstveno područje:"
              description="newreqind-scientific-domain"
            />
            <span className="ms-1 fw-bold text-danger">*</span>
          </Form.Label>
          <Row>
            <Col className="mb-3" sm={{span: 12}} md={{span: 10}} lg={{span: 10}} xl={{span: 5}}>
              <Card>
                <Card.Header className="d-inline-flex align-items-center">
                  <Form.Control
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
                    <Form.Control
                      className={`ms-1 form-control text-center`}
                      disabled={true}
                      placeholder={ intl.formatMessage({
                        defaultMessage: "Udio",
                        description: "newreqind-scientific-ratio"
                      }) }
                      type="number"
                    />
                    <InputGroup.Text>
                      %
                    </InputGroup.Text>
                  </InputGroup>
                  <Button
                    size="sm"
                    variant="danger"
                    type="button"
                    disabled={true}
                    className="ms-1"
                  >
                    <FontAwesomeIcon icon={faTimes}/>
                  </Button>
                </Card.Header>
                <Card.Body >
                  <Row className="g-0 mb-2" >
                    <Col className="d-inline-flex align-items-center">
                      <Form.Control
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
                        <Form.Control
                          className={`ms-1 form-control text-center`}
                          placeholder={ intl.formatMessage({
                            defaultMessage: "Udio",
                            description: "newreqind-scientific-ratio"
                          }) }
                          type="number"
                          disabled={true}
                        />
                        <InputGroup.Text>
                          %
                        </InputGroup.Text>
                      </InputGroup>
                      <Button
                        size="sm"
                        variant="danger"
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
                      <Button className="mt-3" size="sm" disabled={true} variant="outline-success">
                        <FontAwesomeIcon icon={faPlus}/>{' '}
                        <FormattedMessage
                          defaultMessage="Novo znanstveno polje"
                          description="newreqind-scientific-newfield"
                        />
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
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
        <Col md={{span: 3, offset: 1}}>
          <Form.Label
            htmlFor="requestResourceType"
            aria-label="requestResourceType"
            className="mr-2 text-right form-label">
            <FormattedMessage
              description="resourcefields-type"
              defaultMessage="Tip resursa:"
            />
          </Form.Label>
          <Form.Control
            aria-label="requestResourceType"
            disabled={true}
            id="requestResourceType"
          />
        </Col>
      </Row>
      <Row style={{height: '50px'}}/>
      <React.Fragment>
        <Row>
          <Col className="fs-4 mb-3" md={{offset: 1}}>
            HPC
          </Col>
        </Row>
        <Row>
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
              <Form.Control
                disabled={true}
                className="form-control text-center"
                type="number"
              />
              <InputGroup.Text>
                CPU
              </InputGroup.Text>
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
              <Form.Control
                className="form-control text-center"
                disabled={true}
                type="number"
              />
              <InputGroup.Text>
                GPU
              </InputGroup.Text>
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
              <Form.Control
                className="form-control text-center"
                disabled={true}
                type="number"
              />
              <InputGroup.Text>
                RAM
              </InputGroup.Text>
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
              <Form.Control
                className="form-control text-center"
                disabled={true}
                type="number"
              />
              <InputGroup.Text>
                Temp
              </InputGroup.Text>
            </InputGroup>
          </Col>
          <Col className="d-flex flex-column justify-content-end offset-lg-0 mt-sm-3" md={{span: 3}} lg={{span: 2}}>
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
              <Form.Control
                className="form-control text-center"
                disabled={true}
                type="number"
              />
              <InputGroup.Text>
                Disk
              </InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>
      </React.Fragment>
      <Row style={{height: '50px'}}/>
      <React.Fragment>
        <Row>
          <Col className="fs-4 mb-3" md={{offset: 1}}>
            CLOUD
          </Col>
        </Row>
        <Row>
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
              <Form.Control
                disabled={true}
                className="form-control text-center"
                type="number"
              />
              <InputGroup.Text>
                VM
              </InputGroup.Text>
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
              <Form.Control
                disabled={true}
                className="form-control text-center"
                type="number"
              />
              <InputGroup.Text>
                CPU
              </InputGroup.Text>
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
              <Form.Control
                disabled={true}
                className="form-control text-center"
                type="number"
              />
              <InputGroup.Text>
                RAM
              </InputGroup.Text>
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
              <Form.Control
                disabled={true}
                className="form-control text-center"
                type="number"
              />
              <InputGroup.Text>
                RAM
              </InputGroup.Text>
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
              <Form.Control
                disabled={true}
                className="form-control text-center"
                type="number"
              />
              <InputGroup.Text>
                Disk
              </InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>
      </React.Fragment>
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
            <Form.Control
              className="form-control text-center"
              disabled={true}
              type="number"
            />
            <InputGroup.Text>
              Disk
            </InputGroup.Text>
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
            <Form.Control
              disabled={true}
              className="form-control text-center"
              type="number"
            />
            <InputGroup.Text>
              IP
            </InputGroup.Text>
          </InputGroup>
        </Col>
      </Row>
      <RequestHorizontalRuler />
      <Row className="mt-2 mb-5 text-center">
        <Col>
          <Button size="lg" disabled={true} variant="success">
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

