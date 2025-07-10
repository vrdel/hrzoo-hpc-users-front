import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from '../root';
import { PageTitle } from 'Components/PageTitle';
import 'Styles/content.css';
import { useNavigate, Link } from 'react-router-dom';
import { fetchNrProjects, fetchExtendProject } from 'Api/projects';
import { url_ui_prefix } from 'Config/general';
import { useQuery } from '@tanstack/react-query';
import { EmptyTableSpinner } from 'Components/EmptyTableSpinner';
import { useIntl, FormattedMessage } from 'react-intl';
import {
  Badge,
  Col,
  Row,
  Table,
  Tooltip,
} from 'reactstrap';
import { StateIcons, StateString } from 'Config/map-states';
import { convertToEuropean, convertTimeToEuropean } from 'Utils/dates';
import { MiniButton } from 'Components/MiniButton';
import { copyToClipboard } from 'Utils/copy-clipboard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { TypeString, TypeColor } from 'Config/map-projecttypes';
import { isExtended, lastExtension } from 'Utils/project-extends';
import _ from "lodash";


const MembershipsList = () => {
  const { LinkTitles } = useContext(SharedData)
  const navigate = useNavigate()
  const intl = useIntl()

  const [ pageTitle, setPageTitle ] = useState(undefined)
  const [ tooltipOpen, setTooltipOpen ] = useState(undefined)

  const { status, data: projects } = useQuery({
      queryKey: ['projects'],
      queryFn: fetchNrProjects
  })

  const {status: statusPE, data: projectsExtends} = useQuery({
      queryKey: ['projectsextends-lead'],
      queryFn: fetchExtendProject
  })

  const showTooltip = (toolId) => {
    let show = new Object()
    if (tooltipOpen === undefined && toolId) {
      show[toolId] = true
      setTooltipOpen(show)
    } else {
      show = JSON.parse(JSON.stringify(tooltipOpen))
      show[toolId] = !show[toolId]
      setTooltipOpen(show)
    }
  }

  const isOpen = (toolId) => {
    if (tooltipOpen !== undefined)
      return tooltipOpen[toolId]
  }

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname, intl))

    if (status === "success" && statusPE === "success") {
      navigate(url_ui_prefix + "/memberships")
    }
  }, [location.pathname, status, statusPE, url_ui_prefix, intl])

  if (status === "loading" && pageTitle)
    return (
      <EmptyTableSpinner pageTitle={ pageTitle } colSpan={6}>
        <thead id="hzsi-thead" className="align-middle text-center text-white">
          <tr>
            <th className="fw-normal">
              <FormattedMessage
                defaultMessage="Stanje"
                description="myreq-list-state"
              />
            </th>
            <th className="fw-normal">
              <FormattedMessage
                defaultMessage="Podnesen"
                description="myreq-list-submitted"
              />
            </th>
            <th className="fw-normal">
              <FormattedMessage
                defaultMessage="Naziv"
                description="myreq-list-name"
              />
            </th>
            <th className="fw-normal">
              <FormattedMessage
                defaultMessage="Šifra"
                description="myreq-list-identifier"
              />
            </th>
            <th className="fw-normal">
              <FormattedMessage
                defaultMessage="Tip"
                description="myreq-list-type"
              />
            </th>
            <th className="fw-normal">
              <FormattedMessage
                defaultMessage="Trajanje"
                description="myreq-list-duration"
              />
            </th>
          </tr>
        </thead>
      </EmptyTableSpinner>
    ) 
  else if (status === "success" && statusPE === "success" && pageTitle) {
    let projectsApproved = projects.filter(project => 
      project.state.name !== "deny" && project.state.name !== "submit"
    )

    return (
      <>
        <Row>
          <PageTitle pageTitle={ pageTitle }/>
        </Row>
        <Row className="mt-4 ms-1 me-1 mb-5">
          <Col>
            <Table responsive hover className="shadow-sm">
              <thead id="hzsi-thead" className="align-middle text-center text-white">
                <tr>
                  <th className="fw-normal">
                    <FormattedMessage
                      defaultMessage="Stanje"
                      description="myreq-list-state"
                    />
                  </th>
                  <th className="fw-normal">
                    <FormattedMessage
                      defaultMessage="Podnesen"
                      description="myreq-list-submitted"
                    />
                  </th>
                  <th className="fw-normal">
                    <FormattedMessage
                      defaultMessage="Naziv i dodijeljeni resursi"
                      description="myreq-list-name"
                    />
                  </th>
                  <th className="fw-normal">
                    <FormattedMessage
                      defaultMessage="Šifra"
                      description="myreq-list-identifier"
                    />
                  </th>
                  <th className="fw-normal">
                    <FormattedMessage
                      defaultMessage="Tip"
                      description="myreq-list-type"
                    />
                  </th>
                  <th className="fw-normal">
                    <FormattedMessage
                      defaultMessage="Trajanje"
                      description="myreq-list-duration"
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  projectsApproved.map((project, index) =>
                    <tr key={index}>
                      <td className="p-3 align-middle text-center" id={'Tooltip-' + index}>
                        { StateIcons(project.state.name) }
                        <Tooltip
                          placement='top'
                          isOpen={isOpen(project.identifier)}
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
                          { project.name }
                        </Link>
                        {
                          project.staff_resources_type?.length > 0 &&
                          <Row className="g-0 d-flex justify-content-center mt-2">
                            <Col className="d-flex justify-content-center align-items-center align-self-center">
                              {
                                project.staff_resources_type.map((rtype, i) =>
                                  <span className="ms-2 p-1 fw-normal" key={i}
                                    style={{
                                      backgroundColor: '#feb272',
                                      color: '#303030',
                                      borderRadius: '2px',
                                      fontSize: '0.83rem'
                                    }}>
                                    { rtype.value }
                                  </span>)
                              }
                            </Col>
                          </Row>
                        }
                      </td>
                      <td className="p-3 align-middle text-center">
                        <Row className="g-0">
                          <Col className="d-flex justify-content-center align-items-center align-self-center">
                            <Badge className="fw-normal" color="secondary">{ project.identifier }</Badge>
                            <MiniButton
                              color="light"
                              onClick={(e) => copyToClipboard(
                                e, project.identifier,
                                intl.formatMessage({
                                  defaultMessage: "Šifra projekta kopirana u međuspremnik",
                                  description: "userlist-minibutton-title-4"
                                }),
                                intl.formatMessage({
                                  defaultMessage: "Greška prilikom kopiranja šifre projekta u međuspremnik",
                                  description: "userlist-minibutton-msg-4"
                                }),
                                "id-request"
                              )}
                            >
                              <FontAwesomeIcon size="xs" icon={faCopy} />
                            </MiniButton>
                          </Col>
                        </Row>
                      </td>
                      <td className="align-middle text-center">
                        <span className={`badge fw-normal position-relative ${TypeColor(project.project_type.name)}`} >
                          { TypeString(project.project_type.name) }
                          {
                            _.findIndex(project.croris_finance, (fin) => fin.name?.toLowerCase().includes('euro')) > -1 &&
                            <span className="position-absolute fw-normal top-100 start-100 translate-middle badge rounded-pill bg-danger">
                              EU
                              <span className="visually-hidden">EU</span>
                            </span>
                          }
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
                        {
                          isExtended(project.id, projectsExtends) &&
                            <Row>
                              <Col className="text-success">
                                <strong>
                                  { convertToEuropean(lastExtension(project.id, projectsExtends)) }
                                </strong>
                              </Col>
                            </Row>
                        }
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
  }
};


export default MembershipsList;