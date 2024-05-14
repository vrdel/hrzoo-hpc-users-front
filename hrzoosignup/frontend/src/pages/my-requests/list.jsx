import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from '../root';
import { PageTitle } from 'Components/PageTitle';
import 'Styles/content.css';
import {
  Button,
  Badge,
  Col,
  Placeholder,
  Row,
  Table,
  Tooltip,
} from 'reactstrap';
import { fetchNrProjectsLead } from 'Api/projects';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { convertToEuropean, convertTimeToEuropean } from 'Utils/dates';
import { StateIcons, StateString } from 'Config/map-states';
import { TypeString, TypeColor } from 'Config/map-projecttypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { defaultUnAuthnRedirect} from 'Config/default-redirect';
import { useIntl } from 'react-intl'
import { EmptyTableSpinner } from 'Components/EmptyTableSpinner';


const MyRequestsList = () => {
  const { LinkTitles } = useContext(SharedData)
  const [pageTitle, setPageTitle] = useState(undefined)
  const navigate = useNavigate()
  const intl = useIntl()

  const {status, data: nrProjects, error} = useQuery({
      queryKey: ['projects-lead'],
      queryFn: fetchNrProjectsLead
  })

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

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname, intl))
    if (status === 'error' && error.message.includes('403'))
      navigate(defaultUnAuthnRedirect)
  }, [location.pathname, status, intl])

  if (status === 'loading' && pageTitle)
    return (
      <EmptyTableSpinner pageTitle={pageTitle} colSpan={7}>
        <thead id="hzsi-thead" className="align-middle text-center text-white">
          <tr>
            <th className="fw-normal">
              Stanje
            </th>
            <th className="fw-normal">
              Podnesen
            </th>
            <th className="fw-normal">
              Naziv
            </th>
            <th className="fw-normal">
              Šifra
            </th>
            <th className="fw-normal">
              Tip
            </th>
            <th className="fw-normal">
              Trajanje
            </th>
            <th className="fw-normal">
              Radnje
            </th>
          </tr>
        </thead>
      </EmptyTableSpinner>

    )
  else if (nrProjects?.length > 0 && pageTitle)
    return (
      <>
        <Row>
          <PageTitle pageTitle={pageTitle}/>
        </Row>
        <Row className="mt-4 ms-1 me-1 mb-5">
          <Col>
            <Table responsive hover className="shadow-sm">
              <thead id="hzsi-thead" className="align-middle text-center text-white">
                <tr>
                  <th className="fw-normal">
                    Stanje
                  </th>
                  <th className="fw-normal">
                    Podnesen
                  </th>
                  <th className="fw-normal">
                    Naziv
                  </th>
                  <th className="fw-normal">
                    Šifra
                  </th>
                  <th className="fw-normal">
                    Tip
                  </th>
                  <th className="fw-normal">
                    Trajanje
                  </th>
                  <th className="fw-normal">
                    Radnje
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  nrProjects.map((project, index) =>
                    <tr key={index}>
                      <td className="p-3 align-middle text-center" id={'Tooltip-' + index}>
                        { StateIcons(project.state.name) }
                        <Tooltip
                          placement='top'
                          isOpen={isOpened(project.identifier)}
                          target={'Tooltip-' + index}
                          toggle={() => showTooltip(project.identifier)}
                        >
                          { StateString(project.state.name) }
                        </Tooltip>
                      </td>
                      <td className="align-middle text-center fs-6 font-monospace">
                        { convertToEuropean(project.date_submitted) }
                        <br/>
                        { convertTimeToEuropean(project.date_submitted) }
                      </td>
                      <td className="p-3 align-middle fw-bold text-center">
                        <Link className="text-dark" to={encodeURIComponent(project.identifier)}>
                          { project.name}
                        </Link>
                      </td>
                      <td className="p-3 align-middle text-center">
                        <Badge className="fw-normal" color="secondary">{ project.identifier }</Badge>
                      </td>
                      <td className="align-middle text-center">
                        <span className={`badge fw-normal ${TypeColor(project.project_type.name)}`} >
                          { TypeString(project.project_type.name) }
                        </span>
                      </td>
                      <td className="align-middle text-center fs-6 font-monospace">
                        <Row>
                          <Col>
                            { convertToEuropean(project.date_start) }
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            { convertToEuropean(project.date_end)}
                          </Col>
                        </Row>
                      </td>
                      <td className="align-middle text-center">
                        <Button color="light" onClick={() => navigate(encodeURIComponent(project.identifier))}>
                          <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </Button>
                      </td>
                    </tr>
                  )
                }
                {
                  nrProjects.length < 5 && [...Array(5 - nrProjects.length)].map((_, i) =>
                    <tr key={i + 5}>
                      <td colSpan="7" style={{height: '60px', minHeight: '60px'}}>
                      </td>
                    </tr>
                  )
                }
              </tbody>
            </Table>
          </Col>
        </Row>
      </>
    )
  else if (nrProjects?.length === 0 && pageTitle)
    return (
      <>
        <Row>
          <PageTitle pageTitle={pageTitle}/>
        </Row>
        <Row className="mt-4 ms-1 me-1 mb-5">
          <Col>
            <Table responsive hover className="shadow-sm">
              <thead id="hzsi-thead" className="align-middle text-center text-white">
                <tr>
                  <th className="fw-normal">
                    Stanje
                  </th>
                  <th className="fw-normal">
                    Tip
                  </th>
                  <th className="fw-normal">
                    Šifra
                  </th>
                  <th className="fw-normal">
                    Naziv
                  </th>
                  <th className="fw-normal">
                    Trajanje
                  </th>
                  <th className="fw-normal">
                    Podnesen
                  </th>
                  <th className="fw-normal">
                    Radnje
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="7" className="m-0 p-0 bg-light border-0">
                        <Placeholder size="lg" xs={12} style={{height: '40px', backgroundColor: "rgba(255, 255, 255, 0)"}}/>
                      </td>
                    </tr>
                  ))
                }
                <tr key="4">
                  <td colSpan="7" className="table-light border-0 text-muted text-center p-3 fs-3">
                    Nemate podnesenih zahtjeva
                  </td>
                </tr>
                {
                  [...Array(3)].map((_, i) => (
                    <tr key={i + 6}>
                      <td colSpan="7" className="m-0 p-0 bg-light border-0">
                        <Placeholder size="lg" xs={12} style={{height: '40px', backgroundColor: "rgba(255, 255, 255, 0)"}}/>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </Table>
          </Col>
        </Row>
      </>
    )
};

export default MyRequestsList;
