import React from 'react'
import RequestHorizontalRuler from '../../components/RequestHorizontalRuler';
import { Col, Row, Button, Label, Input } from 'reactstrap';

const GeneralRequest = () => {
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
            aria-label="requestName"
            className="mr-2 text-right form-label">
              Naziv:
          </Label>
          <textarea
            id="requestName"
            aria-label="requestName"
            type="text"
            className="form-control"
            rows="1"
            required={true}
          />
        </Col>
        <Col>
        </Col>
      </Row>
      <Row>
        <Col md={{size: 10, offset: 1}}>
          <Label
            htmlFor="requestName"
            aria-label="requestName"
            className="mr-2 text-right form-label">
            Period korištenja:
          </Label>
          <textarea
            id="requestName"
            aria-label="requestName"
            type="text"
            className="form-control"
            rows="1"
            required={true}
          />
        </Col>
        <Col>
        </Col>
      </Row>
      <RequestHorizontalRuler />
      <Row className="mt-2 mb-2 text-center">
        <Col>
          <Button size="lg" color="success" id="submit-button" type="submit">Podnesi zahtjev</Button>
        </Col>
      </Row>
    </>
  )
};

export default GeneralRequest;
