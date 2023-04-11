import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from './root';
import { Col, Badge, Placeholder, Row, Table, Label } from 'reactstrap';
import { PageTitle } from '../components/PageTitle';
import { AuthContext } from '../components/AuthContextProvider'
import { fetchCroRIS } from '../api/croris';
import { useQuery } from '@tanstack/react-query';


const TableCrorisProjects = ({leadData, associateData}) => {
  return (
    <>
      <Col md={{size: 12}}>
        <Table responsive hover className="shadow-sm">
          <thead id="hzsi-thead" className="table-active align-middle text-center text-white">
            <tr className="border-bottom border-2 border-dark">
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
          Aktivni projekti na kojima sudjelujete i koji su registrirani u sustavu CroRIS
        </small>
      </Col>
    </>
  )
}


const MyInfo = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const { userDetails } = useContext(AuthContext);

  const {status, data: croRisProjects, error, isFetching} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRIS,
      staleTime: 15 * 60 * 1000
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname])

  if (status === 'success' && croRisProjects['data'])
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
            { userDetails.person_affiliation }
          </Col>
          <Col className="ms-3" md={{size: 6}}>
            { userDetails.person_institution }
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
            { croRisProjects['data']['person_info']['first_name'] }
          </Col>
          <Col className="ms-3" md={{size: 2}}>
            { croRisProjects['data']['person_info']['last_name'] }
          </Col>
          <Col className="ms-3" md={{size: 3}}>
            { croRisProjects['data']['person_info']['croris_id'] }
          </Col>
          <Col className="ms-3" md={{size: 4}}>
            { croRisProjects['data']['person_info']['email'] }
          </Col>
        </Row>
        <Row noGutters className="mt-5 ms-3 me-3">
          <Col>
          </Col>
        </Row>
        <Row noGutters className="ms-2 me-3 mb-5 d-flex justify-content-center align-items-center">
          <TableCrorisProjects
            leadData={croRisProjects['data']['projects_lead_info']}
            associateData={croRisProjects['data']['projects_associate_info']}/>
        </Row>
      </>
    )
};

export default MyInfo;
