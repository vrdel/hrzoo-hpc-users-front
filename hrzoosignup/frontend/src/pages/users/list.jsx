import React, { useContext, useEffect, useState } from "react";
import { SharedData } from "../root";
import { fetchUsers } from "../../api/users"
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Col,
  Row,
  Table,
  Input
} from "reactstrap";
import { PageTitle } from '../../components/PageTitle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faSearch, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { HZSIPagination, TablePaginationHelper, EmptyTable } from "../../components/TableHelpers";
import { buildOptionsFromArray } from "../../utils/select-tools";
import { CustomReactSelect } from "../../components/CustomReactSelect";
import { useNavigate } from "react-router-dom";
import { defaultUnAuthnRedirect } from '../../config/default-redirect';
import _ from 'lodash';


const sortArrow = (descending) => {
  if (descending === true)
    return (
      <span>{' '}&uarr;</span>
    )
  else if (descending === false)
    return (
      <span>&darr;{' '}</span>
    )
  else
    return (
      <>
        <span>&uarr;</span>
        <span>&darr;</span>
      </>
    )
}


const UsersListForm = ({ data, pageTitle }) => {
  const [pageSize, setPageSize] = useState(30)
  const [pageIndex, setPageIndex] = useState(0)
  const [sortName, setSortName] = useState(undefined)
  const [sortJoined, setSortJoined] = useState(undefined)

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
    fieldsView = fieldsView.filter(e => `${e.first_name} ${e.last_name}`.toLowerCase().includes(searchName.toLowerCase()))

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

  const isSearched = searchJoined || searchName || searchInstitution || searchEmail || searchProject || searchSSHKey

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
                <th className="fw-normal"  style={{width: '52px'}}>
                  #
                </th>
                <th className="fw-normal position-relative"  style={{minWidth: '286px', cursor: 'pointer'}}
                  onClick={() => {
                    setSortName(!sortName)
                    setSortJoined(undefined)
                  }}
                >
                  Ime, prezime i oznaka
                  <div className="position-absolute translate-middle top-50 start-100 pe-5">
                    { sortArrow(sortName) }
                  </div>
                </th>
                <th className="fw-normal"  style={{width: '272px'}}>
                  Institucija
                </th>
                <th className="fw-normal"  style={{minWidth: '296px'}}>
                  Email
                </th>
                <th className="fw-normal position-relative" style={{minWidth: '226px', cursor: 'pointer'}}
                  onClick={() => {
                    setSortJoined(!sortJoined)
                    setSortName(undefined)
                  }}
                >
                  Dodan
                  <div className="position-absolute translate-middle top-50 start-100 pe-5">
                    { sortArrow(sortJoined) }
                  </div>
                </th>
                <th className="fw-normal"  style={{width: '146px'}}>
                  Projekti
                </th>
                <th className="fw-normal"  style={{width: '116px'}}>
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
                        options={ buildOptionsFromArray(["Da", "Ne", "Svi"]) }
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
                        { pageIndex * pageSize + index + 1 }
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
                        { user.date_joined }
                      </td>
                      <td className="p-3 align-middle text-center">
                        {
                          user.projects.map((proj, pid) =>
                            <Badge key={ pid } color={ `${proj.role === "lead" ? "dark" : "secondary"}` } className="fw-normal ms-1">
                              { proj.identifier }
                            </Badge>
                          )
                        }
                      </td>
                      <td className="p-3 align-middle text-center">
                        {
                          user.ssh_key ?
                            <FontAwesomeIcon size="xl" icon={faCheckCircle} style={{ color: "#339900" }} />
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


export const UsersList = () => {
  const { LinkTitles } = useContext(SharedData)
	const [pageTitle, setPageTitle] = useState(undefined)
  const navigate = useNavigate()

	const { status, error, data } = useQuery({
		queryKey: ["all-users"],
		queryFn: fetchUsers
	})

	useEffect(() => {
		setPageTitle(LinkTitles(location.pathname))
    if (status === 'error' && error.message.includes('403'))
      navigate(defaultUnAuthnRedirect)
	}, [location.pathname, status])

  if (status === 'success' && data)
    return (
      <UsersListForm
        data={ data }
        pageTitle={ pageTitle }
      />
    )
}
