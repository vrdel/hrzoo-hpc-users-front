import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from './root';
import { Col, Badge, Placeholder, Row, Table, Label } from 'reactstrap';
import { PageTitle } from '../components/PageTitle';
import { AuthContext } from '../components/AuthContextProvider'
import { fetchCroRIS } from '../api/croris';
import { useQuery } from '@tanstack/react-query';

const CroRisInfo = ({croRisProjects}) => {
  return (
    <>
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
            CroRIS ID
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
          {
            croRisProjects['person_info']['first_name'] ?
              croRisProjects['person_info']['first_name']
            :
              '\u2212'
          }
        </Col>
        <Col className="ms-3" md={{size: 2}}>
          {
            croRisProjects['person_info']['last_name'] ?
              croRisProjects['person_info']['last_name']
            :
              '\u2212'
          }
        </Col>
        <Col className="ms-3" md={{size: 3}}>
          {
            croRisProjects['person_info']['croris_id'] ?
              croRisProjects['person_info']['croris_id']
            :
              '\u2212'
          }
        </Col>
        <Col className="ms-3" md={{size: 4}}>
          {
            croRisProjects['person_info']['email'] ?
              croRisProjects['person_info']['email']
            :
              '\u2212'
          }
        </Col>
      </Row>
      <Row className="g-0 mt-5 ms-3 me-3">
        <Col>
        </Col>
      </Row>
      <Row className="g-0 ms-2 me-3 mb-5 d-flex justify-content-center align-items-center">
        <TableCrorisProjects
          leadData={croRisProjects['projects_lead_info']}
          associateData={croRisProjects['projects_associate_info']}/>
      </Row>
    </>
  )
}

const InstituteInfo = () => {
  const { userDetails } = useContext(AuthContext);

  return (
    <>
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
          {
            userDetails.first_name ?
              userDetails.first_name
            :
              '\u2212'
          }
        </Col>
        <Col className="ms-3" md={{size: 2}}>
          {
            userDetails.last_name ?
              userDetails.last_name
            :
              '\u2212'
          }
        </Col>
        <Col className="ms-3" md={{size: 3}}>
          {
            userDetails.person_uniqueid ?
              userDetails.person_uniqueid
            :
              '\u2212'
          }
        </Col>
        <Col className="ms-3" md={{size: 4}}>
          {
            userDetails.person_mail ?
              userDetails.person_mail
            :
              '\u2212'
          }
        </Col>
      </Row>

      <Row style={{height: "20px"}}>
      </Row>

      <Row className="mt-3 ms-2">
        <Col className="ms-3" md={{size: 2}}>
          <Label
            htmlFor="dirAffiliation"
            aria-label="dirAffiliation"
            className="fs-5 fw-bold"
          >
            Povezanost
          </Label>
        </Col>
        <Col className="ms-3" md={{size: 6}}>
          <Label
            htmlFor="dirInstitute"
            aria-label="dirInstitute"
            className="fs-5 fw-bold"
          >
            Naziv ustanove
          </Label>
        </Col>

        <div className="w-100"></div>

        <Col className="ms-3" md={{size: 2}}>
          {
            userDetails.person_affiliation ?
              userDetails.person_affiliation
            :
              '\u2212'
          }
        </Col>
        <Col className="ms-3" md={{size: 6}}>
          {
            userDetails.person_institution ?
              userDetails.person_institution
            :
              '\u2212'
          }
        </Col>
      </Row>

      <Row style={{height: "20px"}}>
      </Row>

      <Row className="mt-3 ms-2">
        <Col className="ms-3" md={{size: 6}}>
          <Label
            htmlFor="dirOrganisationUnit"
            aria-label="dirOrganisationUnit"
            className="fs-5 fw-bold"
          >
            Organizacijska jedinica
          </Label>
        </Col>

        <div className="w-100"></div>

        <Col className="ms-3" md={{size: 6}}>
          {
            userDetails.person_organisation ?
              userDetails.person_organisation
            :
              '\u2212'
          }
        </Col>
      </Row>
    </>
  )
}

