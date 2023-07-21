import React, { useContext, useEffect, useState } from "react";
import { SharedData } from "../root";
import { useQuery } from "@tanstack/react-query";
import { fetchAllNrProjects } from "../../api/projects";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  TablePaginationHelper,
  optionsStatesProjects,
  optionsTypes,
  allProjectTypes,
  allStates,
  EmptyTable,
  HZSIPagination
} from "../../components/TableHelpers";
import { convertToEuropean } from "../../utils/dates";
import { Badge, Col, Input, Row, Table, Spinner } from "reactstrap";
import { PageTitle } from "../../components/PageTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { CustomReactSelect } from "../../components/CustomReactSelect";
import { TypeColor, TypeString } from "../../config/map-projecttypes";
import { extractCollaborators, extractLeaderName } from "../../utils/users_help";
import { StateIcons } from "../../config/map-states";
import { useNavigate } from "react-router-dom";
import { defaultUnAuthnRedirect } from '../../config/default-redirect';
import { EmptyTableSpinner } from '../../components/EmptyTableSpinner';
import _ from "lodash";


const ProjectsListForm = ({ data, pageTitle }) => {
  const [pageSize, setPageSize] = useState(30)
  const [pageIndex, setPageIndex] = useState(0)

  const { control, setValue } = useForm({
    defaultValues: {
      projects: data,
      searchNameIdentifier: "",
      searchType: "",
      searchDate: "",
      searchUsers: "",
      searchState: ""
    }
  })

  const searchNameIdentifier = useWatch({ control, name: "searchNameIdentifier" })
  const searchType = useWatch({ control, name: "searchType" })
  const searchDate = useWatch({ control, name: "searchDate" })
  const searchUsers = useWatch({ control, name: "searchUsers" })
  const searchState = useWatch({ control, name: "searchState" })

  const { fields } = useFieldArray({ control, name: "projects" })

  let fieldsView = fields

  let paginationHelp = new TablePaginationHelper(fieldsView.length, pageSize, pageIndex)

  if (searchNameIdentifier)
    fieldsView = fieldsView.filter(
      (e) => (
        e.name.toLowerCase().includes(searchNameIdentifier.toLowerCase())
        || e.identifier.toLowerCase().includes(searchNameIdentifier.toLowerCase())
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

  const isSearched = searchNameIdentifier || (searchType && searchType !== 'all')
    || searchDate || searchUsers || (searchState && searchState !== 'all')

  paginationHelp.searchNum = fieldsView.length
  paginationHelp.isSearched = isSearched

  fieldsView = fieldsView.slice(paginationHelp.start, paginationHelp.end)

  return (
    <>
      <Row>
        <PageTitle pageTitle={ pageTitle } />
      </Row>
      <Row className="mt-4">
        <Col>
          <Table responsive hover className="shadow-sm">
            <thead id="hzsi-thead" className="align-middle text-center text-white">
              <tr className="border-bottom-1 border-dark">
                <th className="fw-normal"  style={{width: '52px'}}>
                  #
                </th>
                <th className="fw-normal" style={{width: '92px'}}>
                  Stanje
                </th>
                <th className="fw-normal" style={{width: '650px'}}>
                  Naziv i šifra
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
                <td className="p-2 align-middle text-center">
                  <Controller
                    name="searchNameIdentifier"
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
                        { !isSearched ? data.length - pageIndex * pageSize - index : pageIndex * pageSize + index + 1 }
                      </td>
                      <td className="p-3 align-middle text-center">
                        { StateIcons(project.state.name) }
                      </td>
                      <td className="p-3 align-middle fw-bold text-center">
                        <Row>
                          <Col>
                            { project.name}
                          </Col>
                        </Row>
                        <Row style={{height: '15px'}}>
                        </Row>
                        <Row>
                          <Col>
                            <Badge color="secondary" className="fw-normal">
                              { project.identifier }
                            </Badge>
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
                        <Badge color="dark" className="fw-normal ms-1">
                          { extractLeaderName(project.userproject_set, true) }
                        </Badge>
                        {
                          extractCollaborators(project.userproject_set, true).map((collab, cid) =>
                            <Badge key={cid} color="secondary" className="fw-normal ms-1">
                              { collab }
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
  }, [LinkTitles, status])


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
          <tr className="border-bottom-1 border-dark">
            <th className="fw-normal"  style={{width: '52px'}}>
              #
            </th>
            <th className="fw-normal" style={{width: '92px'}}>
              Stanje
            </th>
            <th className="fw-normal" style={{width: '650px'}}>
              Naziv i šifra
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
