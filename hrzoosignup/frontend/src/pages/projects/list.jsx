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
import { Badge, Col, Input, Row, Table } from "reactstrap";
import { PageTitle } from "../../components/PageTitle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { CustomReactSelect } from "../../components/CustomReactSelect";
import { TypeColor, TypeString } from "../../config/map-projecttypes";
import { extractCollaborators, extractLeaderName } from "../../utils/users_help";
import { StateIcons } from "../../config/map-states";


const ProjectsListForm = ({ data, pageTitle }) => {
  const [pageSize, setPageSize] = useState(30)
  const [pageIndex, setPageIndex] = useState(0)

  const { control, setValue } = useForm({
    defaultValues: {
      projects: data,
      searchName: "",
      searchIdentifier: "",
      searchType: "",
      searchDateEnd: "",
      searchUsers: "",
      searchState: ""
    }
  })

  const searchName = useWatch({ control, name: "searchName" })
  const searchIdentifier = useWatch({ control, name: "searchIdentifier" })
  const searchType = useWatch({ control, name: "searchType" })
  const searchDateEnd = useWatch({ control, name: "searchDateEnd" })
  const searchUsers = useWatch({ control, name: "searchUsers" })
  const searchState = useWatch({ control, name: "searchState" })

  const { fields } = useFieldArray({ control, name: "projects" })

  let fieldsView = fields

  let paginationHelp = new TablePaginationHelper(fieldsView.length, pageSize, pageIndex)

  if (searchName)
    fieldsView = fieldsView.filter(e => e.name.toLowerCase().includes(searchName.toLowerCase()))

  if (searchIdentifier)
    fieldsView = fieldsView.filter(e => e.identifier.toLowerCase().includes(searchIdentifier.toLowerCase()))
  
  if (searchType) {
    if (allProjectTypes.includes(searchType.toLowerCase()))
      fieldsView = fieldsView.filter(e => e.project_type.name.toLowerCase() == searchType.toLowerCase())

    else if (searchType.toLowerCase() === "all")
      fieldsView = fieldsView.filter(e => allProjectTypes.includes(e.project_type.name.toLowerCase()))
  }

  if (searchDateEnd)
    fieldsView = fieldsView.filter(e => convertToEuropean(e.date_end).includes(searchDateEnd))

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

  const isSearched = searchName || searchIdentifier || searchType || searchDateEnd || searchUsers || searchState

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
            <thead id="hzsi-thead" className="table-active align-middle text-center text-white">
              <tr className="border-bottom border-1 border-dark">
                <th className="fw-normal">
                  #
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
                  Osobe
                </th>
                <th className="fw-normal">
                  Stanje
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 align-middle text-center">
                  <FontAwesomeIcon icon={ faSearch } />
                </td>
                <td className="p-2 align-middle text-center">
                  <Controller
                    name="searchName"
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
                    name="searchIdentifier"
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
                <td className="p-2 align-middle text-center" style={{ width: "10%", fontSize: "0.83rem" }}>
                  <Controller
                    name="searchType"
                    control={ control }
                    render={ ({ field }) =>
                      <CustomReactSelect
                        forwardedRef={ field.ref }
                        placeholder="Odaberi"
                        options={ optionsTypes }
                        onChange={ e => setValue("searchType", e.value) }
                      />
                    }
                  />
                </td>
                <td className="p-2 align-middle text-center">
                  <Controller
                    name="searchDateEnd"
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
                <td className="p-2 align-middle text-center" style={{ width: "10%", fontSize: "0.83rem" }}>
                  <Controller
                    name="searchState"
                    control={ control }
                    render={ ({ field }) =>
                      <CustomReactSelect
                        forwardedRef={ field.ref }
                        placeholder="Odaberi"
                        options={ optionsStatesProjects }
                        onChange={ e => setValue("searchState", e.value) }
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
                      <td className="p-3 align-middle fw-bold text-center">
                        { project.name}
                      </td>
                      <td className="align-middle text-center">
                        <Badge color="secondary" className="fw-normal">
                          { project.identifier }
                        </Badge>
                      </td>
                      <td className="align-middle text-center">
                        <span className={ `badge fw-normal ${TypeColor(project.project_type.name)}` }>
                          { TypeString(project.project_type.name) }
                        </span>
                      </td>
                      <td className="align-middle text-center fs-6 font-monospace">
                        { convertToEuropean(project.date_start) }
                        <br/>
                        { convertToEuropean(project.date_end) }
                      </td>
                      <td className="align-middle text-center">
                        <Badge color="success" className="fw-normal ms-1">
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
                      <td className="p-3 align-middle text-center">
                        { StateIcons(project.state.name) }
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

  const { data } = useQuery({
    queryKey: ["all-projects"],
    queryFn: fetchAllNrProjects
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [LinkTitles])

  if (data)
    return (
      <ProjectsListForm
        data={ data.filter(e => ["approve", "extend", "expire"].includes(e.state.name.toLowerCase())) }
        pageTitle={ pageTitle }
      />
    )
}