const EmptyCroRis = () => {
  return (
    <>
      <Row>
        <Col className="mt-4 ms-3" sm={{size:3}}>
          <Label for="dir" className="fs-5 text-white ps-2 pe-2 pt-1 pb-1" style={{backgroundColor: "#b04c46"}}>
            Sustav CroRIS:
          </Label>
        </Col>
      </Row>
      <Row className="mt-3 mb-3">
        <Col className="d-flex align-items-center justify-content-center shadow-sm bg-light border border-danger rounded text-muted text-center p-3 fs-3" style={{height: '200px'}} md={{offset: 1, size: 10}}>
          Nema podataka iz sustava CroRIS
        </Col>
      </Row>
    </>
  )
}


const TableCrorisProjects = ({leadData, associateData}) => {
  const CrorisTableHead = () => (
    <thead id="hzsi-thead" className="table-active align-middle text-center text-white">
      <tr className="border-bottom border-1 border-dark">
        <th className="fw-normal">
          Naziv
        </th>
        <th className="fw-normal">
          Uloga
        </th>
        <th className="fw-normal">
          Trajanje
        </th>
        <th className="fw-normal">
          Šifra
        </th>
      </tr>
    </thead>
  )

  if ((leadData && leadData.length > 0) || (associateData && associateData.length > 0))
    return (
      <>
        <Col md={{size: 12}}>
          <Table responsive hover className="shadow-sm">
            <CrorisTableHead />
            <tbody>
              {
                leadData && leadData.map((project, index) =>
                  <tr key={index}>
                    <td className="p-3 fw-bold align-middle text-center">
                      { project['title'] }
                    </td>
                    <td className="p-3 align-middle text-center">
                      <Badge className="fs-6 fw-normal" color="success">
                        voditelj
                      </Badge>
                    </td>
                    <td className="align-middle text-center fs-6 font-monospace">
                      { project['start'] }<br/>{ project['end']}
                    </td>
                    <td className="align-middle text-center fs-6">
                      <Badge className="fs-6 fw-normal" color="secondary">
                        { project['identifier'] }
                      </Badge>
                    </td>
                  </tr>
                )
              }
              {
                associateData && associateData.map((project, index) =>
                  <tr key={index}>
                    <td className="p-3 fw-bold align-middle text-center">
                      { project['title'] }
                    </td>
                    <td className="p-3 align-middle text-center">
                      <Badge className="fs-6 fw-normal" color="primary">
                        suradnik
                      </Badge>
                    </td>
                    <td className="align-middle text-center fs-6 font-monospace">
                      { project['start'] }<br/>{ project['end']}
                    </td>
                    <td className="align-middle text-center fs-6">
                      <Badge className="fs-6 fw-normal" color="secondary">
                        { project['identifier'] }
                      </Badge>
                    </td>
                  </tr>
                )
              }
            </tbody>
          </Table>
        </Col>
        <Col className="fst-italic d-flex justify-content-center align-items-center">
          <small>
            Aktivni projekti registrirani u sustavu CroRIS na kojima sudjelujete
          </small>
        </Col>
      </>
    )
  else
    return (
      <>
        <Col md={{size: 12}}>
          <Table responsive hover className="shadow-sm">
            <CrorisTableHead />
            <tbody>
              {
                [...Array(1)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan="4" className="m-0 p-0 bg-light border-0">
                      <Placeholder size="lg" xs={12} style={{height: '20px', backgroundColor: "rgba(255, 255, 255, 0)"}}/>
                    </td>
                  </tr>
                ))
              }
              <tr key="4">
                <td colSpan="4" className="table-light border-0 text-muted text-center p-3 fs-3">
                  Nema aktivnih projekata u sustavu CroRIS na kojima sudjelujete
                </td>
              </tr>
              {
                [...Array(1)].map((_, i) => (
                  <tr key={i + 6}>
                    <td colSpan="6" className="m-0 p-0 bg-light border-0">
                      <Placeholder size="lg" xs={12} style={{height: '20px', backgroundColor: "rgba(255, 255, 255, 0)"}}/>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </Table>
        </Col>
      </>
    )
}


const MyInfo = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);

  const {status, data: croRisProjects, error, isFetching} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRIS,
      staleTime: 15 * 60 * 1000
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname])

  return (
    <>
      <Row>
        <PageTitle pageTitle={pageTitle}/>
      </Row>

      <InstituteInfo />

      <Row style={{height: "40px"}}>
      </Row>

      {
        status && croRisProjects && croRisProjects.data
        ?
          <CroRisInfo croRisProjects={croRisProjects['data']} />
        :
          <EmptyCroRis />
      }
    </>
  )
};

export default MyInfo;
