import React, { useContext, useEffect, useState } from "react";
import { SharedData } from "Pages/root";
import { useQuery } from "@tanstack/react-query";
import { fetchAllNrProjects } from "Api/projects";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  TablePaginationHelper,
  optionsStatesProjects,
  optionsTypes,
  allProjectTypes,
  allStates,
  EmptyTable,
  HZSIPagination
} from "Components/TableHelpers";
import { convertToEuropean } from "Utils/dates";
import { Badge, Col, Input, Row, Table, Popover, PopoverHeader, PopoverBody } from "reactstrap";
import { PageTitle } from "Components/PageTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCopy, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { CustomReactSelect } from "Components/CustomReactSelect";
import { TypeColor, TypeString } from "Config/map-projecttypes";
import { extractCollaborators, extractLeaderName } from "Utils/users_help";
import { StateIcons } from "Config/map-states";
import { useNavigate, Link } from "react-router-dom";
import { defaultUnAuthnRedirect } from 'Config/default-redirect';
import { EmptyTableSpinner } from 'Components/EmptyTableSpinner';
import { copyToClipboard } from 'Utils/copy-clipboard';
import { MiniButton } from 'Components/MiniButton';
import { fetchSpecificUser } from "Api/users";
import _ from "lodash";


const LeadUserBadge = ({index, project, isOpened, showPopover}) => {
  let targetUser = extractLeaderName(project.userproject_set).user

  return (
    <Badge
      key={`${index}-l`}
      color="dark"
      id={`pop-lead-${index}-${targetUser.id}`}
      className="fw-normal ms-1 text-decoration-underline"
      style={{cursor: 'pointer'}}
    >
      {`${targetUser.first_name} ${targetUser.last_name}`}
      <Popover
        placement="left"
        isOpen={isOpened(`${index}-${targetUser.id}`)}
        target={`pop-lead-${index}-${targetUser.id}`}
        toggle={() => {
          showPopover(`${index}-${targetUser.id}`)
        }}
      >
        <PopoverUserInfo
          rhfId={`${index}-${targetUser.id}`}
          userName={targetUser.username}
          showPopover={showPopover}
        />
      </Popover>
    </Badge>
  )
}


const PopoverUserInfo = ({rhfId, userName, showPopover}) => {
  const {status, data: userData, error} = useQuery({
      queryKey: ['change-user', userName],
      queryFn: () => fetchSpecificUser(userName),
  })

  if (status === 'success' && userData) {
    return (
      <>
        <PopoverHeader className="d-flex align-items-center font-monospace justify-content-between">
          { userName }
        </PopoverHeader>
        <PopoverBody>
          <Row>
            <Col className="fw-bold">
              Ime i prezime
            </Col>
          </Row>
          <Row>
            <Col className="ms-2 me-2 fs-6 fst-italic">
              {`${userData.first_name} ${userData.last_name}`}
            </Col>
          </Row>
          <Row className="mt-2">
            <Col className="fw-bold">
              Ustanova
            </Col>
          </Row>
          <Row>
            <Col className="ms-2 me-2 fs-6 fst-italic">
              {`${userData.person_institution}`}<br/>
              <small>{`${userData.person_affiliation}`}</small>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col className="fw-bold">
              Email
            </Col>
          </Row>
          <Row>
            <Col className="d-flex font-monospace align-items-center ms-2 me-2 fs-6 fst-italic">
              {`${userData.person_mail}`}
              <MiniButton
                childClassName="me-3"
                onClick={(e) => copyToClipboard(
                  e, userData.person_mail,
                  "Email korisnika kopiran u međuspremnik",
                  "Greška prilikom kopiranja emaila korisnika u međuspremnik",
                  "id-emailuser"
                )}
              >
                <FontAwesomeIcon size="xs" icon={faCopy} />
              </MiniButton>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col className="d-flex justify-content-center align-items-center align-self-center">
              <a className="btn btn-primary btn-sm"
                target="_blank"
                style={{'textDecoration': 'none'}}
                rel="noopener noreferrer"
                role="button"
                onClick={() => showPopover(rhfId)}
                href={`/ui/korisnici/${userData.username}`}
              >
                <FontAwesomeIcon icon={faArrowRight}/>{' '}
                Detalji korisnika
              </a>
            </Col>
          </Row>
        </PopoverBody>
      </>
    )
  }
  else
    return null
}


