import React, { useContext, useEffect, useState } from "react";
import { SharedData } from "../root";
import { fetchUsers } from "../../api/users"
import { useQuery } from "@tanstack/react-query";
import { 
  Badge, 
  Col, 
  Row, 
  Table, 
  Pagination, 
  PaginationItem, 
  PaginationLink, 
  Input, 
  Placeholder 
} from "reactstrap";
import { PageTitle } from '../../components/PageTitle';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faSearch, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { TablePaginationHelper } from "../../components/PaginationHelpers";
import { buildOptionsFromArray } from "../../utils/select-tools";
import { CustomReactSelect } from "../../components/CustomReactSelect";


const EmptyTable = ({ msg }) => (
  <>
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
        { msg }
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
  </>
)


const UsersListForm = ({ data, pageTitle }) => {
  const [pageSize, setPageSize] = useState(30)
  const [pageIndex, setPageIndex] = useState(0)

  const { control, setValue } = useForm({
    defaultValues: {
      users: data,
      searchUsername: "",
      searchName: "",
      searchInstitution: "",
      searchEmail: "",
      searchProject: "",
      searchSSHKey: ""
    }
  })

  const searchUsername = useWatch({ control, name: "searchUsername" })
  const searchName = useWatch({ control, name: "searchName" })
  const searchInstitution = useWatch({ control, name: "searchInstitution" })
  const searchEmail = useWatch({ control, name: "searchEmail" })
  const searchProject = useWatch({ control, name: "searchProject" })
  const searchSSHKey = useWatch({ control, name: "searchSSHKey" })

  const { fields } = useFieldArray({ control, name: "users" })

  let fieldsView = fields

  let paginationHelp = new TablePaginationHelper(fieldsView.length, pageSize, pageIndex)

  if (searchUsername)
    fieldsView = fieldsView.filter(e => e.username.toLowerCase().includes(searchUsername.toLowerCase()))

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

  const isSearched = searchUsername || searchName || searchInstitution || searchEmail || searchProject || searchSSHKey

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
                  Ime i prezime
                </th>
                <th className="fw-normal">
                  Institucija
                </th>
                <th className="fw-normal">
                  Korisnička oznaka
                </th>
                <th className="fw-normal">
                  Email
                </th>
                <th className="fw-normal">
                  Projekti
                </th>
                <th className="fw-normal">
                  Javni ključ
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 align-middle text-center">
                  <FontAwesomeIcon icon={ faSearch } />
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
                    name="searchInstitution"
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
                    name="searchUsername"
                    control={ control }
                    render={ ({ field }) =>
                      <Input
                        { ...field }
                        className="form-control"
                        placeholder="Traži"
                      />
                    }
                  />
                </td>
                <td className="p-3 align-middle text-center">
                  <Controller
                    name="searchEmail"
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
                    name="searchProject"
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
                <td className="p-3 align-middle text-center" style={{width: '10%'}}>
                  <Controller
                    name="searchSSHKey"
                    control={ control }
                    render={ ({ field }) =>
                      <CustomReactSelect
                        forwardedRef={ field.ref }
                        placeholder="Odaberi"
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
                      <td className="p-3 align-middle text-center">
                        { `${user.first_name} ${user.last_name}` }
                      </td>
                      <td className="p-3 align-middle text-center">
                        { user.person_institution }
                      </td>
                      <td className="p-3 align-middle text-center">
                        { user.username }
                      </td>
                      <td className="p-3 align-middle text-center">
                        { user.person_mail }
                      </td>
                      <td className="p-3 align-middle text-center">
                        {
                          user.projects.map((proj, pid) =>
                            <Badge key={ pid } color={ `${proj.role === "lead" ? "success" : "primary"}` } className="fw-normal ms-1">
                              { proj.identifier }
                            </Badge>
                          )
                        }
                      </td>
                      <td className="p-3 align-middle text-center">
                        {
                          user.ssh_key ?
                            <FontAwesomeIcon icon={faCheckCircle} style={{ color: "#339900" }} />
                          :
                            <FontAwesomeIcon icon={faTimesCircle} style={{ color: "#CC0000" }} />
                        }
                      </td>
                    </tr>
                  )
                :
                  data.length > 0 && isSearched ?
                    <EmptyTable msg="Nijedan korisnik ne zadovoljava pretragu" />
                  :
                    <EmptyTable msg="Nema korisnika prijavljenih na projekt" />
              }
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col className="d-flex justify-content-center align-self-center">
          <Pagination className="mt-2">
            <PaginationItem disabled={pageIndex === 0}>
              <PaginationLink aria-label="First" first onClick={() => setPageIndex(0)}/>
            </PaginationItem>
            <PaginationItem disabled={pageIndex === 0}>
              <PaginationLink aria-label="Previous" previous onClick={() => setPageIndex(pageIndex - 1)}/>
            </PaginationItem>
            {
              [...Array(paginationHelp.pageCount)].map((e, i) =>
                <PaginationItem active={pageIndex === i ? true : false} key={i}>
                  <PaginationLink onClick={() => setPageIndex(i)}>
                    { i + 1 }
                  </PaginationLink>
                </PaginationItem>
              )
            }
            <PaginationItem disabled={pageIndex === paginationHelp.pageCount - 1}>
              <PaginationLink aria-label="Next" next onClick={() => setPageIndex(pageIndex + 1)}/>
            </PaginationItem>
            <PaginationItem disabled={pageIndex === paginationHelp.pageCount- 1}>
              <PaginationLink aria-label="Last" last onClick={() => setPageIndex(paginationHelp.pageCount - 1)}/>
            </PaginationItem>
            <PaginationItem>
              <select
                style={{width: '180px'}}
                className="ms-1 form-control form-select text-primary"
                aria-label="Broj korisnika"
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value))
                  setPageIndex(Math.trunc(paginationHelp.start / e.target.value))
                }}
              >
                {paginationHelp.choices.map(pageSize => (
                  <option label={`${pageSize} korisnika`} key={pageSize} value={pageSize}>
                    {pageSize} users
                  </option>
                ))}
              </select>
            </PaginationItem>
          </Pagination>
        </Col>
      </Row>
    </>
  )
}


export const UsersList = () => {
  const { LinkTitles } = useContext(SharedData)
	const [pageTitle, setPageTitle] = useState(undefined)

	const { data } = useQuery({
		queryKey: ["all-users"],
		queryFn: fetchUsers
	})

	useEffect(() => {
		setPageTitle(LinkTitles(location.pathname))
	}, [location.pathname])

  if (data)
    return (
      <UsersListForm
        data={ data }
        pageTitle={ pageTitle }
      />
    )
}
