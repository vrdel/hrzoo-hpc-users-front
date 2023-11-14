import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from './root';
import { Col, Badge, Placeholder, Row, Table, Label, Tooltip } from 'reactstrap';
import { PageTitle } from '../components/PageTitle';
import { AuthContext } from '../components/AuthContextProvider'
import { fetchCroRIS } from '../api/croris';
import { useQuery } from '@tanstack/react-query';
import { faCheckCircle, faStopCircle} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


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
      <Row>
        <Col className="ms-4" md={{size: 11}}>
          <Table borderless responsive className="text-left">
            <thead>
              <tr>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  Ime
                </th>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  Prezime
                </th>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  CroRIS ID
                </th>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  MBZ
                </th>
                <th className="fw-bold fs-5">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {
                    croRisProjects['person_info']['first_name'] ?
                      croRisProjects['person_info']['first_name']
                    :
                      '\u2212'
                  }
                </td>
                <td>
                  {
                    croRisProjects['person_info']['last_name'] ?
                      croRisProjects['person_info']['last_name']
                    :
                      '\u2212'
                  }
                </td>
                <td>
                  {
                    croRisProjects['person_info']['croris_id'] ?
                      croRisProjects['person_info']['croris_id']
                    :
                      '\u2212'
                  }
                </td>
                <td>
                  {
                    croRisProjects['person_info']['croris_mbz'] ?
                      croRisProjects['person_info']['croris_mbz']
                    :
                      '\u2212'
                  }
                </td>
                <td>
                  {
                    croRisProjects['person_info']['email'] ?
                      croRisProjects['person_info']['email']
                    :
                      '\u2212'
                  }
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col className="ms-4" md={{size: 11}}>
          <Table borderless responsive className="text-left">
            <thead>
              <tr>
                <th className="fw-bold fs-5">
                  CroRIS poveznica
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {
                    croRisProjects['person_info']['croris_id'] ?
                      <a href={`https://www.croris.hr/osobe/profil/${croRisProjects['person_info']['croris_id']}/`} target="_blank" style={{'textDecoration': 'none'}} rel="noopener noreferrer">
                        https://www.croris.hr/osobe/profil/{croRisProjects['person_info']['croris_id']}
                      </a>
                    :
                      '\u2212'
                  }
                </td>
              </tr>
            </tbody>
          </Table>
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

