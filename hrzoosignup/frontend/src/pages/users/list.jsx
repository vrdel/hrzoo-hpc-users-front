import React, { useContext, useEffect, useState } from "react";
import { SharedData } from "../root";
import { fetchUsers, fetchUsersInactive } from "../../api/users"
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  ButtonGroup,
  Col,
  Input,
  Row,
  Table,
} from "reactstrap";
import { PageTitle } from '../../components/PageTitle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faSearch, faTimesCircle, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { HZSIPagination, TablePaginationHelper, EmptyTable, SortArrow } from "../../components/TableHelpers";
import { buildOptionsFromArray } from "../../utils/select-tools";
import { CustomReactSelect } from "../../components/CustomReactSelect";
import { useNavigate } from "react-router-dom";
import { defaultUnAuthnRedirect } from '../../config/default-redirect';
import { EmptyTableSpinner } from '../../components/EmptyTableSpinner';
import { convertToEuropean, convertTimeToEuropean } from '../../utils/dates';
import _ from 'lodash';


const ButtonGroupActiveInactive = ({activeList}) => {
  let navigate = useNavigate()

  return (
    <ButtonGroup size="sm">
      <Button className="mt-1 mb-1 mr-3" color="light"
        active={ activeList }
        onClick={ () => { navigate('/ui/korisnici') } }>
        <FontAwesomeIcon icon={ faCheck } />{' '}
        Aktivni
      </Button>
      <Button className="ml-1 mt-1 mb-1" color="light"
        active={ !activeList }
        onClick={ () => { navigate('/ui/korisnici/neaktivni') } }>
        <FontAwesomeIcon icon={ faXmark } />{' '}
        Neaktivni
      </Button>
    </ButtonGroup>
  )
}


