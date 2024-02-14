import React, { useContext, useEffect, useState } from "react";
import { SharedData } from "Pages/root";
import { fetchUsers, fetchUsersInactive } from "Api/users"
import { fetchNrSpecificProject } from "Api/projects"
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Button,
  ButtonGroup,
  Col,
  Input,
  Popover,
  PopoverBody,
  PopoverHeader,
  Row,
  Table,
} from "reactstrap";
import { PageTitle } from 'Components/PageTitle';
import { MiniButton } from 'Components/MiniButton';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faCopy, faSearch, faTimesCircle, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { HZSIPagination, TablePaginationHelper, EmptyTable, SortArrow } from "Components/TableHelpers";
import { buildOptionsFromArray } from "Utils/select-tools";
import { CustomReactSelect } from "Components/CustomReactSelect";
import { useNavigate } from "react-router-dom";
import { defaultUnAuthnRedirect } from 'Config/default-redirect';
import { EmptyTableSpinner } from 'Components/EmptyTableSpinner';
import { convertToEuropean, convertTimeToEuropean } from 'Utils/dates';
import { copyToClipboard } from 'Utils/copy-clipboard';
import { ProjectTypeBadge } from 'Components/GeneralProjectInfo';
import _ from 'lodash';


const PopoverProjectInfo = ({rhfId, projId}) => {
  const {status, data: projectData} = useQuery({
    queryKey: ['users-project', projId],
    queryFn: () => fetchNrSpecificProject(projId),
  })

  if (status === 'success' && projectData) {
    return (
      <>
        <PopoverHeader className="d-flex align-items-center justify-content-between">
          <span className="me-5">
            <Badge key={rhfId} color="secondary" className="fw-normal">
              {projectData.identifier}
            </Badge>
          </span>
          <ProjectTypeBadge projectInfo={projectData} />
        </PopoverHeader>
        <PopoverBody>
          <Row>
            <Col className="fw-bold">
              Naziv
            </Col>
          </Row>
          <Row>
            <Col className="ms-2 me-2 fs-6 fst-italic">
              { projectData['name'] }
            </Col>
          </Row>
          <Row>
            <Col>
            </Col>
          </Row>
          <Row className="mt-1">
            <Col className="fw-bold">
              Institucija
            </Col>
          </Row>
          <Row>
            <Col className="ms-2 me-2 fst-italic">
              { projectData['institute'] }
            </Col>
          </Row>
        </PopoverBody>
      </>
    )
  }
  else
    return (
      <PopoverBody>
        No data
      </PopoverBody>
    )

}


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

  if (searchName) {
      fieldsView = fieldsView.filter(e => `${e.first_name} ${e.last_name}`.toLowerCase().includes(searchName.toLowerCase()) ||
        e.person_mail.includes(searchName.toLowerCase())
      )
  }

  if (searchInstitution)
    fieldsView = fieldsView.filter(e => e.person_institution.toLowerCase().includes(searchInstitution.toLowerCase()))

  if (searchEmail) {
    if (activeList)
      fieldsView = fieldsView.filter(e => e.username.toLowerCase().includes(searchEmail.toLowerCase()) ||
        e.person_username.includes(searchEmail.toLowerCase())
      )
    else
      fieldsView = fieldsView.filter(e => e.username.includes(searchEmail.toLowerCase()))
  }

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
        return paginationHelp.searchLen - index - (pageIndex * pageSize)
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
                    Ime, prezime i email
                  </div>
                  <div>
                    { SortArrow(sortName) }
                  </div>
                </th>
                <th className="fw-normal" style={{minWidth: '306px'}}>
                  Institucija
                </th>
                <th className="fw-normal"  style={{minWidth: '296px'}}>
                  {
                    activeList ?
                      'Korisničko ime i AAI oznaka'
                    :
                      'AAI oznaka'
                  }
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
                        <Row className="g-0">
                          <Col className="d-flex font-monospace fw-normal justify-content-center align-items-center align-self-center">
                            { user.person_mail }
                            <MiniButton
                              onClick={(e) => copyToClipboard(
                                e, user.person_mail,
                                "Email kopiran u međuspremnik",
                                "Greška prilikom kopiranja emaila u međuspremnik",
                                "id-email"
                              )}
                            >
                              <FontAwesomeIcon size="xs" icon={faCopy} />
                            </MiniButton>
                          </Col>
                        </Row>
                      </td>
                      <td className="p-3 align-middle text-center">
                        { user.person_institution }
                      </td>
                      <td className="p-3 align-middle text-center font-monospace" style={{wordBreak: 'break-all'}}>
                        {
                          activeList &&
                          <Row className="g-0">
                            <Col className="font-monospace fw-bold text-success d-flex justify-content-center align-items-center align-self-center">
                              { user.person_username }
                              <MiniButton
                                onClick={(e) => copyToClipboard(
                                  e, user.person_username,
                                  "Korisničko ime kopirano u međuspremnik",
                                  "Greška prilikom kopiranja korisničkog imena u međuspremnik",
                                  "id-uid"
                                )}
                              >
                                <FontAwesomeIcon size="xs" icon={faCopy} />
                              </MiniButton>
                            </Col>
                          </Row>
                        }
                        <Row className="g-0">
                          <Col className="font-monospace fw-normal d-flex justify-content-center align-items-center align-self-center">
                            { user.username }
                            <MiniButton
                              onClick={(e) => copyToClipboard(
                                e, user.username,
                                "Korisnička oznaka kopirana u međuspremnik",
                                "Greška prilikom kopiranja korisničke oznake u međuspremnik",
                                "id-uid"
                              )}
                            >
                              <FontAwesomeIcon size="xs" icon={faCopy} />
                            </MiniButton>
                          </Col>
                        </Row>
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
                              <Row className={pid > 0 ? "g-0 mt-1" : "g-0"} key={pid}>
                                <Col className="d-flex justify-content-center align-items-center align-self-center">
                                  <Badge key={pid}
                                    id={`pop-${user.id}-${pid}`}
                                    color={ `${proj.role === "lead" ? "dark" : "secondary"}` }
                                    className="fw-normal ms-1"
                                    style={{cursor: 'pointer'}}
                                    onClick={() => {
                                      showPopover(`${user.id}-${pid}`)
                                    }}
                                  >
                                    { proj.identifier }
                                  </Badge>
                                  <Popover
                                    placement="left"
                                    isOpen={isOpened(`${user.id}-${pid}`)}
                                    target={`pop-${user.id}-${pid}`}
                                    toggle={() => {
                                      showPopover(`${user.id}-${pid}`)
                                    }}
                                  >
                                    <PopoverProjectInfo rhfId={`${user.id}-${pid}`} projId={proj.identifier} />
                                  </Popover>
                                  <MiniButton
                                    color="light"
                                    onClick={(e) => copyToClipboard(
                                      e, proj.identifier,
                                      "Šifra projekta kopirana u međuspremnik",
                                      "Greška prilikom kopiranja šifre projekta u međuspremnik",
                                      "id-request"
                                    )}
                                  >
                                    <FontAwesomeIcon size="xs" icon={faCopy} />
                                  </MiniButton>
                                </Col>
                              </Row>
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
                Ime, prezime i email
              </div>
              <div>
                { SortArrow() }
              </div>
            </th>
            <th className="fw-normal"  style={{width: '306px'}}>
              Institucija
            </th>
            <th className="fw-normal"  style={{minWidth: '296px'}}>
              AAI oznaka
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
                Ime, prezime i email
              </div>
              <div>
                { SortArrow() }
              </div>
            </th>
            <th className="fw-normal"  style={{width: '306px'}}>
              Institucija
            </th>
            <th className="fw-normal"  style={{minWidth: '296px'}}>
              Korisničko ime i AAI oznaka
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
