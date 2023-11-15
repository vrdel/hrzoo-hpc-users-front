import React, { useContext, useState, useEffect } from 'react';
import { Col, Collapse, Row, Card, CardTitle, CardBody,
  Table, Button, Form, Tooltip, Input } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { AuthContext } from '../../components/AuthContextProvider';
import { CustomReactSelect } from '../../components/CustomReactSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faPaperPlane,
  faArrowDown,
  faXmark,
  faKey
} from '@fortawesome/free-solid-svg-icons';
import { extractUsers, extractEmails, emailInInvites } from '../../utils/invites-extracts';
import { toast } from 'react-toastify';
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

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => {
    if (project.is_active)
      setIsOpen(!isOpen);
    else
      toast.error(
        <span className="font-monospace text-white">
          Projekt nije aktivan pa nije moguće pozivati suradnike<br/>
        </span>, {
          theme: 'colored',
          toastId: 'invit-fail-sent',
          autoClose: 2500,
        }
      )
  }

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      collaboratorEmails: ''
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
  }

  const onInviteDelete = (user) => {
    let email = user['email']
    let projectid = project['id']
    let inviterid = userDetails['id']
    let type = 'inviterem'
    onSubmit({
      email, projectid, inviterid, type
    })
  }

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

  function onChangeCheckOut(i) {
    let tmpArray = [...checkJoined]
    if (tmpArray[i])
      tmpArray[i] = false
    else
      tmpArray[i] = true
    setCheckJoined(tmpArray)
  }


  const onUsersCheckout = () => {
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

  useEffect(() => {
    setEmailInvites(invites)
  }, [invites])


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
          if (email_invites.indexOf(user['email']) === -1)
            missingCollab.push(user)
      }
    })

    let collabNoEmail = true
    for (var collab of missingCollab)
      if (collab['email'])
        collabNoEmail = false

    return (
      <>
        <Row className={amILead && missingCollab.length > 0 ? 'mt-4 ms-0 me-0 mb-2 p-0' : 'p-0 mt-4 ms-0 me-0 mb-5'}>
          <Col>
            <Table responsive hover className="shadow-sm bg-white m-0">
              <thead id="hzsi-thead" className="align-middle text-center text-white">
                <tr>
                  <th className="fw-normal">
                    Ime
                  </th>
                  <th className="fw-normal">
                    Prezime
                  </th>
                  <th className="fw-normal">
                    Uloga
                  </th>
                  <th className="fw-normal">
                    Email
                  </th>
                  <th className="fw-normal">
                    CroRIS registracija
                  </th>
                  <th className="fw-normal">
                    Prijavljen
                  </th>
                  {
                    amILead &&
                    <th className="fw-normal">
                      Odjava
                    </th>
                  }
                </tr>
              </thead>
              <tbody>
                <>
                  <tr>
                    <td className={
                      amILead
                      ? 'p-3 align-middle text-center fst-italic border-bottom border-secondary'
                      : 'p-3 align-middle text-center'
                    }>
                      { lead['user'].first_name }
                    </td>
                    <td className={
                      amILead
                      ? 'p-3 align-middle text-center fst-italic border-bottom border-secondary'
                      : 'p-3 align-middle text-center'
                    }>
                      { lead['user'].last_name }
                    </td>
                    <td className={
                      amILead
                      ? 'align-middle text-center fst-italic border-bottom border-secondary'
                      : 'align-middle text-center'
                    }>
                      Voditelj
                    </td>
                    <td className={
                      amILead
                      ? 'align-middle text-center fst-italic border-bottom border-secondary'
                      : 'align-middle text-center'
                    }>
                      { extractEmails(lead['user'].person_mail) }
                    </td>
                    <td className={
                      amILead
                      ? 'align-middle text-center text-success fst-italic border-bottom border-secondary'
                      : 'p-3 align-middle text-center text-success'
                    }>
                      Da
                    </td>
                    <td className={
                      amILead
                      ? 'align-middle text-center text-success fst-italic border-bottom border-secondary'
                      : 'p-3 align-middle text-center text-success'
                    }>
                      <div className="position-relative">
                        Da
                        {
                          lead['user'].sshkeys &&
                            <div id={`Tooltip-key-${999}`} className="text-success position-absolute top-0 ms-4 start-50 translate-middle">
                              <FontAwesomeIcon icon={faKey}/>
                              <Tooltip
                                placement='top'
                                isOpen={isOpened(lead['user'].person_mail)}
                                target={`Tooltip-key-${999}`}
                                toggle={() => showTooltip(lead['user'].person_mail)}
                              >
                                Dodan javni ključ
                              </Tooltip>
                            </div>
                        }
                      </div>
                    </td>
                    {
                      amILead &&
                      <td className={
                        amILead
                        ? "align-middle text-center fst-italic border-bottom border-secondary"
                        : "align-middle text-center"
                      }>
                        {'\u2212'}
                      </td>
                    }
                  </tr>
                  {
                    alreadyJoined.length > 0 && alreadyJoined.map((user, i) => (
                      <tr key={`row-${i}`}>
                        <td className={
                          user['user']['person_oib'] === userDetails.person_oib
                          ? "p-3 align-middle text-center fst-italic border-bottom border-secondary"
                          : "p-3 align-middle text-center"
                        }>
                          { user['user'].first_name }
                        </td>
                        <td className={
                          user['user']['person_oib'] === userDetails.person_oib
                          ? "p-3 align-middle text-center fst-italic border-bottom border-secondary"
                          : "p-3 align-middle text-center"
                        }>
                          { user['user'].last_name }
                        </td>
                        <td className={
                          user['user']['person_oib'] === userDetails.person_oib
                          ? "align-middle text-center fst-italic border-bottom border-secondary"
                          : "align-middle text-center"
                        }>
                          Suradnik
                        </td>
                        <td className={
                          user['user']['person_oib'] === userDetails.person_oib
                          ? "align-middle text-center fst-italic border-bottom border-secondary"
                          : "align-middle text-center"
                        }>
                          { extractEmails(user['user'].person_mail) }
                        </td>
                        <td className={
                          user['user']['person_oib'] === userDetails.person_oib
                          ? "align-middle text-center text-success fst-italic border-bottom border-secondary"
                          : "align-middle text-center text-success"
                        }>
                          Da
                        </td>
                        <td className={
                          user['user']['person_oib'] === userDetails.person_oib
                          ? "align-middle text-center text-success fst-italic border-bottom border-secondary"
                          : "align-middle text-center text-success"
                        }>
                          <div className="position-relative">
                            Da
                            {
                              user['user'].sshkeys &&
                                <div id={`Tooltip-key-${i + 1000}`} className="text-success position-absolute top-0 ms-4 start-50 translate-middle">
                                  <FontAwesomeIcon icon={faKey}/>
                                  <Tooltip
                                    placement='top'
                                    isOpen={isOpened(user['user'].person_mail)}
                                    target={`Tooltip-key-${i + 1000}`}
                                    toggle={() => showTooltip(user['user'].person_mail)}
                                  >
                                    Dodan javni ključ
                                  </Tooltip>
                                </div>
                            }
                          </div>
                        </td>
                        {
                          amILead &&
                          <td className={
                            user['user']['person_oib'] === userDetails.person_oib
                            ? "align-middle text-center text-success fst-italic border-bottom border-secondary"
                            : "align-middle text-center text-success"
                          }>
                            <Input
                              type="checkbox"
                              className="bg-danger border border-danger ms-1"
                              checked={checkJoined[i] === true}
                              onChange={() => onChangeCheckOut(i)}
                            />
                          </td>
                        }
                      </tr>
                    ))
                  }
                  {
                    collaborators.length > 0 && collaborators.map((user, i) =>
                      !oibsJoined.has(user['oib']) &&
                        (
                          <tr key={`row-${i + 100}`}>
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
                              Suradnik
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
                                      Da
                                    </span>
                                  :
                                    <span className="text-danger">
                                      Ne
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
                                        id={'Tooltip-' + i + 100}
                                        className="text-success fa-lg"
                                        icon={faEnvelope}
                                      />
                                      <Tooltip
                                        placement='top'
                                        isOpen={isOpened(user.email)}
                                        target={'Tooltip-' + i + 100}
                                        toggle={() => showTooltip(user.email)}
                                      >
                                        Aktivna pozivnica poslana na email
                                      </Tooltip>
                                      <div className="position-absolute top-0 ms-4 start-50 translate-middle">
                                        <Button className="d-flex align-items-center justify-content-center ms-1 ps-1 pe-1 pt-0 pb-0 mt-0"
                                          color="light"
                                          onClick={() => onInviteDelete(user)}
                                        >
                                          <FontAwesomeIcon color="#DC3545" icon={faXmark}/>
                                        </Button>
                                      </div>
                                    </div>
                                  :
                                    <span className="text-danger">
                                      Ne
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
                </>
              </tbody>
            </Table>
          </Col>
        </Row>
        {
          amILead && missingCollab.length > 0 &&
            <Form onSubmit={handleSubmit(onTableSubmit)} className="needs-validation">
              <Row className="mt-3 mb-5">
                <Col>
                  <Row>
                    <Col className="d-flex justify-content-center">
                      <Button
                        color="danger"
                        active={!_.some(checkJoined, (value) => value === true)}
                        onClick={() => onUsersCheckout()} className="me-2"
                      >
                        <FontAwesomeIcon icon={faXmark}/>{' '}
                        Odjavi suradnike
                      </Button>
                      <Button disabled={collabNoEmail} color="primary" className="ms-2" onClick={toggle}>
                        <FontAwesomeIcon icon={faArrowDown}/>{' '}
                        Pozovi suradnike
                      </Button>
                    </Col>
                  </Row>
                  <Row className="mt-4">
                    <Col md={{size: 8, offset: 2}} className="d-flex justify-content-center">
                      <Collapse isOpen={isOpen} style={{width: '80%'}}>
                        <Card className="ps-4 pe-4 pt-4">
                          <CardTitle>
                            Odaberi email adrese suradnika koje želiš pozvati na projekt
                          </CardTitle>
                          <CardBody className="mb-4">
                            <Controller
                              name="collaboratorEmails"
                              control={control}
                              render={ ({field}) =>
                                <CustomReactSelect
                                  name="collaboratorEmails"
                                  forwardedRef={field.ref}
                                  placeholder="Odaberi..."
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
                              <Button className="mt-4 mb-1" color="success" id="submit-button" type="submit">
                                <FontAwesomeIcon icon={faPaperPlane}/>{' '}
                                Pošalji poveznice za prijavu
                              </Button>
                            </div>
                          </CardBody>
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