const UsersListTable = ({ data, pageTitle, activeList=false }) => {
  const [pageSize, setPageSize] = useState(30)
  const [pageIndex, setPageIndex] = useState(0)
  const [sortName, setSortName] = useState(undefined)
  const [sortJoined, setSortJoined] = useState(true)
  const navigate = useNavigate()

  const { control, setValue } = useForm({
    defaultValues: {
      users: data,
      searchJoined: "",
      searchName: "",
      searchInstitution: "",
      searchEmail: "",
      searchProject: "",
      searchSSHKey: ""
    }
  })

  const searchJoined = useWatch({ control, name: "searchJoined" })
  const searchName = useWatch({ control, name: "searchName" })
  const searchInstitution = useWatch({ control, name: "searchInstitution" })
  const searchEmail = useWatch({ control, name: "searchEmail" })
  const searchProject = useWatch({ control, name: "searchProject" })
  const searchSSHKey = useWatch({ control, name: "searchSSHKey" })

  const { fields } = useFieldArray({ control, name: "users" })

  let fieldsView = fields

  let paginationHelp = new TablePaginationHelper(fieldsView.length, pageSize, pageIndex)

  if (searchJoined)
    fieldsView = fieldsView.filter(e => e.date_joined.includes(searchJoined))

  if (searchName)
    fieldsView = fieldsView.filter(e => `${e.first_name} ${e.last_name}`.toLowerCase().includes(searchName.toLowerCase()) ||
      e.username.includes(searchName.toLowerCase())
    )

  if (searchInstitution)
    fieldsView = fieldsView.filter(e => e.person_institution.toLowerCase().includes(searchInstitution.toLowerCase()))

  if (searchEmail)
    fieldsView = fieldsView.filter(e => e.person_mail.toLowerCase().includes(searchEmail.toLowerCase()))

  if (searchProject)
    fieldsView = fieldsView.filter(e => e.projects.map(proj => proj.identifier).join(" ").toLowerCase().includes(searchProject.toLowerCase()))

  if (searchSSHKey)
    if (searchSSHKey.toLowerCase() === "da")
      fieldsView = fieldsView.filter(e => e.ssh_key)

    else if (searchSSHKey.toLowerCase() === "ne")
      fieldsView = fieldsView.filter(e => !e.ssh_key)

    else
      fieldsView = fieldsView.filter(e => e.ssh_key || !e.ssh_key)

  if (sortJoined !== undefined)
    fieldsView = _.orderBy(fieldsView, ['date_joined'], [sortJoined === true ? 'desc' : 'asc'])

  if (sortName !== undefined)
    fieldsView = _.orderBy(fieldsView, ['first_name', 'last_name'], [sortName === true ? 'desc' : 'asc'])

  const isSearched = searchJoined || searchName || searchInstitution || searchEmail || searchProject || (searchSSHKey && searchSSHKey.toLowerCase() !== 'svi')

  paginationHelp.searchNum = fieldsView.length
  paginationHelp.isSearched = isSearched

  fieldsView = fieldsView.slice(paginationHelp.start, paginationHelp.end)

  function calcIndex(index) {
    if (sortName || sortJoined)
      if (!isSearched)
        return fields.length - (pageIndex * pageSize + index + 1) + 1
      else
        return paginationHelp.searchLen - (pageIndex * pageSize + index + 1) + 1
    else
      return pageIndex * pageSize + index + 1
  }

  return (
    <>
      <Row>
        <PageTitle pageTitle={ pageTitle }>
          <ButtonGroupActiveInactive activeList={activeList} />
        </PageTitle>
      </Row>
      <Row className="mt-4">
        <Col>
          <Table responsive hover className="shadow-sm">
            <thead id="hzsi-thead" className="align-middle text-center text-white">
              <tr>
                <th className="fw-normal"  style={{width: '52px'}}>
                  #
                </th>
                <th className="fw-normal d-flex justify-content-center"  style={{minWidth: '306px', cursor: 'pointer'}}
                  onClick={() => {
                    setSortName(!sortName)
                    setSortJoined(undefined)
                  }}
                >
                  <div className="flex-grow-1">
                    Ime, prezime i oznaka
                  </div>
                  <div>
                    { SortArrow(sortName) }
                  </div>
                </th>
                <th className="fw-normal" style={{minWidth: '306px'}}>
                  Institucija
                </th>
                <th className="fw-normal"  style={{minWidth: '296px'}}>
                  Email
                </th>
                <th className="fw-normal d-flex justify-content-center" style={{minWidth: '146px', cursor: 'pointer'}}
                  onClick={() => {
                    setSortJoined(!sortJoined)
                    setSortName(undefined)
                  }}
                >
                  <div className="flex-grow-1">
                    Dodan
                  </div>
                  <div>
                    { SortArrow(sortJoined) }
                  </div>
                </th>
                <th className="fw-normal"  style={{minWidth: '180px'}}>
                  {
                    activeList ?
                      "Projekti"
                    :
                      "Prošli projekti"
                  }
                </th>
                <th className="fw-normal"  style={{minWidth: '116px'}}>
                  Javni ključ
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
                        style={{fontSize: '0.83rem'}}
                      />
                    }
                  />
                </td>
                <td className="p-2 align-middle text-center">
                  <Controller
                    name="searchInstitution"
                    control={ control }
                    render={ ({ field }) =>
                      <Input
                        { ...field }
                        placeholder="Traži"
                        className="form-control"
                        style={{fontSize: '0.83rem'}}
                      />
                    }
                  />
                </td>
                <td className="p-2 align-middle text-center">
                  <Controller
                    name="searchEmail"
                    control={ control }
                    render={ ({ field }) =>
                      <Input
                        { ...field }
                        placeholder="Traži"
                        className="form-control"
                        style={{fontSize: '0.83rem'}}
                      />
                    }
                  />
                </td>
                <td className="p-2 align-middle text-center">
                  <Controller
                    name="searchJoined"
                    control={ control }
                    render={ ({ field }) =>
                      <Input
                        { ...field }
                        className="form-control"
                        placeholder="Traži"
                        style={{fontSize: '0.83rem'}}
                      />
                    }
                  />
                </td>
                <td className="p-2 align-middle text-center">
                  <Controller
                    name="searchProject"
                    control={ control }
                    render={ ({ field }) =>
                      <Input
                        { ...field }
                        placeholder="Traži"
                        className="form-control"
                        style={{fontSize: '0.83rem'}}
                      />
                    }
                  />
                </td>
                <td className="p-2 align-middle text-center" style={{fontSize: '0.83rem'}}>
                  <Controller
                    name="searchSSHKey"
                    control={ control }
                    render={ ({ field }) =>
                      <CustomReactSelect
                        forwardedRef={ field.ref }
                        placeholder="Odaberi"
                        controlWidth="116px"
                        options={ buildOptionsFromArray(["Svi", "Da", "Ne"]) }
                        onChange={ (e) => setValue("searchSSHKey", e.value) }
                      />
                    }
                  />
                </td>
              </tr>
              {
                fieldsView.length > 0 ?
                  fieldsView.map((user, index) =>
                    <tr key={index}>
                      <td className="p-3 align-middle text-center">
                        { calcIndex(index) }
                      </td>
                      <td className="p-3 align-middle text-center fw-bold">
                        <Row>
                          <Col>
                            { `${user.first_name} ${user.last_name}` }
                          </Col>
                        </Row>
                        <Row>
                          <Col className="font-monospace fw-normal">
                            { user.username }
                          </Col>
                        </Row>
                      </td>
                      <td className="p-3 align-middle text-center">
                        { user.person_institution }
                      </td>
                      <td className="p-3 align-middle text-center font-monospace" style={{wordBreak: 'break-all'}}>
                        { user.person_mail }
                      </td>
                      <td className="p-3 align-middle text-center fs-6 font-monospace" style={{wordBreak: 'break-all'}}>
                        { convertToEuropean(user.date_joined) }
                        <br/>
                        { convertTimeToEuropean(user.date_joined) }
                      </td>
                      <td className="p-3 align-middle text-center">
                        {
                          user.projects.length > 0 ?
                            user.projects.map((proj, pid) =>
                              <Badge key={ pid } color={ `${proj.role === "lead" ? "dark" : "secondary"}` } className="fw-normal ms-1">
                                { proj.identifier }
                              </Badge>
                            )
                          :
                            '\u2212'
                        }
                      </td>
                      <td className="p-3 align-middle text-center">
                        {
                          user.ssh_key ?
                            <div className='position-relative' key={`ssh-key-${index}`}>
                              <FontAwesomeIcon size="xl" icon={faCheckCircle} style={{ color: "#339900" }}/>
                              <span key={`ssh-key-${index}`} className="position-absolute top-100 translate-middle badge rounded-pill fw-normal text-dark bg-success-subtle" style={{fontSize: '0.6rem'}}>
                                { user.n_ssh_key }
                              </span>
                            </div>
                          :
                            <FontAwesomeIcon size="xl" icon={faTimesCircle} style={{ color: "#CC0000" }} />
                        }
                      </td>
                    </tr>
                  )
                :
                  data.length > 0 && isSearched ?
                    <EmptyTable colspan="7" msg="Nijedan korisnik ne zadovoljava pretragu" />
                  :
                    <EmptyTable colspan="7" msg="Nema korisnika prijavljenih na projekt" />
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
        resource_name="korisnika"
      />
    </>
  )
}


