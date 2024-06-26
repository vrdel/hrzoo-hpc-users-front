import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from '../root';
import { Col, Row, Table, Tooltip, Input } from 'reactstrap';
import { useNavigate, Link } from 'react-router-dom';
import { PageTitle } from 'Components/PageTitle';
import { StateIcons, StateString } from 'Config/map-states';
import { fetchAllNrProjects } from 'Api/projects';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCopy,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { convertToEuropean, convertTimeToEuropean } from 'Utils/dates';
import { extractLeaderName } from 'Utils/users_help'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import {
  EmptyTable,
  HZSIPagination,
  TablePaginationHelper,
  buildOptionsStates,
  buildOptionsTypes,
  allProjectTypes,
  allStates
} from 'Components/TableHelpers';
import { CustomReactSelect } from 'Components/CustomReactSelect';
import { defaultUnAuthnRedirect} from 'Config/default-redirect';
import { EmptyTableSpinner } from 'Components/EmptyTableSpinner';
import { copyToClipboard } from 'Utils/copy-clipboard';
import { MiniButton } from 'Components/MiniButton';
import { ProjectTypeBadge } from 'Components/GeneralProjectInfo';
import { useIntl, FormattedMessage } from 'react-intl'
import _ from "lodash";


const ManageRequestsTable = ({ data, pageTitle }) => {
  const [pageSize, setPageSize] = useState(30)
  const [pageIndex, setPageIndex] = useState(0)
  const intl = useIntl()

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

  const { control, setValue } = useForm({
    defaultValues: {
      requests: data,
      searchState: "",
      searchName: "",
      searchIdentifier: "",
      searchLead: "",
      searchType: "",
      searchDate: ""
    }
  })

  useEffect(() => {
    setValue('requests', data)
  }, [data])

  const searchState = useWatch({ control, name: "searchState" })
  const searchNameIdentifierInstitute = useWatch({ control, name: "searchNameIdentifierInstitute" })
  const searchLead = useWatch({ control, name: "searchLead" })
  const searchType = useWatch({ control, name: "searchType" })
  const searchDate = useWatch({ control, name: "searchDate" })

  const { fields } = useFieldArray({ control, name: "requests" })

  let fieldsView = fields

  let paginationHelp = new TablePaginationHelper(fieldsView.length, pageSize, pageIndex)

  if (searchState) {
    if (allStates.includes(searchState.toLowerCase()))
      fieldsView = fieldsView.filter(e => e.state.name.toLowerCase() === searchState.toLowerCase())

    else if (searchState.toLowerCase() === "all")
      fieldsView = fieldsView.filter(e => allStates.includes(e.state.name.toLowerCase()))
  }

  if (searchNameIdentifierInstitute)
    fieldsView = fieldsView.filter(
      (e) => (
        e.name.toLowerCase().includes(searchNameIdentifierInstitute.toLowerCase())
        || e.identifier.toLowerCase().includes(searchNameIdentifierInstitute.toLowerCase())
        || e.institute.toLowerCase().includes(searchNameIdentifierInstitute.toLowerCase())
      )
    )

  if (searchLead)
    fieldsView = fieldsView.filter(e => extractLeaderName(e.userproject_set, true).toLowerCase().includes(searchLead.toLowerCase()))

  if (searchType) {
    if (allProjectTypes.includes(searchType.toLowerCase()))
      fieldsView = fieldsView.filter(e => e.project_type.name.toLowerCase() == searchType.toLowerCase())

    else if (searchType === 'research-eu-croris')
      fieldsView = fieldsView.filter(e => e.project_type.name === 'research-croris' &&
        _.findIndex(e.croris_finance, (fin) => fin.toLowerCase().includes('euro')) > -1)

    else if (searchType.toLowerCase() === "all")
      fieldsView = fieldsView.filter(e => allProjectTypes.includes(e.project_type.name.toLowerCase()))
  }

  if (searchDate)
    fieldsView = fieldsView.filter(e =>
      convertToEuropean(e.date_start).includes(searchDate)
        || convertToEuropean(e.date_end).includes(searchDate))


  const isSearched = (searchState && searchState !== 'all')
    || searchNameIdentifierInstitute || searchLead
    || (searchType && searchType !== 'all') || searchDate

  paginationHelp.searchNum = fieldsView.length
  paginationHelp.isSearched = isSearched

  fieldsView = fieldsView.slice(paginationHelp.start, paginationHelp.end)

  function calcIndex(index) {
    if (!isSearched)
      return fields.length - (pageIndex * pageSize + index + 1) + 1
    else
      return paginationHelp.searchLen - index - (pageIndex * pageSize)
  }

  return (
    <>
      <Row>
        <PageTitle pageTitle={pageTitle}/>
      </Row>
      <Row className="mt-4">
        <Col>
          <Table responsive hover className="shadow-sm">
            <thead id="hzsi-thead" className="align-middle text-center text-white">
              <tr>
                <th className="fw-normal"  style={{width: '52px'}}>
                  #
                </th>
                <th className="fw-normal" style={{width: '92px'}}>
                  <FormattedMessage
                    defaultMessage="Stanje"
                    description="managereq-column-state"
                  />
                </th>
                <th className="fw-normal" style={{width: '100px'}}>
                  <FormattedMessage
                    defaultMessage="Podnesen"
                    description="managereq-column-submitted"
                  />
                </th>
                <th className="fw-normal" style={{width: '714px'}}>
                  <FormattedMessage
                    defaultMessage="Naziv, institucija i šifra"
                    description="managereq-column-nameinstid"
                  />
                </th>
                <th className="fw-normal" style={{width: '158px'}}>
                  <FormattedMessage
                    defaultMessage="Voditelj"
                    description="managereq-column-manager"
                  />
                </th>
                <th className="fw-normal" style={{width: '126px'}}>
                  <FormattedMessage
                    defaultMessage="Tip"
                    description="managereq-column-type"
                  />
                </th>
                <th className="fw-normal" style={{width: '120px'}}>
                  <FormattedMessage
                    defaultMessage="Trajanje"
                    description="managereq-column-duration"
                  />
                </th>
                <th className="fw-normal" style={{width: '88px'}}>
                  <FormattedMessage
                    defaultMessage="Promjena"
                    description="managereq-column-changed"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 align-middle text-center">
                  <FontAwesomeIcon icon={ faSearch } />
                </td>
                <td className="p-2 align-middle text-center" style={{fontSize: '0.83rem'}}>
                  <Controller
                    name="searchState"
                    control={ control }
                    render={ ({ field }) =>
                      <CustomReactSelect
                        forwardedRef={ field.ref }
                        controlWidth="92px"
                        customPadding="0.2rem"
                        placeholder= {intl.formatMessage({
                          defaultMessage: "Odaberi",
                          description: "managereq-placeholder-choose"
                        })}
                        options={ buildOptionsStates(intl) }
                        onChange={ e => setValue("searchState", e.value) }
                      />
                    }
                  />
                </td>
                <td className="p-2 align-middle text-center">{" "}</td>
                <td className="p-2 align-middle text-center">
                  <Controller
                    name="searchNameIdentifierInstitute"
                    control={ control }
                    render={ ({ field }) =>
                      <Input
                        { ...field }
                        placeholder= {intl.formatMessage({
                          defaultMessage: "Traži",
                          description: "managereq-placeholder-search"
                        })}
                        className="form-control"
                        style={{fontSize: '0.83rem'}}
                      />
                    }
                  />
                </td>
                <td className="p-2 align-middle text-center">
                  <Controller
                    name="searchLead"
                    control={ control }
                    render={ ({ field }) =>
                      <Input
                        { ...field }
                        placeholder= {intl.formatMessage({
                          defaultMessage: "Traži",
                          description: "managereq-placeholder-search"
                        })}
                        className="form-control"
                        style={{fontSize: '0.83rem'}}
                      />
                    }
                  />
                </td>
                <td className="p-2 align-middle text-center" style={{fontSize: '0.83rem' }}>
                  <Controller
                    name="searchType"
                    control={ control }
                    render={ ({ field }) =>
                      <CustomReactSelect
                        forwardedRef={ field.ref }
                        controlWidth="126px"
                        placeholder= {intl.formatMessage({
                          defaultMessage: "Odaberi",
                          description: "managereq-placeholder-choose"
                        })}
                        customPadding="0.2rem"
                        options={ buildOptionsTypes(intl) }
                        onChange={ e => setValue("searchType", e.value) }
                      />
                    }
                  />
                </td>
                <td className="p-2 align-middle text-center" style={{fontSize: '0.83rem' }}>
                  <Controller
                    name="searchDate"
                    control={ control }
                    render={ ({ field }) =>
                      <Input
                        { ...field }
                        placeholder= {intl.formatMessage({
                          defaultMessage: "Traži",
                          description: "managereq-placeholder-search"
                        })}
                        className="form-control"
                        style={{fontSize: '0.83rem'}}
                      />
                    }
                  />
                </td>
                <td className="p-2 align-middle text-center">{" "}</td>
              </tr>
              {
                fieldsView.length > 0 ?
                  fieldsView.map((project, index) =>
                    <tr key={index}>
                      <td className="p-3 align-middle text-center">
                        { calcIndex(index) }
                      </td>
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
                      <td className="p-3 align-middle text-info fw-bold text-center">
                        <Row>
                          <Col>
                            <Link className="text-dark" to={encodeURIComponent(project.identifier)}>
                              { project.name}
                            </Link>
                          </Col>
                        </Row>
                        <Row className="pt-1">
                          <Col className="fw-medium fst-italic text-dark">
                            <small>{ project.institute }</small>
                          </Col>
                        </Row>
                        <Row style={{height: '12px'}}>
                        </Row>
                        <Row>
                          <Col className="d-flex justify-content-center align-items-center align-self-center">
                            <span className="fw-normal badge bg-secondary">
                              { project.identifier }
                            </span>
                            <MiniButton
                              color="light"
                              onClick={(e) => copyToClipboard(
                                e, project.identifier,
                                intl.formatMessage({
                                  defaultMessage: "Šifra zahtjeva kopirana u međuspremnik",
                                  description: "managereq-minibutton-title"
                                }),
                                intl.formatMessage({
                                  defaultMessage: "Greška prilikom kopiranja šifre zahtjeva u međuspremnik",
                                  description: "managereq-minibutton-msg"
                                }),
                                "id-request"
                              )}
                            >
                              <FontAwesomeIcon size="xs" icon={faCopy} />
                            </MiniButton>
                          </Col>
                        </Row>
                      </td>
                      <td className="p-3 align-middle text-center">
                        <Link rel="noopener noreferrer" className="text-dark"
                          to={`/ui/users/${extractLeaderName(project.userproject_set).user.status ? '' : 'inactive/'}${extractLeaderName(project.userproject_set).user.username}`}>
                          { extractLeaderName(project.userproject_set, true) }
                        </Link>
                      </td>
                      <td className="align-middle text-center">
                        <ProjectTypeBadge projectInfo={project} />
                      </td>
                      <td className="align-middle text-center fs-6 font-monospace">
                        { convertToEuropean(project.date_start) }
                        <br/>
                        { convertToEuropean(project.date_end) }
                      </td>
                      <td className="align-middle text-center fs-6 font-monospace">
                        {
                          project.date_changed ?
                            <>
                              {
                                project.date_changed && convertToEuropean(project.date_changed)
                              }
                              <br/>
                              {
                                project.date_changed && convertTimeToEuropean(project.date_changed)
                              }
                            </>
                          :
                            '\u2212'
                        }
                      </td>
                    </tr>
                  )
                :
                  data.length > 0 && isSearched ?
                    <EmptyTable colspan="9" msg={intl.formatMessage({
                      defaultMessage: "Nijedan zahtjev ne zadovoljava pretragu",
                      description: "managereq-emptytable-msg-1"
                    })} />
                  :
                    <EmptyTable colspan="9" msg={intl.formatMessage({
                      defaultMessage: "Nema podnesenih zahtjeva",
                      description: "managereq-emptytable-msg-2"
                    })} />
              }
            </tbody>
          </Table>
        </Col>
      </Row>
      <HZSIPagination
        pageIndex={ pageIndex }
        pageSize={ pageSize }
        setPageIndex={ setPageIndex }
        setPageSize={ setPageSize }
        pageCount={ paginationHelp.pageCount }
        start={ paginationHelp.start }
        choices={ paginationHelp.choices }
        resource_name={intl.formatMessage({
          defaultMessage: "zahtjeva",
          description: "managereq-pagination"
        })}
      />
    </>
  )
}