const InstituteTableInfo = () => {
  const { userDetails } = useContext(AuthContext);

  const [tooltipOpened, setTooltipOpened] = useState(undefined);
  const showTooltip = (toolid) => {
    let showed = new Object()
    if (tooltipOpened === undefined && toolid) {
      showed[toolid] = true
      setTooltipOpened(showed)
    }
    else {
      showed = JSON.parse(JSON.stringify(tooltipOpened))
      showed[toolid] = !showed[toolid]
      setTooltipOpened(showed)
    }
  }
  const isOpened = (toolid) => {
    if (tooltipOpened !== undefined)
      return tooltipOpened[toolid]
  }

  return (
    <React.Fragment>
      <Row>
        <Col className="d-flex flex-row mt-4 ms-3 align-items-center" sm={{size:3}}>
          <Label for="dir" className="fs-5 text-white ps-2 pe-2 pt-1 pb-1" style={{backgroundColor: "#b04c46"}}>
            Status:
          </Label>
          <div className="fs-5 ps-2 d-flex align-items-center">
            {
              userDetails.status ?
                <>
                  <FontAwesomeIcon id={`Tooltip-${userDetails.first_name}`} className="ms-3 fa-2x me-3" color="#198754" icon={ faCheckCircle } />
                  <Tooltip
                    placement='right'
                    isOpen={isOpened(userDetails.first_name)}
                    target={'Tooltip-' + userDetails.first_name}
                    toggle={() => showTooltip(userDetails.first_name)}
                  >
                    Aktivan<br/>
                    Prijavljeni ste na bar jedan aktivan projekt
                  </Tooltip>
                </>
              :
                <>
                  <FontAwesomeIcon id={`Tooltip-${userDetails.first_name}`} className="ms-3 fa-2x me-3" color="#DC3545" icon={ faStopCircle } />
                  <Tooltip
                    placement='bottom'
                    isOpen={isOpened(userDetails.first_name)}
                    target={'Tooltip-' + userDetails.first_name}
                    toggle={() => showTooltip(userDetails.first_name)}
                  >
                    Neaktivan<br/>
                    Niste prijavljeni ni na jedan aktivan projekt
                  </Tooltip>
                </>
            }
          </div>
        </Col>
      </Row>
      <Row>
        <Col className="mt-4 ms-3" sm={{size:3}}>
          <Label for="dir" className="fs-5 text-white ps-2 pe-2 pt-1 pb-1" style={{backgroundColor: "#b04c46"}}>
            Imenik:
          </Label>
        </Col>
      </Row>
      <Row>
        <Col className="mt-3 ms-4" md={{size: 11}}>
          <Table borderless responsive className="text-left">
            <thead>
              <tr>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  Ime
                </th>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  Prezime
                </th>
                <th className="fw-bold fs-5" style={{width: '30%'}}>
                  Korisnička oznaka
                </th>
                <th className="fw-bold fs-5">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {
                    userDetails.first_name ?
                      userDetails.first_name
                    :
                      '\u2212'
                  }
                </td>
                <td>
                  {
                    userDetails.last_name ?
                      userDetails.last_name
                    :
                      '\u2212'
                  }
                </td>
                <td>
                  {
                    userDetails.person_uniqueid ?
                      userDetails.person_uniqueid
                    :
                      '\u2212'
                  }
                </td>
                <td>
                  {
                    userDetails.person_mail ?
                      userDetails.person_mail
                    :
                      '\u2212'
                  }
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col className="ms-4" md={{size: 11}}>
          <Table borderless responsive className="text-left">
            <thead>
              <tr>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  Povezanost
                </th>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  Naziv ustanove
                </th>
                <th className="fw-bold fs-5" style={{width: '30%'}}>
                </th>
                <th className="fw-bold fs-5" style={{width: '30%'}}>
                  Organizacijska jedinica
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {
                    userDetails.person_affiliation ?
                      userDetails.person_affiliation
                    :
                      '\u2212'
                  }
                </td>
                <td colSpan="2">
                  {
                    userDetails.person_institution ?
                      userDetails.person_institution
                    :
                      '\u2212'
                  }
                </td>
                <td>
                  {
                    userDetails.person_organisation ?
                      userDetails.person_organisation
                    :
                      '\u2212'
                  }
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </React.Fragment>
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
    <thead id="hzsi-thead" className="align-middle text-center text-white">
      <tr>
        <th className="fw-normal">
          Naziv projekta i CroRIS poveznica
        </th>
        <th className="fw-normal">
          Uloga
        </th>
        <th className="fw-normal">
          Trajanje
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
                      <Row className="mt-1">
                        <Col>
                          { project['title'] }
                        </Col>
                      </Row>
                      <Row className="mt-3">
                        <Col>
                          <a className="fw-normal" href={`https://www.croris.hr/projekti/projekt/${project['croris_id']}/`} target="_blank" style={{'textDecoration': 'none'}} rel="noopener noreferrer">
                            https://www.croris.hr/projekti/projekt/{project['croris_id']}
                          </a>
                        </Col>
                      </Row>
                    </td>
                    <td className="p-3 align-middle text-center">
                      <Badge className="fs-6 fw-normal" color="success">
                        voditelj
                      </Badge>
                    </td>
                    <td className="align-middle text-center fs-6 font-monospace">
                      { project['start'] }<br/>{ project['end']}
                    </td>
                  </tr>
                )
              }
              {
                associateData && associateData.map((project, index) =>
                  <tr key={index}>
                    <td className="p-3 fw-bold align-middle text-center">
                      <Row>
                        <Col>
                          { project['title'] }
                        </Col>
                      </Row>
                      <Row className="mt-3">
                        <Col>
                          <a className="fw-normal" href={`https://www.croris.hr/projekti/projekt/${project['croris_id']}/`} target="_blank" style={{'textDecoration': 'none'}} rel="noopener noreferrer">
                            https://www.croris.hr/projekti/projekt/{project['croris_id']}
                          </a>
                        </Col>
                      </Row>
                    </td>
                    <td className="p-3 align-middle text-center">
                      <Badge className="fs-6 fw-normal" color="primary">
                        suradnik
                      </Badge>
                    </td>
                    <td className="align-middle text-center fs-6 font-monospace">
                      { project['start'] }<br/>{ project['end']}
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

      <InstituteTableInfo />

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
