import React, { useContext, useState, useRef, useEffect } from 'react';
import { Col, Collapse, Row, Card, Table, Button, Form, Overlay, Tooltip } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { AuthContext } from 'Components/AuthContextProvider';
import { CustomCreatableSelect, CustomReactSelect } from 'Components/CustomReactSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faCheck,
  faEnvelope,
  faFile,
  faKey,
  faPaperPlane,
  faPlus,
  faSearch,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { extractUsers } from 'Utils/invites-extracts';
import { fetchUsers, fetchUsersInactive } from "Api/users"
import { useQuery } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl'
import { useOpenedIndexMap } from 'Hooks/indexed-map'
import { SortArrow } from 'Components/TableHelpers';
import { useVirtualizer } from '@tanstack/react-virtual';
import _ from 'lodash';


export const UsersTableGeneral = ({project, invites, onSubmit}) => {
  const lead = extractUsers(project.userproject_set, 'lead')[0]
  const alreadyJoined = extractUsers(project.userproject_set, 'collaborator')
  const { userDetails, backendConfig } = useContext(AuthContext);
  const virtualScroll = backendConfig?.virtual_scroll ?? false
  const virtualScrollRows = backendConfig?.virtual_scroll_rows ?? 15
  const virtualScrollHeight = backendConfig?.virtual_scroll_height ?? 600
  const amILead = lead['user']['person_oib'] === userDetails.person_oib
  const [checkJoined, setCheckJoined] = useState(Array(alreadyJoined.length))
  const [collaboratorsEmailFile, setCollaboratorsEmailFile] = useState(undefined)
  const [ foreignCollaboratorEmailFile, setForeignCollaboratorEmailFile ] = useState(undefined)
  const refFileCollaboratorsInput = useRef(null)
  const refFileForeignCollaboratorsInput = useRef(null)
  const tableContainerRef = useRef(null)
  const intl = useIntl()
  const { isOpen: isOpened, openIndex: showTooltip, closeIndex: hideTooltip } = useOpenedIndexMap()

  const [searchFirstName, setSearchFirstName] = useState('')
  const [searchLastName, setSearchLastName] = useState('')
  const [searchRole, setSearchRole] = useState('')
  const [searchEmail, setSearchEmail] = useState('')

  const [sortFirstName, setSortFirstName] = useState(undefined)
  const [sortLastName, setSortLastName] = useState(undefined)
  const [sortEmail, setSortEmail] = useState(undefined)

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => {
    if (project.is_active)
      return setIsOpen(!isOpen)
    else
      toast.error(
        <span className="font-monospace text-white">
          <FormattedMessage
            defaultMessage="Projekt nije aktivan pa nije moguće pozivati suradnike"
            description="userstable-general-toast-invite-fail"
          /><br/>
        </span>, {
          theme: 'colored',
          toastId: 'invit-fail-sent',
          autoClose: 2500,
        }
      )
  };

  const [isOpen2, setIsOpen2] = useState(false);
  const toggle2 = () => {
    if (project.is_active)
      return setIsOpen2(!isOpen2);
    else
      toast.error(
        <span className="font-monospace text-white">
          <FormattedMessage
            defaultMessage="Projekt nije aktivan pa nije moguće dodati suradnike"
            description="userstable-general-toast-invite-fail-2"
          /><br/>
        </span>, {
          theme: 'colored',
          toastId: 'invit-fail-sent',
          autoClose: 2500,
        }
      )
  }

  const [isOpen3, setIsOpen3] = useState(false);
  const toggle3 = () => {
    if (project.is_active)
      return setIsOpen3(!isOpen3);
    else
      toast.error(
        <span className="font-monospace text-white">
          <FormattedMessage
            defaultMessage="Projekt nije aktivan pa nije moguće pozivati suradnike"
            description="userstable-general-toast-invite-fail-2"
          /><br/>
        </span>, {
          theme: 'colored',
          toastId: 'invit-fail-sent',
          autoClose: 3500,
        }
      )
  }

  const { data: dataActiveUsers } = useQuery({
		queryKey: ["active-users"],
		queryFn: fetchUsers,
    enabled: project.project_type['name'] === 'internal' && (userDetails.is_staff || userDetails.is_superuser)
	})

  const { data: dataInactiveUsers } = useQuery({
		queryKey: ["inactive-users"],
		queryFn: fetchUsersInactive,
    enabled: project.project_type['name'] === 'internal' && (userDetails.is_staff || userDetails.is_superuser)
	})

  const { control, handleSubmit, setValue, resetField } = useForm({
    defaultValues: {
      collaboratorEmails: '',
      collaboratorUids: '',
      foreignCollaboratorEmails: ''
    },
    mode: "all"
  });

  const validateEmails = ({ emailFile, field }) => {
    const emails = emailFile.split(/\r?\n/)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let invalidLines = [];
    let validLines = [];
    emails.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed === "") return; // ignoring empty lines
      if (!emailRegex.test(trimmed)) {
        invalidLines.push(trimmed)
      } else {
        validLines.push({ label: trimmed, value: trimmed })
      }
    })
    resetField(field)
    setValue(field, validLines)

    if (invalidLines.length > 0)
      toast.error(
        <span className="font-monospace text-white">
          {
            intl.formatMessage({
              defaultMessage: "Datoteku nije moguće pročitati. Svaka linija datoteke bi trebala sadržavati jednu ispravnu email adresu.\n\nPrimjer:\nsuradnik1@email.hr\nsuradnik2@email.hr",
              description: "userstable-invalid-email-toast-fail"
            },
            {
              invalid: invalidLines.join(", ")
            }
          )
          }
        </span>,
        {
          theme: 'colored',
          toastId: 'invalid-emails-imported',
          autoClose: 2500
        }
    )
  }

  useEffect(() => {
    if (collaboratorsEmailFile) {
      validateEmails({
        emailFile: collaboratorsEmailFile,
        field: "collaboratorEmails"
      })
    }
  }, [collaboratorsEmailFile])

  useEffect(() => {
    if (foreignCollaboratorEmailFile) {
      validateEmails({
        emailFile: foreignCollaboratorEmailFile,
        field: "foreignCollaboratorEmails"
      })
    }
  }, [foreignCollaboratorEmailFile])

  function concatenateAndSortUsers(active, inactive) {
    let activeUsers = _.map(active, (user) => {
      return {
        'label': user['username'],
        'value': user['username'],
      }
    })
    let inactiveUsers = _.map(inactive, (user) => {
      return {
        'label': user['username'],
        'value': user['username'],
      }
    })
    let joined = _.orderBy(_.concat(activeUsers, inactiveUsers), ['value'])

    return joined
  }

  const onTableSubmit = (data) => {
    if (!data['collaboratorEmails'] && data['collaboratorUids'].length > 0)
      data['type'] = 'add_internal'
    else
      data['type'] = 'add'

    data['project'] = project['identifier']
    data['projectid'] = project['id']
    onSubmit(data)
  }

  const onTableSignoff = (data) => {
    data['project'] = project['id']
    data['type'] = 'signoff'
    onSubmit(data)
    setCheckJoined(Array(alreadyJoined.length))
  }

  const onInviteDelete = (user) => {
    let email = user['email']
    let projectid = user['project']['id']
    let inviterid = user['inviter']['id']
    let type = 'inviterem'
    onSubmit({
      email, projectid, inviterid, type
    })
  }

  function onChangeCheckOut(i) {
    let tmpArray = [...checkJoined]
    if (tmpArray[i])
      tmpArray[i] = false
    else
      tmpArray[i] = true
    setCheckJoined(tmpArray)
  }

  const onUsersCheckout = () => {
    if (!project.is_active)
      toast.error(
        <span className="font-monospace text-white">
          <FormattedMessage
            defaultMessage="Projekt nije aktivan pa nije moguće odjavljivati suradnike"
            description="userstable-general-toast-invite-fail-3"
          /><br/>
        </span>, {
          theme: 'colored',
          toastId: 'invit-fail-sent',
          autoClose: 2500,
        }
      )
    else {
      let usersToRemove = new Array()

      let anyChecked = _.some(checkJoined, (value) => value === true)
      if (anyChecked) {
        alreadyJoined.map((user, ind) => {
          if (checkJoined[ind])
            usersToRemove.push(user['user']['id'])
        })

        onTableSignoff({
          'remove_users': usersToRemove,
        })
      }
    }
  }

  function uploadFile(event) {
    const reader = new FileReader()
    reader.onload = (event) => {
      setCollaboratorsEmailFile(event.target.result)
    }
    reader.readAsText(event.target.files[0])
  }

  function uploadForeignCollabFile(event) {
    const reader = new FileReader()
    reader.onload = (event) => {
      setForeignCollaboratorEmailFile(event.target.result)
    }
    reader.readAsText(event.target.files[0])
  }

  const filterUser = (firstName, lastName, role, email) => {
    let match = true
    if (searchFirstName)
      match = match && firstName?.toLowerCase().includes(searchFirstName.toLowerCase())
    if (searchLastName)
      match = match && lastName?.toLowerCase().includes(searchLastName.toLowerCase())
    if (searchRole)
      match = match && role?.toLowerCase().includes(searchRole.toLowerCase())
    if (searchEmail)
      match = match && email?.toLowerCase().includes(searchEmail.toLowerCase())
    return match
  }

  const leadRole = intl.formatMessage({ defaultMessage: "Voditelj", description: "users-table-general-leader" })
  const collabRole = intl.formatMessage({ defaultMessage: "Suradnik", description: "users-table-general-collaborator" })
  const foreignCollabRole = intl.formatMessage({ defaultMessage: "Strani suradnik", description: "users-table-general-collaborator-foreign" })

  const showLead = filterUser(lead['user'].first_name, lead['user'].last_name, leadRole, lead['user'].person_mail)

  let filteredJoined = alreadyJoined.filter(u => {
    const role = u['user'].person_type === 'foreign' ? foreignCollabRole : collabRole
    return filterUser(u['user'].first_name, u['user'].last_name, role, u['user'].person_mail)
  })

  let allMembers = []
  if (showLead)
    allMembers.push(lead)
  allMembers = allMembers.concat(filteredJoined)

  if (sortFirstName !== undefined)
    allMembers = _.orderBy(allMembers, [u => u['user'].first_name?.toLowerCase() ?? ''], [sortFirstName ? 'asc' : 'desc'])
  if (sortLastName !== undefined)
    allMembers = _.orderBy(allMembers, [u => u['user'].last_name?.toLowerCase() ?? ''], [sortLastName ? 'asc' : 'desc'])
  if (sortEmail !== undefined)
    allMembers = _.orderBy(allMembers, [u => u['user'].person_mail?.toLowerCase() ?? ''], [sortEmail ? 'asc' : 'desc'])


  const filteredInvites = invites?.filter(user => {
    const role = user.invtype === 'foreign' ? foreignCollabRole : collabRole
    return filterUser(null, null, role, user.email)
  }) || []

  const totalUsers = 1 + alreadyJoined.length + (invites?.length || 0)

  const allTableRows = [
    ...allMembers.map(u => ({ type: 'member', data: u })),
    ...filteredInvites.map(u => ({ type: 'invite', data: u }))
  ]
  const rowVirtualizer = useVirtualizer({
    count: allTableRows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 53,
    overscan: 5,
  })
  const virtualItems = rowVirtualizer.getVirtualItems()
  const paddingTop = virtualItems[0]?.start ?? 0
  const paddingBottom = virtualItems.length > 0
    ? rowVirtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
    : 0

  return (
    <>
      <Row className={amILead ? 'mt-4 ms-1 ps-0 pe-0 me-1 mb-2 ' : 'mt-4 ms-1 me-1 mb-5'}>
        <Col>
          <div
            ref={tableContainerRef}
            style={virtualScroll && totalUsers >= virtualScrollRows
              ? { borderRadius: '0.375rem', height: allTableRows.length >= virtualScrollRows ? `${virtualScrollHeight}px` : 'auto', overflow: 'auto', resize: 'vertical' }
              : { borderRadius: '0.375rem', overflow: 'hidden' }}
          >
          <Table responsive={!virtualScroll || totalUsers < virtualScrollRows} hover className="shadow-sm bg-white" style={{ width: '100%' }}>
            <thead id="hzsi-thead" className="align-middle text-center text-white" style={virtualScroll && totalUsers >= virtualScrollRows ? { position: 'sticky', top: 0, zIndex: 1 } : undefined}>
              <tr>
                <th className="fw-normal">
                  #
                </th>
                <th className="fw-normal" style={{cursor: 'pointer'}} onClick={() => { setSortFirstName(!sortFirstName); setSortLastName(undefined); setSortEmail(undefined) }}>
                  <span className="d-flex">
                    <span className="flex-grow-1">
                      <FormattedMessage
                        defaultMessage="Ime"
                        description="users-table-general-firstname"
                      />
                    </span>
                    { SortArrow(sortFirstName !== undefined ? !sortFirstName : undefined) }
                  </span>
                </th>
                <th className="fw-normal" style={{cursor: 'pointer'}} onClick={() => { setSortLastName(!sortLastName); setSortFirstName(undefined); setSortEmail(undefined) }}>
                  <span className="d-flex">
                    <span className="flex-grow-1">
                      <FormattedMessage
                        defaultMessage="Prezime"
                        description="users-table-general-lastname"
                      />
                    </span>
                    { SortArrow(sortLastName !== undefined ? !sortLastName : undefined) }
                  </span>
                </th>
                <th className="fw-normal">
                  <FormattedMessage
                    defaultMessage="Uloga"
                    description="users-table-general-role"
                  />
                </th>
                <th className="fw-normal" style={{cursor: 'pointer'}} onClick={() => { setSortEmail(!sortEmail); setSortFirstName(undefined); setSortLastName(undefined) }}>
                  <span className="d-flex">
                    <span className="flex-grow-1">
                      <FormattedMessage
                        defaultMessage="Email"
                        description="users-table-general-email"
                      />
                    </span>
                    { SortArrow(sortEmail !== undefined ? !sortEmail : undefined) }
                  </span>
                </th>
                <th className="fw-normal">
                  <FormattedMessage
                    defaultMessage="Prijavljen"
                    description="users-table-general-registered"
                  />
                </th>
                {
                  amILead &&
                  <th className="fw-normal">
                    <FormattedMessage
                      defaultMessage="Odjava"
                      description="users-table-general-signoff"
                    />
                  </th>
                }
              </tr>
            </thead>
            <tbody>
              <>
                {
                  totalUsers > 5 &&
                  <tr>
                    <td className="p-2 align-middle text-center">
                      <FontAwesomeIcon icon={ faSearch } />
                    </td>
                    <td className="p-2 align-middle text-center">
                      <Form.Control
                        value={searchFirstName}
                        onChange={(e) => setSearchFirstName(e.target.value)}
                        placeholder={intl.formatMessage({
                          defaultMessage: "Traži",
                          description: "users-table-general-search-placeholder"
                        })}
                        className="form-control"
                        style={{fontSize: '0.83rem'}}
                      />
                    </td>
                    <td className="p-2 align-middle text-center">
                      <Form.Control
                        value={searchLastName}
                        onChange={(e) => setSearchLastName(e.target.value)}
                        placeholder={intl.formatMessage({
                          defaultMessage: "Traži",
                          description: "users-table-general-search-placeholder"
                        })}
                        className="form-control"
                        style={{fontSize: '0.83rem'}}
                      />
                    </td>
                    <td className="p-2 align-middle text-center">
                    </td>
                    <td className="p-2 align-middle text-center">
                      <Form.Control
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        placeholder={intl.formatMessage({
                          defaultMessage: "Traži",
                          description: "users-table-general-search-placeholder"
                        })}
                        className="form-control"
                        style={{fontSize: '0.83rem'}}
                      />
                    </td>
                    <td className="p-2 align-middle text-center"></td>
                    {
                      amILead &&
                      <td className="p-2 align-middle text-center"></td>
                    }
                  </tr>
                }
                {
                  virtualScroll && totalUsers >= virtualScrollRows && virtualScroll && allTableRows.length >= virtualScrollRows &&
                  <>
                    {paddingTop > 0 && <tr><td colSpan={amILead ? 7 : 6} style={{height: paddingTop, padding: 0, border: 0}} /></tr>}
                    {virtualItems.map(virtualRow => {
                      const row = allTableRows[virtualRow.index]
                      if (row.type === 'member') {
                        const user = row.data
                        const isLeadEntry = user['user']['person_oib'] === lead['user']['person_oib']
                          && user['role']?.name === 'lead'
                        const isMe = user['user']['person_oib'] === userDetails.person_oib
                        return (
                          <tr key={virtualRow.key} className={isMe ? (isLeadEntry ? "table-success fst-italic" : "table-warning fst-italic") : ""}>
                            <td className="p-3 align-middle text-center">{ virtualRow.index + 1 }</td>
                            <td className="p-3 align-middle text-center">{ user['user'].first_name }</td>
                            <td className="p-3 align-middle text-center">{ user['user'].last_name }</td>
                            <td className="align-middle text-center">
                              {
                                isLeadEntry
                                ? <FormattedMessage defaultMessage="Voditelj" description="users-table-general-leader" />
                                : (user['user'].person_type === 'foreign')
                                  ? <FormattedMessage defaultMessage="Strani suradnik" description="users-table-general-collaborator-foreign" />
                                  : <FormattedMessage defaultMessage="Suradnik" description="users-table-general-collaborator" />
                              }
                            </td>
                            <td className="align-middle text-center">{ user['user'].person_mail }</td>
                            <td className="align-middle text-center text-success">
                              <div className="position-relative">
                                <FormattedMessage defaultMessage="Da" description="users-table-general-isadded" />
                                {
                                  user['user'].sshkeys &&
                                  <div id={`Tooltip-key-${project.id}-${virtualRow.index}`} className="text-success position-absolute top-0 ms-4 start-50 translate-middle" onMouseEnter={() => showTooltip(user['user'].person_mail)} onMouseLeave={() => hideTooltip(user['user'].person_mail)}>
                                    <FontAwesomeIcon icon={faKey}/>
                                    <Overlay placement='top' show={isOpened(user['user'].person_mail)} target={document.getElementById(`Tooltip-key-${project.id}-${virtualRow.index}`)}>
                                      {(props) => <Tooltip {...props}><FormattedMessage defaultMessage="Dodan javni ključ" description="users-table-general-keyadd" /></Tooltip>}
                                    </Overlay>
                                  </div>
                                }
                              </div>
                            </td>
                            {amILead && <td className="align-middle text-center text-success">
                              {isLeadEntry ? '\u2212' : <Form.Check><Form.Check.Input type="checkbox" className="bg-danger border border-danger ms-1" checked={checkJoined[alreadyJoined.indexOf(user)] === true} onChange={() => onChangeCheckOut(alreadyJoined.indexOf(user))} /></Form.Check>}
                            </td>}
                          </tr>
                        )
                      } else {
                        const user = row.data
                        return (
                          <tr key={virtualRow.key}>
                            <td className="p-3 align-middle text-center">{ virtualRow.index + 1 }</td>
                            <td className="p-3 align-middle text-center">{ '\u2212' }</td>
                            <td className="p-3 align-middle text-center">{ '\u2212' }</td>
                            <td className="align-middle text-center">
                              {(user.invtype === 'foreign')
                                ? <FormattedMessage defaultMessage="Strani suradnik" description="users-table-general-collaborator-foreign" />
                                : <FormattedMessage defaultMessage="Suradnik" description="users-table-general-collaborator" />
                              }
                            </td>
                            <td className="align-middle text-center">{ user.email }</td>
                            <td className="align-middle text-center">
                              <div className="position-relative">
                                <FontAwesomeIcon className="text-success fa-lg" id={`Tooltip-inv-${project.id}-${virtualRow.index}`} icon={faEnvelope} onMouseEnter={() => showTooltip(user.email)} onMouseLeave={() => hideTooltip(user.email)}/>
                                <Overlay placement='top' show={isOpened(user.email)} target={document.getElementById(`Tooltip-inv-${project.id}-${virtualRow.index}`)}>
                                  {(props) => <Tooltip {...props}><FormattedMessage defaultMessage="Aktivna pozivnica poslana na email" description="users-table-general-invitesent" /></Tooltip>}
                                </Overlay>
                                <div className="position-absolute top-0 ms-4 start-50 translate-middle">
                                  <Button className="d-flex align-items-center justify-content-center ms-1 ps-1 pe-1 pt-0 pb-0 mt-0" variant="light" onClick={() => onInviteDelete(user)}>
                                    <FontAwesomeIcon color="#DC3545" icon={faXmark}/>
                                  </Button>
                                </div>
                              </div>
                            </td>
                            {amILead && <td className="align-middle text-center">{'\u2212'}</td>}
                          </tr>
                        )
                      }
                    })}
                    {paddingBottom > 0 && <tr><td colSpan={amILead ? 7 : 6} style={{height: paddingBottom, padding: 0, border: 0}} /></tr>}
                  </>
                }
                {
                  (!virtualScroll || totalUsers < virtualScrollRows || !virtualScroll || allTableRows.length < virtualScrollRows) && allMembers.length > 0 && allMembers.map((user, i) => {
                    const isLeadEntry = user['user']['person_oib'] === lead['user']['person_oib']
                      && user['role']?.name === 'lead'
                    const isMe = user['user']['person_oib'] === userDetails.person_oib
                    return (
                      <tr key={`row-${i}`} className={isMe ? (isLeadEntry ? "table-success fst-italic" : "table-warning fst-italic") : ""}>
                        <td className="p-3 align-middle text-center">
                          { i + 1 }
                        </td>
                        <td className="p-3 align-middle text-center">
                          { user['user'].first_name }
                        </td>
                        <td className="p-3 align-middle text-center">
                          { user['user'].last_name }
                        </td>
                        <td className="align-middle text-center">
                          {
                            isLeadEntry
                            ?
                              <FormattedMessage
                                defaultMessage="Voditelj"
                                description="users-table-general-leader"
                              />
                            :
                              (user['user'].person_type === 'foreign')
                              ?
                                <FormattedMessage
                                  defaultMessage="Strani suradnik"
                                  description="users-table-general-collaborator-foreign"
                                />
                              :
                                <FormattedMessage
                                  defaultMessage="Suradnik"
                                  description="users-table-general-collaborator"
                                />
                          }
                        </td>
                        <td className="align-middle text-center">
                          { user['user'].person_mail }
                        </td>
                        <td className="align-middle text-center text-success">
                          <div className="position-relative">
                            <FormattedMessage
                              defaultMessage="Da"
                              description="users-table-general-isadded"
                            />
                            {
                              user['user'].sshkeys &&
                                <div id={`Tooltip-key-${project.id}-${i}`} className="text-success position-absolute top-0 ms-4 start-50 translate-middle" onMouseEnter={() => showTooltip(user['user'].person_mail)} onMouseLeave={() => hideTooltip(user['user'].person_mail)}>
                                  <FontAwesomeIcon icon={faKey}/>
                                  <Overlay
                                    placement='top'
                                    show={isOpened(user['user'].person_mail)}
                                    target={document.getElementById(`Tooltip-key-${project.id}-${i}`)}
                                  >
                                    {(props) => <Tooltip {...props}>
                                      <FormattedMessage
                                        defaultMessage="Dodan javni ključ"
                                        description="users-table-general-keyadd"
                                      />
                                    </Tooltip>}
                                  </Overlay>
                                </div>
                            }
                          </div>
                        </td>
                        {
                          amILead &&
                          <td className="align-middle text-center text-success">
                            {
                              isLeadEntry
                              ? '\u2212'
                              :
                                <>
                                  <Form.Check>
                                    <Form.Check.Input type="checkbox" className="bg-danger border border-danger ms-1"
                                      checked={checkJoined[alreadyJoined.indexOf(user)] === true}
                                      onChange={() => onChangeCheckOut(alreadyJoined.indexOf(user))}
                                    />
                                  </Form.Check>
                                </>
                            }
                          </td>
                        }
                      </tr>
                    )
                  })
                }
                {
                  (!virtualScroll || totalUsers < virtualScrollRows || !virtualScroll || allTableRows.length < virtualScrollRows) && filteredInvites.length > 0 && filteredInvites.map((user, i) => (
                    <tr key={`row-${i + 100}`}>
                      <td className="p-3 align-middle text-center">
                        { allMembers.length + i + 1 }
                      </td>
                      <td className="p-3 align-middle text-center">
                        { '\u2212' }
                      </td>
                      <td className="p-3 align-middle text-center">
                        { '\u2212' }
                      </td>
                      <td className="align-middle text-center">
                        {
                          (user.invtype === 'foreign') ?
                            <FormattedMessage
                              defaultMessage="Strani suradnik"
                              description="users-table-general-collaborator-foreign"
                            />
                          :
                            <FormattedMessage
                              defaultMessage="Suradnik"
                              description="users-table-general-collaborator"
                            />
                        }
                      </td>
                      <td className="align-middle text-center">
                        { user.email }
                      </td>
                      <td className="align-middle text-center">
                        <div className="position-relative">
                          <FontAwesomeIcon className="text-success fa-lg" id={`Tooltip-inv-${project.id}-${i}`} icon={faEnvelope} onMouseEnter={() => showTooltip(user.email)} onMouseLeave={() => hideTooltip(user.email)}/>
                          <Overlay
                            placement='top'
                            show={isOpened(user.email)}
                            target={document.getElementById(`Tooltip-inv-${project.id}-${i}`)}
                          >
                            {(props) => <Tooltip {...props}>
                              <FormattedMessage
                                defaultMessage="Aktivna pozivnica poslana na email"
                                description="users-table-general-invitesent"
                              />
                            </Tooltip>}
                          </Overlay>
                          <div className="position-absolute top-0 ms-4 start-50 translate-middle">
                            <Button className="d-flex align-items-center justify-content-center ms-1 ps-1 pe-1 pt-0 pb-0 mt-0"
                              variant="light"
                              onClick={() => onInviteDelete(user)}
                            >
                              <FontAwesomeIcon color="#DC3545" icon={faXmark}/>
                            </Button>
                          </div>
                        </div>
                      </td>
                      {
                        amILead &&
                        <td className="align-middle text-center">
                          {'\u2212'}
                        </td>
                      }
                    </tr>
                  ))
                }
              </>
            </tbody>
          </Table>
          </div>
        </Col>
      </Row>
      {
        amILead &&
          <Form onSubmit={handleSubmit(onTableSubmit)} className="needs-validation">
            <Row className="mt-3 mb-5">
              <Col>
                <Row>
                  <Col className="d-flex justify-content-center flex-column flex-md-row align-items-center">
                    <Button
                      variant="danger"
                      active={!_.some(checkJoined, (value) => value === true)}
                      onClick={() => onUsersCheckout()}
                      className="me-2"
                    >
                      <FontAwesomeIcon icon={faXmark}/>{' '}
                      <FormattedMessage
                        defaultMessage="Odjavi suradnike"
                        description="users-table-general-collabsignoff"
                      />
                    </Button>
                    <Button variant="primary" active={isOpen} onClick={toggle} className="ms-0 ms-md-2 mt-2 mt-md-0">
                      <FontAwesomeIcon icon={faArrowDown}/>{' '}
                      <FormattedMessage
                        defaultMessage="Pozovi suradnike"
                        description="users-table-general-collabcall"
                      />
                    </Button>
                    {
                      (project.project_type['name'] === 'practical') &&
                      <Button active={isOpen3} variant="info" className="ms-0 ms-md-3 mt-2 mt-md-0" onClick={toggle3}>
                        <FontAwesomeIcon icon={faArrowDown}/>{' '}
                        <FormattedMessage
                          defaultMessage="Pozovi strane suradnike"
                          description="users-table-general-foreign-collabcall-2"
                        />
                      </Button>
                    }
                    {
                      (project.project_type['name'] === 'internal' || project.project_type['name'] === 'srce-workshop')
                      && (userDetails.is_staff || userDetails.is_superuser) &&
                      <Button variant="success" active={isOpen2} onClick={toggle2} className="ms-0 ms-md-3 mt-2 mt-md-0">
                        <FontAwesomeIcon icon={faPlus}/>{' '}
                        <FormattedMessage
                          defaultMessage="Dodaj suradnike"
                          description="users-table-general-collabadd"
                        />
                      </Button>
                    }
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col md={{span: 8, offset: 2}} className="d-flex justify-content-center">
                    <Collapse in={isOpen} style={{width: '80%'}}>
                      <Card className="ps-4 pe-4 pt-4">
                        <Card.Title>
                          <Row className="no-gutters">
                            <Col md={{ span: 10 }}>
                              <FormattedMessage
                                defaultMessage="Upišite email adrese suradnika koje želite pozvati na projekt ili učitajte iz datoteke"
                                description="users-table-general-cardtitle-1"
                              />
                            </Col>
                            <Col md={{ span: 2 }} className="text-center p-0">
                              <Form.Control
                                type='file'
                                id="fileInput"
                                className="d-none"
                                ref={ refFileCollaboratorsInput }
                                onChange={ (e) => { uploadFile(e) }}
                              />
                              <Button className="d-inline-flex align-items-center" size="sm" variant="success" onClick={() => refFileCollaboratorsInput.current.click()}>
                                <FontAwesomeIcon className="me-2" icon={faFile}/>{' '}
                                <FormattedMessage
                                  defaultMessage="Učitaj"
                                  description="publickeys-add-load"
                                />
                              </Button>
                            </Col>
                          </Row>
                        </Card.Title>
                        <Card.Body className="mb-4">
                          <Controller
                            name="collaboratorEmails"
                            control={control}
                            render={ ({field}) =>
                              <CustomCreatableSelect
                                name="collaboratorEmails"
                                forwardedRef={field.ref}
                                value={ field.value }
                                placeholder={intl.formatMessage({
                                  defaultMessage: "suradnik1@email.hr ENTER/TAB suradnik2@email.hr...",
                                  description: "users-table-general-placeholder-2"
                                })}
                                fontSize="18px"
                                onChange={(e) => setValue('collaboratorEmails', e)}
                              />
                            }
                          />
                          <div className="d-flex align-items-center justify-content-center">
                            <Button className="mt-4 mb-1" variant="success" id="submit-button" type="submit">
                              <FontAwesomeIcon icon={faPaperPlane}/>{' '}
                              <FormattedMessage
                                defaultMessage="Pošalji poveznice za prijavu"
                                description="users-table-general-invite-send"
                              />
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Collapse>
                    {
                      (project.project_type['name'] === 'practical') &&
                      <Collapse in={isOpen3} style={{width: '80%'}}>
                        <Card className="ps-4 pe-4 pt-4">
                          <Card.Title>
                            <Row className="no-gutters">
                              <Col md={{ span: 10 }}>
                                <FormattedMessage
                                  defaultMessage="Upišite email adrese stranih suradnika koje želite pozvati na projekt ili učitajte datoteku"
                                  description="users-table-general-cardtitle-3"
                                />
                              </Col>
                              <Col md={{ span: 2 }} className="text-center p-0">
                                <Form.Control
                                  type='file'
                                  id="fileInput"
                                  className="d-none"
                                  ref={ refFileForeignCollaboratorsInput }
                                  onChange={ (e) => { uploadForeignCollabFile(e) }}
                                />
                                <Button className="d-inline-flex align-items-center" size="sm" variant="success" onClick={() => refFileForeignCollaboratorsInput.current.click()}>
                                  <FontAwesomeIcon icon={faFile}/>{' '}
                                  <FormattedMessage
                                    defaultMessage="Učitaj"
                                    description="publickeys-add-load"
                                  />
                                </Button>
                              </Col>
                            </Row>
                          </Card.Title>
                          <Card.Body className="mb-4">
                            <Controller
                              name="foreignCollaboratorEmails"
                              control={control}
                              render={ ({field}) =>
                                <CustomCreatableSelect
                                  name="foreignCollaboratorEmails"
                                  forwardedRef={field.ref}
                                  value={ field.value }
                                  placeholder={intl.formatMessage({
                                    defaultMessage: "suradnik1@email.de ENTER/TAB suradnik2@email.uk...",
                                    description: "users-table-general-placeholder-2"
                                  })}
                                  fontSize="18px"
                                  onChange={(e) => setValue('foreignCollaboratorEmails', e)}
                                />
                              }
                            />
                            <div className="d-flex align-items-center justify-content-center">
                              <Button className="mt-4 mb-1" variant="success" id="submit-button" type="submit">
                                <FontAwesomeIcon icon={faPaperPlane}/>{' '}
                                <FormattedMessage
                                  defaultMessage="Pošalji poveznice za prijavu"
                                  description="users-table-general-invite-send"
                                />
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Collapse>
                    }
                  </Col>
                </Row>
                {
                  (project.project_type['name'] === 'internal' || project.project_type['name'] === 'srce-workshop')
                  && (userDetails.is_staff || userDetails.is_superuser) &&
                  <Row className="mt-4">
                    <Col md={{span: 8, offset: 2}} className="d-flex justify-content-center">
                      <Collapse in={isOpen2} style={{width: '80%'}}>
                        <Card className="ps-4 pe-4 pt-4">
                          <Card.Title>
                            <FormattedMessage
                              defaultMessage="Korisničke oznake suradnika koje želiš na projektu"
                              description="users-table-general-cardtitle-2"
                            />
                          </Card.Title>
                          <Card.Body className="mb-4">
                            <Controller
                              name="collaboratorUids"
                              control={control}
                              render={ ({field}) =>
                                <CustomReactSelect
                                  name="collaboratorUids"
                                  forwardedRef={field.ref}
                                  placeholder={intl.formatMessage({
                                    defaultMessage: "Odaberi...",
                                    description: "users-table-general-placeholder"
                                  })}
                                  fontSize="16px"
                                  closeMenuOnSelect={false}
                                  collaboratorsFixedMultiValue
                                  isMulti
                                  options={concatenateAndSortUsers(dataActiveUsers, dataInactiveUsers)}
                                  onChange={(e) => setValue('collaboratorUids', e)}
                                />
                              }
                            />
                            <div className="d-flex align-items-center justify-content-center">
                              <Button className="mt-4 mb-1" variant="success" id="submit-button" type="submit">
                                <FontAwesomeIcon icon={faCheck}/>{' '}
                                <FormattedMessage
                                  defaultMessage="Potvrdi"
                                  description="users-table-general-confirm"
                                />
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Collapse>
                    </Col>
                  </Row>
                }
              </Col>
            </Row>
          </Form>
      }
    </>
  )
}