export const ManageRequestsList = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const intl = useIntl()
  const navigate = useNavigate()

  const { status, error, data: nrProjects } = useQuery({
      queryKey: ['all-projects'],
      queryFn: fetchAllNrProjects
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname, intl))
    if (status === 'error' && error.message.includes('403'))
      navigate(defaultUnAuthnRedirect)
  }, [location.pathname, status, intl])


  if (status === 'success' && nrProjects && pageTitle)
    return (
      <ManageRequestsTable
        data={ nrProjects }
        pageTitle={ pageTitle }
      />
    )
  else if (status === 'loading' && pageTitle)
    return (
      <EmptyTableSpinner pageTitle={pageTitle} colSpan={8}>
        <thead id="hzsi-thead" className="align-middle text-center text-white">
          <tr>
            <th className="fw-normal"  style={{width: '52px'}}>
              #
            </th>
            <th className="fw-normal" style={{width: '92px'}}>
              <FormattedMessage
                defaultMessage="Stanje"
                description="managereq-column-state"
              />
            </th>
            <th className="fw-normal" style={{width: '100px'}}>
              <FormattedMessage
                defaultMessage="Podnesen"
                description="managereq-column-submitted"
              />
            </th>
            <th className="fw-normal" style={{width: '714px'}}>
              <FormattedMessage
                defaultMessage="Naziv, institucija i šifra"
                description="managereq-column-nameinstid"
              />
            </th>
            <th className="fw-normal" style={{width: '158px'}}>
              <FormattedMessage
                defaultMessage="Voditelj"
                description="managereq-column-manager"
              />
            </th>
            <th className="fw-normal" style={{width: '126px'}}>
              <FormattedMessage
                defaultMessage="Tip"
                description="managereq-column-type"
              />
            </th>
            <th className="fw-normal" style={{width: '120px'}}>
              <FormattedMessage
                defaultMessage="Trajanje"
                description="managereq-column-duration"
              />
            </th>
            <th className="fw-normal" style={{width: '88px'}}>
              <FormattedMessage
                defaultMessage="Promjena"
                description="managereq-column-changed"
              />
            </th>
          </tr>
        </thead>
      </EmptyTableSpinner>
    )
};
