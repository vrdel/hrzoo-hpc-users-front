import React, { useContext, useState, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Col, Collapse, Row, Card,
  Table, Button, Form, Overlay, Tooltip } from 'react-bootstrap';
import { useForm, Controller } from 'react-hook-form';
import { AuthContext } from 'Components/AuthContextProvider';
import { CustomReactSelect, CustomCreatableSelect } from 'Components/CustomReactSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faPaperPlane,
  faArrowDown,
  faXmark,
  faKey,
  faSearch
} from '@fortawesome/free-solid-svg-icons';

import { extractUsers, extractEmails, emailInInvites } from 'Utils/invites-extracts';
import { toast } from 'react-toastify';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl'
import { useOpenedIndexMap } from 'Hooks/indexed-map'
import _ from 'lodash';


export const UsersTableCroris = ({project, invites, onSubmit}) => {
  const { userDetails } = useContext(AuthContext);
  const [emailInvites, setEmailInvites] = useState(undefined)
  const collaborators = project['croris_collaborators']
  const lead = extractUsers(project.userproject_set, 'lead')[0]
  const alreadyJoined = extractUsers(project.userproject_set, 'collaborator')
  let oibsJoined = new Set()
  alreadyJoined.forEach(user => oibsJoined.add(user['user']['person_oib']))
  const amILead = lead['user']['person_oib'] === userDetails.person_oib
  const [checkJoined, setCheckJoined] = useState(Array(alreadyJoined.length))
  const intl = useIntl()
  const { isOpen: isOpened, openIndex: showTooltip, closeIndex: hideTooltip } = useOpenedIndexMap()

  const [searchFirstName, setSearchFirstName] = useState('')
  const [searchLastName, setSearchLastName] = useState('')
  const [searchEmail, setSearchEmail] = useState('')

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => {
    if (project.is_active)
      setIsOpen(!isOpen);
    else
      toast.error(
        <span className="font-monospace text-white">
          <FormattedMessage
            defaultMessage="Projekt nije aktivan pa nije moguće pozivati suradnike"
            description="userstable-croris-toast-invite-fail"
          />
          <br/>
        </span>, {
          theme: 'colored',
          toastId: 'invit-fail-sent',
          autoClose: 2500,
        }
      )
  }

  const [isOpen2, setIsOpen2] = useState(false);
  const toggle2 = () => {
    if (project.is_active)
      return setIsOpen2(!isOpen2);
    else
      toast.error(
        <span className="font-monospace text-white">
          <FormattedMessage
            defaultMessage="Projekt nije aktivan pa nije moguće pozivati suradnike"
            description="userstable-croris-toast-invite-fail"
          /><br/>
        </span>, {
          theme: 'colored',
          toastId: 'invit-fail-sent',
          autoClose: 2500,
        }
      )
  }

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      collaboratorEmails: '',
      foreignCollaboratorEmails: ''
    }
  });

  const onTableSubmit = (data) => {
    data['project'] = project['identifier']
    data['type'] = 'add'
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
    let projectid = project['id']
    let inviterid = userDetails['id']
    let type = 'inviterem'
    onSubmit({
      email, projectid, inviterid, type
    })
    setIsOpen(false)
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
            description="userstable-croris-toast-invite-fail-2"
          />
          <br/>
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

  useEffect(() => {
    setEmailInvites(invites)
  }, [invites])

  const filterUser = (firstName, lastName, role, email) => {
    let match = true
    if (searchFirstName)
      match = match && firstName?.toLowerCase().includes(searchFirstName.toLowerCase())
    if (searchLastName)
      match = match && lastName?.toLowerCase().includes(searchLastName.toLowerCase())
    if (searchEmail)
      match = match && email?.toLowerCase().includes(searchEmail.toLowerCase())
    return match
  }

  const leadRole = intl.formatMessage({ defaultMessage: "Voditelj", description: "users-table-croris-lead" })
  const collabRole = intl.formatMessage({ defaultMessage: "Suradnik", description: "users-table-croris-collaborator" })
  const foreignCollabRole = intl.formatMessage({ defaultMessage: "Strani suradnik", description: "users-table-general-collaborator-foreign" })

  const showLead = filterUser(lead['user'].first_name, lead['user'].last_name, leadRole, lead['user'].person_mail)

  let filteredJoined = alreadyJoined.filter(u => {
    const role = u['user']['person_type'] === 'local' ? collabRole : foreignCollabRole
    return filterUser(u['user'].first_name, u['user'].last_name, role, u['user'].person_mail)
  })

  let allMembers = []
  if (showLead)
    allMembers.push(lead)
  allMembers = allMembers.concat(filteredJoined)

  const email_invites_outer = emailInvites?.map(i => i.email) ?? []
  const notJoinedCollaborators = collaborators.filter(u => !oibsJoined.has(u['oib']))
  const filteredCollaborators = notJoinedCollaborators.filter(u =>
    filterUser(u.first_name, u.last_name, collabRole, u.email)
  )
  const collabEmails = collaborators.map(user => user.email)
  const foreignInvites = email_invites_outer.filter(email => collabEmails.indexOf(email) === -1)
  const filteredForeignInvites = foreignInvites.filter(email =>
    filterUser(null, null, foreignCollabRole, email)
  )
  const totalUsers = 1 + alreadyJoined.length + notJoinedCollaborators.length + foreignInvites.length

  const allTableRows = [
    ...allMembers.map(u => ({ type: 'member', data: u })),
    ...filteredCollaborators.map(u => ({ type: 'collab', data: u })),
    ...filteredForeignInvites.map(email => ({ type: 'finvite', data: email }))
  ]

  const tableContainerRef = useRef(null)
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

  if (emailInvites !== undefined) {
    let email_invites = emailInvites.map(i => i.email)

    const missingCollab = new Array()
    collaborators.forEach((user) => {
      if (!oibsJoined.has(user['oib'])) {
        if (user['email'].includes(';')) {
          let emails = user['email'].split(';')
          for (var email of emails)
            if (email_invites.indexOf(email.trim()) === -1)
              missingCollab.push({...user, email: email.trim()})
        }
        else
          if (user['email'] && email_invites.indexOf(user['email']) === -1)
            missingCollab.push(user)
      }
    })

    let collabNoEmail = true
    for (var collab of missingCollab)
      if (collab['email'])
        collabNoEmail = false

    return (
      <>
        <Row className={amILead ? 'mt-4 ms-0 me-0 mb-2 p-0' : 'p-0 mt-4 ms-0 me-0 mb-5'}>
          <Col>
            <div
              ref={tableContainerRef}
              style={totalUsers >= 15 ? { height: '600px', overflow: 'auto' } : undefined}
            >
            <Table responsive={totalUsers < 15} hover className="shadow-sm bg-white m-0">
              <thead id="hzsi-thead" className="align-middle text-center text-white" style={totalUsers >= 15 ? { position: 'sticky', top: 0, zIndex: 1 } : undefined}>
                <tr>
                  <th className="fw-normal" style={{width: '52px'}}>
                    #
                  </th>
                  <th className="fw-normal">
                    <FormattedMessage
                      defaultMessage="Ime"
                      description="users-table-croris-firstname"
                    />
                  </th>
                  <th className="fw-normal">
                    <FormattedMessage
                      defaultMessage="Prezime"
                      description="users-table-croris-lastname"
                    />
                  </th>
                  <th className="fw-normal">
                    <FormattedMessage
                      defaultMessage="Uloga"
                      description="users-table-croris-role"
                    />
                  </th>
                  <th className="fw-normal">
                    <FormattedMessage
                      defaultMessage="Email"
                      description="users-table-croris-email"
                    />
                  </th>
                  <th className="fw-normal" style={{minWidth: '180px'}}>
                    <FormattedMessage
                      defaultMessage="CroRIS registracija"
                      description="users-table-croris-crorisreg"
                    />
                  </th>
                  <th className="fw-normal">
                    <FormattedMessage
                      defaultMessage="Prijavljen"
                      description="users-table-croris-registered"
                    />
                  </th>
                  {
                    amILead &&
                    <th className="fw-normal">
                      <FormattedMessage
                        defaultMessage="Odjava"
                        description="users-table-croris-signoff"
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
                            description: "users-table-croris-search-placeholder"
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
                            description: "users-table-croris-search-placeholder"
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
                            description: "users-table-croris-search-placeholder"
                          })}
                          className="form-control"
                          style={{fontSize: '0.83rem'}}
                        />
                      </td>
                      <td className="p-2 align-middle text-center"></td>
                      <td className="p-2 align-middle text-center"></td>
                      {
                        amILead &&
                        <td className="p-2 align-middle text-center"></td>
                      }
                    </tr>
                  }
                  {
                    totalUsers >= 15 &&
                    <>
                      {paddingTop > 0 && <tr><td colSpan={amILead ? 8 : 7} style={{height: paddingTop, padding: 0, border: 0}} /></tr>}
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
                                  ?
                                    <FormattedMessage defaultMessage="Voditelj" description="users-table-croris-lead" />
                                  :
                                    user['user']['person_type'] === 'local'
                                    ?
                                      <FormattedMessage defaultMessage="Suradnik" description="users-table-croris-collaborator" />
                                    :
                                      <FormattedMessage defaultMessage="Strani suradnik" description="users-table-general-collaborator-foreign" />
                                }
                              </td>
                              <td className="align-middle text-center">{ extractEmails(user['user'].person_mail) }</td>
                              <td className="align-middle text-center text-success">
                                {
                                  isLeadEntry || user['user']['person_type'] === 'local'
                                  ?
                                    <span className="text-success"><FormattedMessage defaultMessage="Da" description="users-table-croris-yes" /></span>
                                  :
                                    <span className="text-danger"><FormattedMessage defaultMessage="Ne" description="users-table-croris-no" /></span>
                                }
                              </td>
                              <td className="align-middle text-center text-success">
                                <div className="position-relative">
                                  <FormattedMessage defaultMessage="Da" description="users-table-croris-yes" />
                                  {
                                    user['user'].sshkeys &&
                                      <div id={`Tooltip-key-${project.id}-${virtualRow.index}`} className="text-success position-absolute top-0 ms-4 start-50 translate-middle" onMouseEnter={() => showTooltip(user['user'].person_mail)} onMouseLeave={() => hideTooltip(user['user'].person_mail)}>
                                        <FontAwesomeIcon icon={faKey}/>
                                        <Overlay placement='top' show={isOpened(user['user'].person_mail)} target={document.getElementById(`Tooltip-key-${project.id}-${virtualRow.index}`)}>
                                          {(props) => <Tooltip {...props}><FormattedMessage defaultMessage="Dodan javni ključ" description="users-table-croris-keyadd" /></Tooltip>}
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
                                      <Form.Check>
                                        <Form.Check.Input type="checkbox" className="bg-danger border border-danger ms-1"
                                          checked={checkJoined[alreadyJoined.indexOf(user)] === true}
                                          onChange={() => onChangeCheckOut(alreadyJoined.indexOf(user))}
                                        />
                                      </Form.Check>
                                  }
                                </td>
                              }
                            </tr>
                          )
                        } else if (row.type === 'collab') {
                          const user = row.data
                          return (
                            <tr key={virtualRow.key}>
                              <td className="p-3 align-middle text-center">{ virtualRow.index + 1 }</td>
                              <td className="p-3 align-middle text-center">{ user.first_name }</td>
                              <td className="p-3 align-middle text-center">{ user.last_name }</td>
                              <td className="align-middle text-center">
                                <FormattedMessage defaultMessage="Suradnik" description="users-table-croris-collaborator" />
                              </td>
                              <td className="align-middle text-center">
                                { user.email ? extractEmails(user.email) : '\u2212' }
                              </td>
                              <td className="align-middle text-center">
                                {
                                  user.email
                                    ?
                                      <span className="text-success"><FormattedMessage defaultMessage="Da" description="users-table-croris-yes" /></span>
                                    :
                                      <span className="text-danger"><FormattedMessage defaultMessage="Ne" description="users-table-croris-no" /></span>
                                }
                              </td>
                              <td className="align-middle text-center">
                                {
                                  emailInInvites(user.email, email_invites)
                                    ?
                                      <div className="position-relative">
                                        <FontAwesomeIcon id={`Tooltip-inv-${project.id}-${virtualRow.index}`} className="text-success fa-lg" icon={faEnvelope} onMouseEnter={() => showTooltip(user.email)} onMouseLeave={() => hideTooltip(user.email)}/>
                                        <Overlay placement='top' show={isOpened(user.email)} target={document.getElementById(`Tooltip-inv-${project.id}-${virtualRow.index}`)}>
                                          {(props) => <Tooltip {...props}><FormattedMessage defaultMessage="Aktivna pozivnica poslana na email" description="users-table-croris-invitesent" /></Tooltip>}
                                        </Overlay>
                                        <div className="position-absolute top-0 ms-4 start-50 translate-middle">
                                          <Button className="d-flex align-items-center justify-content-center ms-1 ps-1 pe-1 pt-0 pb-0 mt-0" variant="light" onClick={() => onInviteDelete(user)}>
                                            <FontAwesomeIcon color="#DC3545" icon={faXmark}/>
                                          </Button>
                                        </div>
                                      </div>
                                    :
                                      <span className="text-danger"><FormattedMessage defaultMessage="Ne" description="users-table-croris-no" /></span>
                                }
                              </td>
                              { amILead && <td className="align-middle text-center">{'\u2212'}</td> }
                            </tr>
                          )
                        } else {
                          const email = row.data
                          return (
                            <tr key={virtualRow.key}>
                              <td className="p-3 align-middle text-center">{ virtualRow.index + 1 }</td>
                              <td className="p-3 align-middle text-center">{ '\u2212' }</td>
                              <td className="p-3 align-middle text-center">{ '\u2212' }</td>
                              <td className="align-middle text-center">
                                <FormattedMessage defaultMessage="Strani suradnik" description="users-table-general-collaborator-foreign" />
                              </td>
                              <td className="align-middle text-center">{ email }</td>
                              <td className="align-middle text-center">{'\u2212'}</td>
                              <td className="align-middle text-center">
                                <div className="position-relative">
                                  <FontAwesomeIcon className="text-success fa-lg" id={`Tooltip-finv-${project.id}-${virtualRow.index}`} icon={faEnvelope} onMouseEnter={() => showTooltip(email)} onMouseLeave={() => hideTooltip(email)}/>
                                  <Overlay placement='top' show={isOpened(email)} target={document.getElementById(`Tooltip-finv-${project.id}-${virtualRow.index}`)}>
                                    {(props) => <Tooltip {...props}><FormattedMessage defaultMessage="Aktivna pozivnica poslana na email" description="users-table-general-invitesent" /></Tooltip>}
                                  </Overlay>
                                  <div className="position-absolute top-0 ms-4 start-50 translate-middle">
                                    <Button className="d-flex align-items-center justify-content-center ms-1 ps-1 pe-1 pt-0 pb-0 mt-0" variant="light" onClick={() => onInviteDelete({ email })}>
                                      <FontAwesomeIcon color="#DC3545" icon={faXmark}/>
                                    </Button>
                                  </div>
                                </div>
                              </td>
                              { amILead && <td className="align-middle text-center">{'\u2212'}</td> }
                            </tr>
                          )
                        }
                      })}
                      {paddingBottom > 0 && <tr><td colSpan={amILead ? 8 : 7} style={{height: paddingBottom, padding: 0, border: 0}} /></tr>}
                    </>
                  }
                  {
                    totalUsers < 15 && allMembers.length > 0 && allMembers.map((user, i) => {
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
                                  description="users-table-croris-lead"
                                />
                              :
                                user['user']['person_type'] === 'local'
                                ?
                                  <FormattedMessage
                                    defaultMessage="Suradnik"
                                    description="users-table-croris-collaborator"
                                  />
                                :
                                  <FormattedMessage
                                    defaultMessage="Strani suradnik"
                                    description="users-table-general-collaborator-foreign"
                                  />
                            }
                          </td>
                          <td className="align-middle text-center">
                            { extractEmails(user['user'].person_mail) }
                          </td>
                          <td className="align-middle text-center text-success">
                            {
                              isLeadEntry || user['user']['person_type'] === 'local'
                              ?
                                <span className="text-success">
                                  <FormattedMessage
                                    defaultMessage="Da"
                                    description="users-table-croris-yes"
                                  />
                                </span>
                              :
                                <span className="text-danger">
                                  <FormattedMessage
                                    defaultMessage="Ne"
                                    description="users-table-croris-no"
                                  />
                                </span>
                            }
                          </td>
                          <td className="align-middle text-center text-success">
                            <div className="position-relative">
                              <FormattedMessage
                                defaultMessage="Da"
                                description="users-table-croris-yes"
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
                                          description="users-table-croris-keyadd"
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
                    totalUsers < 15 && filteredCollaborators.length > 0 && filteredCollaborators.map((user, i) =>
                        (
                          <tr key={`row-${i + 100}`}>
                            <td className="p-3 align-middle text-center">
                              { allMembers.length + i + 1 }
                            </td>
                            <td className={
                              user['user']?.oib === userDetails.person_oib
                              ? "p-3 align-middle text-center fst-italic border-bottom border-secondary"
                              : "p-3 align-middle text-center"
                              }>
                              { user.first_name }
                            </td>
                            <td className={
                              user['user']?.oib === userDetails.person_oib
                              ? "p-3 align-middle text-center fst-italic border-bottom border-secondary"
                              : "p-3 align-middle text-center"
                            }>
                              { user.last_name }
                            </td>
                            <td className={
                              user['user']?.oib === userDetails.person_oib
                              ? "align-middle text-center fst-italic border-bottom border-secondary"
                              : "align-middle text-center"
                            }>
                              <FormattedMessage
                                defaultMessage="Suradnik"
                                description="users-table-croris-collaborator"
                              />
                            </td>
                            <td className={
                              user['user']?.oib === userDetails.person_oib
                              ? "align-middle text-center fst-italic border-bottom border-secondary"
                              : "align-middle text-center"
                            }>
                              {
                                user.email
                                ?
                                  extractEmails(user.email)
                                :
                                  '\u2212'
                              }
                            </td>
                            <td className={
                              user['user']?.oib === userDetails.person_oib
                              ? "align-middle text-center fst-italic border-bottom border-secondary"
                              : "align-middle text-center"
                            }>
                              {
                                user.email
                                  ?
                                    <span className="text-success">
                                      <FormattedMessage
                                        defaultMessage="Da"
                                        description="users-table-croris-yes"
                                      />
                                    </span>
                                  :
                                    <span className="text-danger">
                                      <FormattedMessage
                                        defaultMessage="Ne"
                                        description="users-table-croris-no"
                                      />
                                    </span>
                              }
                            </td>
                            <td className={
                              user['user']?.oib === userDetails.person_oib
                              ? "align-middle text-center fst-italic border-bottom border-secondary"
                              : "align-middle text-center"
                              }
                            >
                              {
                                emailInInvites(user.email, email_invites)
                                  ?
                                    <div className="position-relative">
                                      <FontAwesomeIcon
                                        id={`Tooltip-inv-${project.id}-${i}`}
                                        className="text-success fa-lg"
                                        icon={faEnvelope}
                                        onMouseEnter={() => showTooltip(user.email)}
                                        onMouseLeave={() => hideTooltip(user.email)}
                                      />
                                      <Overlay
                                        placement='top'
                                        show={isOpened(user.email)}
                                        target={document.getElementById(`Tooltip-inv-${project.id}-${i}`)}
                                      >
                                        {(props) => <Tooltip {...props}>
                                          <FormattedMessage
                                            defaultMessage="Aktivna pozivnica poslana na email"
                                            description="users-table-croris-invitesent"
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
                                  :
                                    <span className="text-danger">
                                      <FormattedMessage
                                        defaultMessage="Ne"
                                        description="users-table-croris-no"
                                      />
                                    </span>
                              }
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
                  {
                    totalUsers < 15 && filteredForeignInvites.length > 0 && filteredForeignInvites.map((email, i) => (
                      <tr key={`row-${i + 100}`}>
                        <td className="p-3 align-middle text-center">
                          { allMembers.length + filteredCollaborators.length + i + 1 }
                        </td>
                        <td className="p-3 align-middle text-center">
                          { '\u2212' }
                        </td>
                        <td className="p-3 align-middle text-center">
                          { '\u2212' }
                        </td>
                        <td className="align-middle text-center">
                          <FormattedMessage
                            defaultMessage="Strani suradnik"
                            description="users-table-general-collaborator-foreign"
                          />
                        </td>
                        <td className="align-middle text-center">
                          { email }
                        </td>
                        <td className="align-middle text-center">
                          {'\u2212'}
                        </td>
                        <td className="align-middle text-center">
                          <div className="position-relative">
                            <FontAwesomeIcon className="text-success fa-lg" id={`Tooltip-finv-${project.id}-${i}`} icon={faEnvelope} onMouseEnter={() => showTooltip(email)} onMouseLeave={() => hideTooltip(email)}/>
                            <Overlay
                              placement='top'
                              show={isOpened(email)}
                              target={document.getElementById(`Tooltip-finv-${project.id}-${i}`)}
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
                                onClick={() => onInviteDelete(
                                  {
                                    email
                                  }
                                )}
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
          amILead > 0 &&
            <Form onSubmit={handleSubmit(onTableSubmit)} className="needs-validation">
              <Row className="mt-3 mb-5">
                <Col>
                  <Row>
                    <Col className="d-flex justify-content-center flex-column flex-lg-row align-items-center">
                      <Button
                        variant="danger"
                        active={!_.some(checkJoined, (value) => value === true)}
                        onClick={() => onUsersCheckout()} className="me-2"
                      >
                        <FontAwesomeIcon icon={faXmark}/>{' '}
                        <FormattedMessage
                          defaultMessage="Odjavi suradnike"
                          description="users-table-croris-collabsignoff"
                        />
                      </Button>
                      <Button disabled={collabNoEmail} active={isOpen} variant="primary" className="ms-0 ms-lg-2 mt-2 mt-lg-0" onClick={toggle}>
                        <FontAwesomeIcon icon={faArrowDown}/>{' '}
                        <FormattedMessage
                          defaultMessage="Pozovi CroRIS suradnike"
                          description="users-table-croris-croris-collabcall"
                        />
                      </Button>
                      <Button active={isOpen2} variant="info" className="ms-0 ms-lg-3 mt-2 mt-lg-0" onClick={toggle2}>
                        <FontAwesomeIcon icon={faArrowDown}/>{' '}
                        <FormattedMessage
                          defaultMessage="Pozovi strane suradnike"
                          description="users-table-croris-foreign-collabcall-2"
                        />
                      </Button>
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col md={{span: 8, offset: 2}} className="d-flex justify-content-center">
                      <Collapse in={isOpen && missingCollab.length !== 0} style={{width: '80%'}}>
                        <Card className="ps-4 pe-4 pt-4">
                          <Card.Title>
                            <FormattedMessage
                              defaultMessage="Odaberi email adrese suradnika iz sustava CroRIS koje želiš pozvati na projekt"
                              description="users-table-croris-cardtitle-1"
                            />
                          </Card.Title>
                          <Card.Body className="mb-4">
                            <Controller
                              name="collaboratorEmails"
                              control={control}
                              render={ ({field}) =>
                                <CustomReactSelect
                                  name="collaboratorEmails"
                                  forwardedRef={field.ref}
                                  placeholder={intl.formatMessage({
                                    defaultMessage: "Odaberi...",
                                    description: "users-table-croris-placeholder-1"
                                  })}
                                  closeMenuOnSelect={false}
                                  collaboratorsFixedMultiValue
                                  isMulti
                                  fontSize="16px"
                                  options={
                                    missingCollab.map(user => (
                                      {
                                        'value': user.email,
                                        'label': user.email
                                      }
                                    ))}
                                  onChange={(e) => setValue('collaboratorEmails', e)}
                                />
                              }
                            />
                            <div className="d-flex align-items-center justify-content-center">
                              <Button className="mt-4 mb-1" variant="success" id="submit-button" type="submit">
                                <FontAwesomeIcon icon={faPaperPlane}/>{' '}
                                <FormattedMessage
                                  defaultMessage="Pošalji poveznice za prijavu"
                                  description="users-table-croris-invite-send"
                                />
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Collapse>
                      <Collapse in={isOpen2} style={{width: '80%'}}>
                        <Card className="ps-4 pe-4 pt-4">
                          <Card.Title>
                            <FormattedMessage
                              defaultMessage="Upiši email adrese stranih suradnika koje želiš pozvati na projekt"
                              description="users-table-croris-cardtitle-2"
                            />
                          </Card.Title>
                          <Card.Body className="mb-4">
                            <Controller
                              name="foreignCollaboratorEmails"
                              control={control}
                              render={ ({field}) =>
                                <CustomCreatableSelect
                                  name="collaboratorEmails"
                                  forwardedRef={field.ref}
                                  placeholder={intl.formatMessage({
                                    defaultMessage: "suradnik1@email.de ENTER/TAB suradnik2@email.uk...",
                                    description: "users-table-croris-placeholder-2"
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
                                  description="users-table-croris-invite-send"
                                />
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Collapse>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Form>
        }
      </>
    )
  }
}
