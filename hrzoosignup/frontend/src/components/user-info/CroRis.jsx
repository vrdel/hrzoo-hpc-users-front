import React from 'react';
import { MiniButton } from 'Components/MiniButton';
import { copyToClipboard } from 'Utils/copy-clipboard';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import {FormattedMessage} from 'react-intl';
import { Col, Badge, Placeholder, Row, Table, Label, Spinner } from 'reactstrap';
import { useIntl } from 'react-intl'


const TableCrorisProjects = ({leadData, associateData, changeView=false}) => {
  const intl = useIntl()

  const CrorisTableHead = () => (
    <thead id="hzsi-thead" className="align-middle text-center text-white">
      <tr>
        <th className="fw-normal">
          <FormattedMessage
            defaultMessage="Naziv projekta i CroRIS poveznica"
            description="userinfo-croris-nameurl"
          />
        </th>
        <th className="fw-normal">
          <FormattedMessage
            defaultMessage="Uloga"
            description="userinfo-croris-role"
          />
        </th>
        <th className="fw-normal">
          <FormattedMessage
            defaultMessage="Trajanje"
            description="userinfo-croris-duration"
          />
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
                        <FormattedMessage
                          defaultMessage="voditelj"
                          description="userinfo-croris-badgelead"
                        />
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
                        <FormattedMessage
                          defaultMessage="suradnik"
                          description="userinfo-croris-badgecollab"
                        />
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
            {
              changeView ?
                intl.formatMessage({
                  defaultMessage: "Aktivni projekti registrirani u sustavu CroRIS na kojima korisnik sudjeluje",
                  description: "userinfo-croris-tablefoot-userview"
                })
              :
                intl.formatMessage({
                  defaultMessage: "Aktivni projekti registrirani u sustavu CroRIS na kojima sudjelujete",
                  description: "userinfo-croris-tablefoot-meview"
                })
            }
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
                  {
                    changeView ?
                      intl.formatMessage({
                        defaultMessage: "Nema aktivnih projekata u sustavu CroRIS na kojima korisnik sudjeluje",
                        description: "userinfo-croris-tablefoot-userview-no"
                      })
                    :
                      intl.formatMessage({
                        defaultMessage: "Nema aktivnih projekata u sustavu CroRIS na kojima sudjelujete",
                        description: "userinfo-croris-tablefoot-meview-no"
                      })
                  }
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


export const CroRisInfo = ({croRisProjects, changeView=false}) => {
  return (
    <>
      <Row>
        <Col className="mt-4 ms-3" sm={{size:3}}>
          <Label for="dir" className="fs-5 text-white ps-2 pe-2 pt-1 pb-1" style={{backgroundColor: "#b04c46"}}>
            <FormattedMessage
              defaultMessage="Sustav CroRIS"
              description="userinfo-croris-title"
            />
          </Label>
        </Col>
      </Row>
      <Row>
        <Col className="ms-4" md={{size: 11}}>
          <Table borderless responsive className="text-left">
            <thead>
              <tr>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  <FormattedMessage
                    defaultMessage="Ime"
                    description="userinfo-croris-firstname"
                  />
                </th>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  <FormattedMessage
                    defaultMessage="Prezime"
                    description="userinfo-croris-lastname"
                  />
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
                <td className="font-monospace">
                  {
                    croRisProjects['person_info']['croris_id'] ?
                      croRisProjects['person_info']['croris_id']
                    :
                      '\u2212'
                  }
                </td>
                <td className="font-monospace">
                  {
                    croRisProjects['person_info']['mbz'] ?
                      croRisProjects['person_info']['mbz']
                    :
                      '\u2212'
                  }
                </td>
                <td className="font-monospace">
                  {
                    croRisProjects['person_info']['email'] ?
                      <span className="d-flex align-items-center">
                        { croRisProjects['person_info']['email'] }
                        <MiniButton
                          childClassName="me-3"
                          onClick={(e) => copyToClipboard(
                            e, croRisProjects['person_info']['email'],
                            "Email korisnika kopiran u međuspremnik",
                            "Greška prilikom kopiranja emaila korisnika u međuspremnik",
                            "id-emailuser"
                          )}
                        >
                          <FontAwesomeIcon size="xs" icon={faCopy} />
                        </MiniButton>
                      </span>
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
                  <FormattedMessage
                    defaultMessage="CroRIS poveznica"
                    description="userinfo-croris-url"
                  />
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
          associateData={croRisProjects['projects_associate_info']}
          changeView={changeView}
        />
      </Row>
    </>
  )
}


export const EmptyCroRis = ({changeView=false, spinner=false}) => {
  return (
    <>
      <Row>
        <Col className="mt-4 ms-3" sm={{size:3}}>
          <Label for="dir" className="fs-5 text-white ps-2 pe-2 pt-1 pb-1" style={{backgroundColor: "#b04c46"}}>
            <FormattedMessage
              defaultMessage="Sustav CroRIS"
              description="userinfo-croris-title"
            />
          </Label>
        </Col>
      </Row>
      <Row className="mt-3 mb-3">
        <Col className="d-flex align-items-center justify-content-center shadow-sm bg-light border border-danger rounded text-muted text-center p-3" style={{height: '300px'}} md={{offset: 1, size: 10}}>
          {
            spinner ?
              <Spinner
                style={{
                  height: '15rem',
                  width: '15rem',
                  borderColor: '#b04c46',
                  borderRightColor: 'transparent'
                }}
              />
            :
              changeView ?
                <div className="fs-3">
                  <FormattedMessage
                    defaultMessage="Nema podataka za korisnika u sustavu CroRIS"
                    description="userinfo-croris-nouserdata"
                  />
                </div>
              :
                <div className="fs-3">
                  <FormattedMessage
                    defaultMessage="Nema podataka iz sustava CroRIS"
                    description="userinfo-croris-nodata"
                  />
                </div>
          }
        </Col>
      </Row>
    </>
  )
}
