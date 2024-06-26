import React, { useContext, useState } from 'react';
import { Col, Collapse, Row, Card, CardTitle, CardBody,
  Table, Button, Form, Tooltip, Input } from 'reactstrap';
import { useForm, Controller } from 'react-hook-form';
import { AuthContext } from 'Components/AuthContextProvider';
import { CustomCreatableSelect, CustomReactSelect } from 'Components/CustomReactSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowDown,
  faCheck,
  faEnvelope,
  faKey,
  faPaperPlane,
  faPlus,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { extractUsers } from 'Utils/invites-extracts';
import { fetchUsers, fetchUsersInactive } from "Api/users"
import { useQuery } from "@tanstack/react-query";
import { toast } from 'react-toastify';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl'
import _ from 'lodash';


export const UsersTableGeneral = ({project, invites, onSubmit}) => {
  const lead = extractUsers(project.userproject_set, 'lead')[0]
  const alreadyJoined = extractUsers(project.userproject_set, 'collaborator')
  const { userDetails } = useContext(AuthContext);
  const amILead = lead['user']['person_oib'] === userDetails.person_oib
  const [checkJoined, setCheckJoined] = useState(Array(alreadyJoined.length))
  const intl = useIntl()

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

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      collaboratorEmails: '',
      collaboratorUids: ''
    }
  });

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

  return (
    <>
      <Row className={amILead ? 'mt-4 ms-1 ps-0 pe-0 me-1 mb-2 ' : 'mt-4 ms-1 me-1 mb-5'}>
        <Col>
          <Table responsive hover className="shadow-sm bg-white">
            <thead id="hzsi-thead" className="align-middle text-center text-white">
              <tr>
                <th className="fw-normal">
                  <FormattedMessage
                    defaultMessage="Ime"
                    description="users-table-general-firstname"
                  />
                </th>
                <th className="fw-normal">
                  <FormattedMessage
                    defaultMessage="Prezime"
                    description="users-table-general-lastname"
                  />
                </th>
                <th className="fw-normal">
                  <FormattedMessage
                    defaultMessage="Uloga"
                    description="users-table-general-role"
                  />
                </th>
                <th className="fw-normal">
                  <FormattedMessage
                    defaultMessage="Email"
                    description="users-table-general-email"
                  />
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
                <tr>
                  <td className={
                    amILead
                    ? "p-3 align-middle text-center fst-italic border-bottom border-secondary"
                    : "p-3 align-middle text-center"
                  }>
                    { lead['user'].first_name }
                  </td>
                  <td className={
                    amILead
                    ? "p-3 align-middle text-center fst-italic border-bottom border-secondary"
                    : "p-3 align-middle text-center"
                  }>
                    { lead['user'].last_name }
                  </td>
                  <td className={
                    amILead
                    ? "align-middle text-center fst-italic border-bottom border-secondary"
                    : "align-middle text-center"
                  }>
                    <FormattedMessage
                      defaultMessage="Voditelj"
                      description="users-table-general-leader"
                    />
                  </td>
                  <td className={
                    amILead
                    ? "align-middle text-center fst-italic border-bottom border-secondary"
                    : "align-middle text-center"
                    }>
                    { lead['user'].person_mail }
                  </td>
                  <td className={
                    amILead
                    ? "align-middle text-center text-success fst-italic border-bottom border-secondary"
                    : "align-middle text-center text-success"
                  }>
                    <div className="position-relative">
                      <FormattedMessage
                        defaultMessage="Da"
                        description="users-table-general-isadded"
                      />
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
                              <FormattedMessage
                                defaultMessage="Dodan javni ključ"
                                description="users-table-general-keyadd"
                              />
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
                        <FormattedMessage
                          defaultMessage="Suradnik"
                          description="users-table-general-collaborator"
                        />
                      </td>
                      <td className={
                        user['user']['person_oib'] === userDetails.person_oib
                        ? "align-middle text-center fst-italic border-bottom border-secondary"
                        : "align-middle text-center"
                      }>
                        { user['user'].person_mail }
                      </td>
                      <td className={
                        user['user']['person_oib'] === userDetails.person_oib
                        ? "align-middle text-center text-success fst-italic border-bottom border-secondary"
                        : "align-middle text-center text-success"
                      }>
                        <div className="position-relative">
                          <FormattedMessage
                            defaultMessage="Da"
                            description="users-table-general-isadded"
                          />
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
                                  <FormattedMessage
                                    defaultMessage="Dodan javni ključ"
                                    description="users-table-general-keyadd"
                                  />
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
                  invites?.length > 0 && invites.map((user, i) => (
                    <tr key={`row-${i + 100}`}>
                      <td className="p-3 align-middle text-center">
                        { '\u2212' }
                      </td>
                      <td className="p-3 align-middle text-center">
                        { '\u2212' }
                      </td>
                      <td className="align-middle text-center">
                        <FormattedMessage
                          defaultMessage="Suradnik"
                          description="users-table-general-collaborator"
                        />
                      </td>
                      <td className="align-middle text-center">
                        { user.email }
                      </td>
                      <td className="align-middle text-center">
                        <div className="position-relative">
                          <FontAwesomeIcon className="text-success fa-lg" id={`Tooltip-${i + 100}`} icon={faEnvelope}/>
                          <Tooltip
                            placement='top'
                            isOpen={isOpened(user.email)}
                            target={`Tooltip-${i + 100}`}
                            toggle={() => showTooltip(user.email)}
                          >
                            <FormattedMessage
                              defaultMessage="Aktivna pozivnica poslana na email"
                              description="users-table-general-invitesent"
                            />
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
        amILead &&
          <Form onSubmit={handleSubmit(onTableSubmit)} className="needs-validation">
            <Row className="mt-3 mb-5">
              <Col>
                <Row>
                  <Col className="d-flex justify-content-center flex-column flex-md-row align-items-center">
                    <Button
                      color="danger"
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
                    <Button color="primary" active={isOpen} onClick={toggle} className="ms-0 ms-md-2 mt-sm-2 mt-md-0">
                      <FontAwesomeIcon icon={faArrowDown}/>{' '}
                      <FormattedMessage
                        defaultMessage="Pozovi suradnike"
                        description="users-table-general-collabcall"
                      />
                    </Button>
                    {
                      (project.project_type['name'] === 'internal' || project.project_type['name'] === 'srce-workshop')
                      && (userDetails.is_staff || userDetails.is_superuser) &&
                      <Button color="success" active={isOpen2} onClick={toggle2} className="ms-0 ms-md-3 mt-sm-2 mt-md-0">
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
                  <Col md={{size: 8, offset: 2}} className="d-flex justify-content-center">
                    <Collapse isOpen={isOpen} style={{width: '80%'}}>
                      <Card className="ps-4 pe-4 pt-4">
                        <CardTitle>
                          <FormattedMessage
                            defaultMessage="Upiši email adrese suradnika koje želiš pozvati na projekt"
                            description="users-table-general-cardtitle-1"
                          />
                        </CardTitle>
                        <CardBody className="mb-4">
                          <Controller
                            name="collaboratorEmails"
                            control={control}
                            render={ ({field}) =>
                              <CustomCreatableSelect
                                name="collaboratorEmails"
                                forwardedRef={field.ref}
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
                            <Button className="mt-4 mb-1" color="success" id="submit-button" type="submit">
                              <FontAwesomeIcon icon={faPaperPlane}/>{' '}
                              <FormattedMessage
                                defaultMessage="Pošalji poveznice za prijavu"
                                description="users-table-general-invite-send"
                              />
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    </Collapse>
                  </Col>
                </Row>
                {
                  (project.project_type['name'] === 'internal' || project.project_type['name'] === 'srce-workshop')
                  && (userDetails.is_staff || userDetails.is_superuser) &&
                  <Row className="mt-4">
                    <Col md={{size: 8, offset: 2}} className="d-flex justify-content-center">
                      <Collapse isOpen={isOpen2} style={{width: '80%'}}>
                        <Card className="ps-4 pe-4 pt-4">
                          <CardTitle>
                            <FormattedMessage
                              defaultMessage="Korisničke oznake suradnika koje želiš na projektu"
                              description="users-table-general-cardtitle-2"
                            />
                          </CardTitle>
                          <CardBody className="mb-4">
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
                              <Button className="mt-4 mb-1" color="success" id="submit-button" type="submit">
                                <FontAwesomeIcon icon={faCheck}/>{' '}
                                <FormattedMessage
                                  defaultMessage="Potvrdi"
                                  description="users-table-general-confirm"
                                />
                              </Button>
                            </div>
                          </CardBody>
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