export const UsersInactiveList = () => {
  const { LinkTitles } = useContext(SharedData)
	const [pageTitle, setPageTitle] = useState(undefined)
  const navigate = useNavigate()

	const { status, error, data } = useQuery({
		queryKey: ["inactive-users"],
		queryFn: fetchUsersInactive
	})

	useEffect(() => {
		setPageTitle(LinkTitles(location.pathname))
    if (status === 'error' && error.message.includes('403'))
      navigate(defaultUnAuthnRedirect)
	}, [location.pathname, status])

  if (status === 'loading' && pageTitle)
    return (
      <EmptyTableSpinner
        pageTitle={pageTitle}
        PageTitleChild={ButtonGroupActiveInactive}
        PageTitleChildProps={{activeList: false}}
        colSpan={7}
      >
        <thead id="hzsi-thead" className="align-middle text-center text-white">
          <tr>
            <th className="fw-normal"  style={{width: '52px'}}>
              #
            </th>
            <th className="fw-normal d-flex justify-content-center"  style={{minWidth: '306px', cursor: 'pointer'}}>
              <div className="flex-grow-1">
                Ime, prezime i oznaka
              </div>
              <div>
                { SortArrow() }
              </div>
            </th>
            <th className="fw-normal"  style={{width: '306px'}}>
              Institucija
            </th>
            <th className="fw-normal"  style={{minWidth: '296px'}}>
              Email
            </th>
            <th className="fw-normal d-flex justify-content-center" style={{minWidth: '146px', cursor: 'pointer'}}
            >
              <div className="flex-grow-1">
                Dodan
              </div>
              <div>
                { SortArrow() }
              </div>
            </th>
            <th className="fw-normal"  style={{width: '180px'}}>
              Prošli projekti
            </th>
            <th className="fw-normal"  style={{width: '116px'}}>
              Javni ključ
            </th>
          </tr>
        </thead>
      </EmptyTableSpinner>
    )
  else if (status === 'success' && data && pageTitle)
    return (
      <UsersListTable
        data={ data }
        pageTitle={ pageTitle }
        activeList={false}
      />
    )
}


export const UsersList = () => {
  const { LinkTitles } = useContext(SharedData)
	const [pageTitle, setPageTitle] = useState(undefined)
  const navigate = useNavigate()

	const { status, error, data } = useQuery({
		queryKey: ["active-users"],
		queryFn: fetchUsers
	})

	useEffect(() => {
		setPageTitle(LinkTitles(location.pathname))
    if (status === 'error' && error.message.includes('403'))
      navigate(defaultUnAuthnRedirect)
	}, [location.pathname, status])

  if (status === 'loading' && pageTitle)
    return (
      <EmptyTableSpinner
        pageTitle={pageTitle}
        PageTitleChild={ButtonGroupActiveInactive}
        PageTitleChildProps={{activeList: true}}
        colSpan={7}
      >
        <thead id="hzsi-thead" className="align-middle text-center text-white">
          <tr>
            <th className="fw-normal"  style={{width: '52px'}}>
              #
            </th>
            <th className="fw-normal d-flex justify-content-center"  style={{minWidth: '306px', cursor: 'pointer'}}>
              <div className="flex-grow-1">
                Ime, prezime i oznaka
              </div>
              <div>
                { SortArrow() }
              </div>
            </th>
            <th className="fw-normal"  style={{width: '306px'}}>
              Institucija
            </th>
            <th className="fw-normal"  style={{minWidth: '296px'}}>
              Email
            </th>
            <th className="fw-normal d-flex justify-content-center" style={{minWidth: '146px', cursor: 'pointer'}}
            >
              <div className="flex-grow-1">
                Dodan
              </div>
              <div>
                { SortArrow() }
              </div>
            </th>
            <th className="fw-normal"  style={{width: '180px'}}>
              Projekti
            </th>
            <th className="fw-normal"  style={{width: '116px'}}>
              Javni ključ
            </th>
          </tr>
        </thead>
      </EmptyTableSpinner>
    )
  else if (status === 'success' && data && pageTitle)
    return (
      <UsersListTable
        data={ data }
        pageTitle={ pageTitle }
        activeList={true}
      />
    )
}