const ProjectsListForm = ({ data, pageTitle }) => {
  const [pageSize, setPageSize] = useState(30)
  const [pageIndex, setPageIndex] = useState(0)
  const { ResourceTypesToSelect } = useContext(SharedData)

  const { control, setValue } = useForm({
    defaultValues: {
      projects: data,
      searchNameIdentifiterInstitute: "",
      searchType: "",
      searchDate: "",
      searchUsers: "",
      searchState: "",
      searchResourceTypes: ""
    }
  })

  const [popoverOpened, setPopoverOpened] = useState(undefined);
  const showPopover = (popid) => {
    let showed = new Object()
    if (popoverOpened === undefined && popid) {
      showed[popid] = true
      setPopoverOpened(showed)
    }
    else {
      showed = JSON.parse(JSON.stringify(popoverOpened))
      showed[popid] = !showed[popid]
      setPopoverOpened(showed)
    }
  }
  const isOpened = (toolid) => {
    if (popoverOpened !== undefined)
      return popoverOpened[toolid]
  }

  useEffect(() => {
    setValue('projects', data)
  }, [data])

  const searchNameIdentifiterInstitute = useWatch({ control, name: "searchNameIdentifiterInstitute" })
  const searchType = useWatch({ control, name: "searchType" })
  const searchDate = useWatch({ control, name: "searchDate" })
  const searchUsers = useWatch({ control, name: "searchUsers" })
  const searchState = useWatch({ control, name: "searchState" })
  const searchResourceTypes = useWatch({ control, name: "searchResourceTypes"})

  const { fields } = useFieldArray({ control, name: "projects" })

  let fieldsView = fields

  let paginationHelp = new TablePaginationHelper(fieldsView.length, pageSize, pageIndex)

  if (searchNameIdentifiterInstitute)
    fieldsView = fieldsView.filter(
      (e) => (
        e.name.toLowerCase().includes(searchNameIdentifiterInstitute.toLowerCase())
        || e.identifier.toLowerCase().includes(searchNameIdentifiterInstitute.toLowerCase())
        || e.institute.toLowerCase().includes(searchNameIdentifiterInstitute.toLowerCase())
      )
    )

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

  if (searchUsers) {
    fieldsView = fieldsView.filter(e =>
      [extractLeaderName(e.userproject_set, true), ...extractCollaborators(e.userproject_set, true)].map(user => user.toLowerCase()).join(",").includes(searchUsers.toLowerCase())
    )
  }

  if (searchState) {
    if (allStates.includes(searchState.toLowerCase()))
      fieldsView = fieldsView.filter(e => e.state.name.toLowerCase() === searchState.toLowerCase())

    else if (searchState.toLowerCase() === "all")
      fieldsView = fieldsView.filter(e => allStates.includes(e.state.name.toLowerCase()))
  }

  if (searchResourceTypes.length > 0) {
    let targetResource = searchResourceTypes.map(element => element.value)
    fieldsView = fieldsView.filter(e =>
      {
        let projectResources = e.staff_resources_type.map(element => element.value)
        for (var resource of projectResources)
          if (targetResource.indexOf(resource) !== -1)
              return e
      }
    )
  }

  const isSearched = searchNameIdentifiterInstitute || (searchType && searchType !== 'all')
    || searchDate || searchResourceTypes.length > 0 || searchUsers || (searchState && searchState !== 'all')

  paginationHelp.searchNum = fieldsView.length
  paginationHelp.isSearched = isSearched

  fieldsView = fieldsView.slice(paginationHelp.start, paginationHelp.end)

  function calcIndex(index) {
    if (!isSearched)
      return fields.length - (pageIndex * pageSize + index)
    else
      return paginationHelp.searchLen - index - (pageIndex * pageSize)
  }

  return (
    <>
      <Row>
        <PageTitle pageTitle={ pageTitle } />
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
                  Stanje
                </th>
                <th className="fw-normal" style={{width: '650px'}}>
                  Naziv, institucija, šifra i dodijeljeni resursi
                </th>
                <th className="fw-normal" style={{width: '126px'}}>
                  Tip
                </th>
                <th className="fw-normal" style={{width: '120px'}}>
                  Trajanje
                </th>
                <th className="fw-normal" style={{width: '380px'}}>
                  Osobe
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 align-middle text-center">
                  <FontAwesomeIcon icon={ faSearch } />
                </td>
                <td className="p-2 align-middle text-center" style={{ fontSize: "0.83rem" }}>
                  <Controller
                    name="searchState"
                    control={ control }
                    render={ ({ field }) =>
                      <CustomReactSelect
                        forwardedRef={ field.ref }
                        controlWidth="92px"
                        placeholder="Odaberi"
                        customPadding="0.2rem"
                        options={ optionsStatesProjects }
                        onChange={ e => setValue("searchState", e.value) }
                      />
                    }
                  />
                </td>
                <td className="p-2 align-middle text-center" style={{ fontSize: "0.83rem" }}>
                  <Row className="g-0 d-flex align-items-center">
                    <Col sm={{size: 7}}>
                      <Controller
                        name="searchNameIdentifiterInstitute"
                        control={ control }
                        render={ ({ field }) =>
                          <Input
                            { ...field }
                            placeholder="Traži"
                            className="form-control"
                            style={{ fontSize: "0.83rem" }}
                          />
                        }
                      />
                    </Col>
                    <Col sm={{size: 5}} className="ps-1">
                      <Controller
                        name="searchResourceTypes"
                        control={ control }
                        render={ ({ field }) =>
                          <CustomReactSelect
                            forwardedRef={ field.ref }
                            customPadding="0.2rem"
                            placeholder="Resursi"
                            isMulti={true}
                            fontSize="0.83rem"
                            closeMenuOnSelect={false}
                            resourceTypeMultiValue={true}
                            isClearable={false}
                            options={ResourceTypesToSelect}
                            onChange={ e => setValue("searchResourceTypes", e) }
                          />
                        }
                      />
                    </Col>
                  </Row>
                </td>
                <td className="p-2 align-middle text-center" style={{ fontSize: "0.83rem" }}>
                  <Controller
                    name="searchType"
                    control={ control }
                    render={ ({ field }) =>
                      <CustomReactSelect
                        forwardedRef={ field.ref }
                        controlWidth="126px"
                        customPadding="0.2rem"
                        placeholder="Odaberi"
                        options={ optionsTypes }
                        onChange={ e => setValue("searchType", e.value) }
                      />
                    }
                  />
                </td>
                <td className="p-2 align-middle text-center">
                  <Controller
                    name="searchDate"
                    control={ control }
                    render={ ({ field }) =>
                      <Input
                        { ...field }
                        placeholder="Traži"
                        className="form-control"
                        style={{ fontSize: "0.83rem" }}
                      />
                    }
                  />
                </td>
                <td className="p-2 align-middle text-center">
                  <Controller
                    name="searchUsers"
                    control={ control }
                    render={ ({ field }) =>
                      <Input
                        { ...field }
                        placeholder="Traži"
                        className="form-control"
                        style={{ fontSize: "0.83rem" }}
                      />
                    }
                  />
                </td>
              </tr>
              {
                fieldsView.length > 0 ?
                  fieldsView.map((project, index) =>
                    <tr key={ index }>
                      <td className="p-3 align-middle text-center">
                        { calcIndex(index) }
                      </td>
                      <td className="p-3 align-middle text-center">
                        { StateIcons(project.state.name) }
                      </td>
                      <td className="p-3 align-middle fw-bold text-center">
                        <Row>
                          <Col>
                            <Link className="text-dark" to={encodeURIComponent(project.identifier)}>
                              { project.name}
                            </Link>
                          </Col>
                        </Row>
                        <Row className="pt-1">
                          <Col className="fw-medium fst-italic">
                            <small>{ project.institute }</small>
                          </Col>
                        </Row>
                        <Row style={{height: '12px'}}>
                        </Row>
                        <Row className="g-0 d-flex justify-content-center">
                          <Col className="d-flex justify-content-center align-items-center align-self-center">
                            <Badge color="secondary" className="fw-normal">
                              { project.identifier }
                            </Badge>
                            <MiniButton
                              childClassName="me-3"
                              onClick={(e) => copyToClipboard(
                                e, project.identifier,
                                "Šifra projekta kopirana u međuspremnik",
                                "Greška prilikom kopiranja šifre projekta u međuspremnik",
                                "id-uid"
                              )}
                            >
                              <FontAwesomeIcon size="xs" icon={faCopy} />
                            </MiniButton>
                            {
                              project.staff_resources_type.map((rtype, i) =>
                                <span className="ms-1 p-1 fw-normal" key={i}
                                  style={{
                                    backgroundColor: '#feb272',
                                    color: '#303030',
                                    borderRadius: '2px',
                                    fontSize: '0.83rem'
                                  }}>
                                  {rtype.value}
                                </span>)
                            }
                          </Col>
                        </Row>
                      </td>
                      <td className="align-middle text-center">
                        <span className={ `badge fw-normal position-relative ${TypeColor(project.project_type.name)}` }>
                          { TypeString(project.project_type.name) }
                          {
                            _.findIndex(project.croris_finance, (fin) => fin.toLowerCase().includes('euro')) > -1 &&
                            <span className="position-absolute fw-normal top-100 start-100 translate-middle badge rounded-pill bg-danger">
                              EU
                              <span className="visually-hidden">EU</span>
                            </span>
                          }
                        </span>
                      </td>
                      <td className="align-middle text-center fs-6 font-monospace">
                        { convertToEuropean(project.date_start) }
                        <br/>
                        { convertToEuropean(project.date_end) }
                      </td>
                      <td className="align-middle text-center">
                        <LeadUserBadge
                          index={index}
                          project={project}
                          isOpened={isOpened}
                          showPopover={showPopover}
                        />
                        {
                          extractCollaborators(project.userproject_set).map((collab, cid) =>
                            <Badge
                              key={`${index}-c${cid}`}
                              color="secondary"
                              id={`pop-collab-${index}-${collab.user.id}`}
                              className="fw-normal ms-1 text-decoration-underline"
                              style={{cursor: 'pointer'}}
                            >
                              {`${collab.user.first_name} ${collab.user.last_name}`}
                              <Popover
                                placement="left"
                                isOpen={isOpened(`${index}-${collab.user.id}`)}
                                target={`pop-collab-${index}-${collab.user.id}`}
                                toggle={() => {
                                  showPopover(`${index}-${collab.user.id}`)
                                }}
                              >
                                <PopoverUserInfo
                                  rhfId={`${index}-${collab.user.id}`}
                                  userName={collab.user.username}
                                  showPopover={showPopover}
                                />
                              </Popover>
                            </Badge>
                          )
                        }
                      </td>
                    </tr>
                  )
                :
                  data.length > 0 && isSearched ?
                    <EmptyTable colspan="7" msg="Nijedan projekt ne zadovoljava pretragu" />
                  :
                    <EmptyTable colspan="7" msg="Nema aktivnih projekata" />
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
        resource_name="projekata"
      />
    </>
  )
}


export const ProjectsList = () => {
  const { LinkTitles } = useContext(SharedData)
  const [pageTitle, setPageTitle] = useState(undefined)
  const navigate = useNavigate()

  const { status, error, data } = useQuery({
    queryKey: ["all-projects"],
    queryFn: fetchAllNrProjects
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
    if (status === 'error' && error.message.includes('403'))
      navigate(defaultUnAuthnRedirect)
  }, [location.pathname, status])


  if (status === 'success' && data && pageTitle)
    return (
      <ProjectsListForm
        data={ data.filter(e => ["approve", "extend", "expire"].includes(e.state.name.toLowerCase())) }
        pageTitle={ pageTitle }
      />
    )
  else if (status === 'loading' && pageTitle)
    return (
      <EmptyTableSpinner pageTitle={pageTitle} colSpan={6}>
        <thead id="hzsi-thead" className="align-middle text-center text-white">
          <tr>
            <th className="fw-normal"  style={{width: '52px'}}>
              #
            </th>
            <th className="fw-normal" style={{width: '92px'}}>
              Stanje
            </th>
            <th className="fw-normal" style={{width: '650px'}}>
              Naziv, institucija, šifra i dodijeljeni resursi
            </th>
            <th className="fw-normal" style={{width: '126px'}}>
              Tip
            </th>
            <th className="fw-normal" style={{width: '120px'}}>
              Trajanje
            </th>
            <th className="fw-normal" style={{width: '380px'}}>
              Osobe
            </th>
          </tr>
        </thead>
      </EmptyTableSpinner>
    )
}
