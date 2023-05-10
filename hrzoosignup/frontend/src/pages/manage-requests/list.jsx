import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from '../root';
import { Col, Row, Badge, Table, Tooltip, Button, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../../components/PageTitle';
import { StateIcons, StateString } from '../../config/map-states';
import { fetchAllNrProjects } from '../../api/projects';
import { useQuery } from '@tanstack/react-query';
import { TypeString, TypeColor } from '../../config/map-projecttypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass, faSearch
} from '@fortawesome/free-solid-svg-icons';
import { convertToEuropean, convertTimeToEuropean } from '../../utils/dates';
import { extractLeaderName } from '../../utils/users_help'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { EmptyTable, HZSIPagination, TablePaginationHelper } from '../../components/TableHelpers';
import { CustomReactSelect } from '../../components/CustomReactSelect';


const sortAscendingBySubmitDate = (a, b) => {
  var keyA = new Date(a.date_submitted)
  var keyB = new Date(b.date_submitted)

  if (keyA < keyB) return -1;
  if (keyA > keyB) return 1;
  return 0;
}


const sortDescendingBySubmitDate = (a, b) => {
  var keyA = new Date(a.date_submitted)
  var keyB = new Date(b.date_submitted)

  if (keyA > keyB) return -1;
  if (keyA < keyB) return 1;
  return 0;
}

