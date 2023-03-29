import React, { useState } from 'react'
import RequestHorizontalRuler from '../../components/RequestHorizontalRuler';
import { Col, Row, Button, Label  } from 'reactstrap';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import '../../styles/datepicker.css';

const GeneralRequest = () => {
  const [fromDate, setFromDate] = useState(undefined)
  const [toDate, setToDate] = useState(undefined)

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
      <Row className="mt-3">
        <Col md={{size: 10, offset: 1}}>
          <Label
            htmlFor="requestExplain"
            aria-label="requestExplain"
            className="mr-2 text-right form-label">
            Obrazloženje:
          </Label>
          <textarea
            id="requestExplain"
            aria-label="requestExplain"
            type="text"
            className="form-control"
            rows="3"
            required={true}
          />
        </Col>
        <Col>
        </Col>
      </Row>
      <Row className="mt-3">
        <Col md={{size: 5, offset: 1}}>
          <Label
            htmlFor="requestName"
            aria-label="requestName"
            className="mr-2 text-right form-label">
            Period korištenja:
          </Label>
        </Col>
        <Col md={{size: 10, offset: 1}} style={{whiteSpace: 'nowrap'}}>
          <DatePicker className="mt-2 me-3" onChange={setFromDate} />
          {'\u2212'}
          <DatePicker className="ms-3" onChange={setFromDate} />
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
