import React, { useContext, useState, useEffect } from 'react';
import {
  Label,
} from 'reactstrap';
import { SharedData } from './root';
import { Col, Row } from 'reactstrap';
import { PageTitle } from '../components/PageTitle';
import { AuthContext } from '../components/AuthContextProvider.jsx'

const MyInfo = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const { userDetails } = useContext(AuthContext);

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname])

  return (
    <>
      <Row>
        <PageTitle pageTitle={pageTitle}/>
      </Row>
      <Row>
        <Col className="mt-4 ms-3" sm={{size:3}}>
          <Label for="dir" className="fs-5 text-white ps-2 pe-2 pt-1 pb-1" style={{backgroundColor: "#b04c46"}}>
            Imenik:
          </Label>
        </Col>
      </Row>
      <Row className="mt-3 ms-2">
        <Col className="ms-3" md={{size: 2}}>
          <Label
            htmlFor="dirName"
            aria-label="dirName"
            className="fs-5 fw-bold"
          >
            Ime
          </Label>
        </Col>
        <Col className="ms-3" md={{size: 2}}>
          <Label
            htmlFor="dirLast"
            aria-label="dirLastName"
            className="fs-5 fw-bold"
          >
            Prezime
          </Label>
        </Col>
        <Col className="ms-3" md={{size: 3}}>
          <Label
            htmlFor="dirUniqueId"
            aria-label="dirUniqueId"
            className="fs-5 fw-bold"
          >
            Korisnička oznaka
          </Label>
        </Col>
        <Col className="ms-3" md={{size: 4}}>
          <Label
            htmlFor="dirEmail"
            aria-label="dirEmail"
            className="fs-5 fw-bold"
          >
            Email
          </Label>
        </Col>

        <div className="w-100"></div>

        <Col className="ms-3" md={{size: 2}}>
          { userDetails.first_name }
        </Col>
        <Col className="ms-3" md={{size: 2}}>
          { userDetails.last_name }
        </Col>
        <Col className="ms-3" md={{size: 3}}>
          { userDetails.person_uniqueid }
        </Col>
        <Col className="ms-3" md={{size: 4}}>
          { userDetails.person_mail }
        </Col>
      </Row>

      <Row style={{height: "20px"}}>
      </Row>

      <Row className="mt-3 ms-2">
        <Col className="ms-3" md={{size: 4}}>
          <Label
            htmlFor="dirInstitute"
            aria-label="dirInstitute"
            className="fs-5 fw-bold"
          >
            Naziv ustanove
          </Label>
        </Col>
        <Col className="ms-4" md={{size: 4}}>
          <Label
            htmlFor="dirAffiliation"
            aria-label="dirAffiliation"
            className="fs-5 fw-bold"
          >
            Povezanost
          </Label>
        </Col>

        <div className="w-100"></div>

        <Col className="ms-4" md={{size: 4}}>
          { userDetails.person_institution }
        </Col>
        <Col className="ms-4" md={{size: 4}}>
          { userDetails.person_affiliation }
        </Col>
      </Row>

      <Row style={{height: "40px"}}>
      </Row>

      <Row>
        <Col className="mt-4 ms-3" sm={{size:3}}>
          <Label for="dir" className="fs-5 text-white ps-2 pe-2 pt-1 pb-1" style={{backgroundColor: "#b04c46"}}>
            Sustav CroRIS:
          </Label>
        </Col>
      </Row>
      <Row className="mt-3 ms-2">
        <Col className="ms-3" md={{size: 2}}>
          <Label
            htmlFor="dirName"
            aria-label="dirName"
            className="fs-5 fw-bold"
          >
            Ime
          </Label>
        </Col>
        <Col className="ms-3" md={{size: 2}}>
          <Label
            htmlFor="dirLast"
            aria-label="dirLastName"
            className="fs-5 fw-bold"
          >
            Prezime
          </Label>
        </Col>
        <Col className="ms-3" md={{size: 3}}>
          <Label
            htmlFor="dirUniqueId"
            aria-label="dirUniqueId"
            className="fs-5 fw-bold"
          >
            Korisnička oznaka
          </Label>
        </Col>
        <Col className="ms-3" md={{size: 4}}>
          <Label
            htmlFor="dirEmail"
            aria-label="dirEmail"
            className="fs-5 fw-bold"
          >
            Email
          </Label>
        </Col>

        <div className="w-100"></div>

        <Col className="ms-3" md={{size: 2}}>
          { userDetails.first_name }
        </Col>
        <Col className="ms-3" md={{size: 2}}>
          { userDetails.last_name }
        </Col>
        <Col className="ms-3" md={{size: 3}}>
          { userDetails.person_uniqueid }
        </Col>
        <Col className="ms-3" md={{size: 4}}>
          { userDetails.person_mail }
        </Col>
      </Row>
    </>
  )
};

export default MyInfo;