const ManageRequestsForm = ({ data, pageTitle }) => {
  const [pageSize, setPageSize] = useState(30)
  const [pageIndex, setPageIndex] = useState(0)

  const allStates = ["submit", "approve", "deny", "expire", "extend"]
  const allProjectTypes = ["research-croris", "thesis", "practical"]

  const optionsStates = [
    { label: "Podnesen", value: "submit" },
    { label: "Odobren", value: "approve" },
    { label: "Odbijen", value: "deny" },
    { label: "Istekao", value: "expire" },
    { label: "Produžen", value: "extend" },
    { label: "Svi", value: "all" }
  ]

  const optionsTypes = [
    { label: "Projekt", value: "research-croris" },
    { label: "Rad", value: "thesis" },
    { label: "Nastava", value: "practical" },
    { label: "Svi", value: "all" }
  ]

  const optionsSort = [
    { label: "Uzlazno", value: "asc" },
    { label: "Silazno", value: "desc" }
  ]

  const navigate = useNavigate()

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
      sortSubmitDate: "",
      searchName: "",
      searchIdentifier: "",
      searchLead: "",
      searchType: ""
    }
  })

  const searchState = useWatch({ control, name: "searchState" })
  const sortSubmitDate = useWatch({ control, name: "sortSubmitDate" })
  const searchName = useWatch({ control, name: "searchName" })
  const searchIdentifier = useWatch({ control, name: "searchIdentifier" })
  const searchLead = useWatch({ control, name: "searchLead" })
  const searchType = useWatch({ control, name: "searchType" })

  const { fields } = useFieldArray({ control, name: "requests" })

  let fieldsView = fields

  let paginationHelp = new TablePaginationHelper(fieldsView.length, pageSize, pageIndex)

  if (searchState) {
    if (allStates.includes(searchState.toLowerCase()))
      fieldsView = fieldsView.filter(e => e.state.name.toLowerCase() === searchState.toLowerCase())

    else if (searchState.toLowerCase() === "all")
      fieldsView = fieldsView.filter(e => allStates.includes(e.state.name.toLowerCase()))
  }

  if (sortSubmitDate) {
    if (sortSubmitDate === "desc")
      fieldsView = fieldsView.sort(sortDescendingBySubmitDate)

    else if (sortSubmitDate === "asc")
      fieldsView = fieldsView.sort(sortAscendingBySubmitDate)
  }

  if (searchName)
    fieldsView = fieldsView.filter(e => e.name.toLowerCase().includes(searchName.toLowerCase()))

  if (searchIdentifier)
    fieldsView = fieldsView.filter(e => e.identifier.toLowerCase().includes(searchIdentifier.toLowerCase()))

  if (searchLead)
    fieldsView = fieldsView.filter(e => extractLeaderName(e.userproject_set, true).toLowerCase().includes(searchLead.toLowerCase()))
  
  if (searchType)
    if (allProjectTypes.includes(searchType.toLowerCase()))
      fieldsView = fieldsView.filter(e => e.project_type.name.toLowerCase() == searchType.toLowerCase())

    else if (searchType.toLowerCase() === "all")
      fieldsView = fieldsView.filter(e => allProjectTypes.includes(e.project_type.name.toLowerCase()))

  const isSearched = searchState || searchName || searchIdentifier || searchLead || searchType

  paginationHelp.searchNum = fieldsView.length
  paginationHelp.isSearched = isSearched
  
  fieldsView = fieldsView.slice(paginationHelp.start, paginationHelp.end)

  return (
    <>
      <Row>
        <PageTitle pageTitle={pageTitle}/>
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
                  Voditelj
                </th>
                <th className="fw-normal">
                  Tip
                </th>
                <th className="fw-normal">
                  Trajanje
                </th>
                <th className="fw-normal">
                  Promjena
                </th>
                <th className="fw-normal">
                  Radnje
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 align-middle text-center">
                  <FontAwesomeIcon icon={ faSearch } />
                </td>
                <td className="p-3 align-middle text-center" style={{ width: "10%" }}>
                  <Controller
                    name="searchState"
                    control={ control }
                    render={ ({ field }) =>
                      <CustomReactSelect
                        forwardedRef={ field.ref }
                        placeholder="Odaberi"
                        options={ optionsStates }
                        onChange={ e => setValue("searchState", e.value) }
                      />
                    }
                  />
                </td>
                <td className="p-3 align-middle text-center" style={{ width: "10%" }}>
                  <Controller
                    name="sortSubmitDate"
                    control={ control }
                    render={ ({ field }) =>
                      <CustomReactSelect
                        forwardedRef={ field.ref }
                        placeholder="Sortiraj"
                        options={ optionsSort }
                        onChange={ e => setValue("sortSubmitDate", e.value) }
                      />
                    }
                  />
                </td>
                <td className="p-3 align-middle text-center">
                  <Controller
                    name="searchName"
                    control={ control }
                    render={ ({ field }) =>
                      <Input
                        { ...field }
                        placeholder="Traži"
                        className="form-control"
                      />
                    }
                  />
                </td>
                <td className="p-3 align-middle text-center">
                  <Controller
                    name="searchIdentifier"
                    control={ control }
                    render={ ({ field }) =>
                      <Input
                        { ...field }
                        placeholder="Traži"
                        className="form-control"
                      />
                    }
                  />
                </td>
                <td className="p-3 align-middle text-center">
                  <Controller
                    name="searchLead"
                    control={ control }
                    render={ ({ field }) =>
                      <Input
                        { ...field }
                        placeholder="Traži"
                        className="form-control"
                      />
                    }
                  />
                </td>
                <td className="p-3 align-middle text-center" style={{ width: "10%" }}>
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
                <td className="p-3 align-middle text-center">{" "}</td>
                <td className="p-3 align-middle text-center">{" "}</td>
                <td className="p-3 align-middle text-center">{" "}</td>
              </tr>
              {
                fieldsView.length > 0 ?
                  fieldsView.map((project, index) =>
                    <tr key={index}>
                      <td className="p-3 align-middle text-center">
                        { pageIndex * pageSize + index + 1 }
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
                      <td className="p-3 align-middle fw-bold text-center">
                        { project.name}
                      </td>
                      <td className="align-middle text-center">
                        <Badge color="secondary" className="fw-normal">
                          { project.identifier }
                        </Badge>
                      </td>
                      <td className="p-3 align-middle text-center">
                        { extractLeaderName(project.userproject_set, true) }
                      </td>
                      <td className="align-middle text-center">
                        <span className={`badge fw-normal ${TypeColor(project.project_type.name)}`} >
                          { TypeString(project.project_type.name) }
                        </span>
                      </td>
                      <td className="align-middle text-center fs-6 font-monospace">
                        { convertToEuropean(project.date_start) }
                        <br/>
                        { convertToEuropean(project.date_end) }
                      </td>
                      <td className="align-middle text-center fs-6 font-monospace">
                        { project.date_changed && convertToEuropean(project.date_changed) }
                        <br/>
                        { project.date_changed && convertTimeToEuropean(project.date_changed) }
                      </td>
                      <td className="align-middle text-center">
                        <Button color="light" onClick={() => navigate(project.identifier)}>
                          <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </Button>
                      </td>
                    </tr>
                  )
                :
                  data.length > 0 && isSearched ?
                    <EmptyTable msg="Nijedan zahtjev ne zadovoljava pretragu" />
                  :
                    <EmptyTable msg="Nema podnesenih zahtjeva" />
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
        resource_name="zahtjeva"
      />
    </>
  )
}


export const ManageRequestsList = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);

  const { data: nrProjects } = useQuery({
      queryKey: ['all-projects'],
      queryFn: fetchAllNrProjects
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname])

  if (nrProjects)
    return (
      <ManageRequestsForm
        data={ nrProjects }
        pageTitle={ pageTitle }
      />
    )
};
