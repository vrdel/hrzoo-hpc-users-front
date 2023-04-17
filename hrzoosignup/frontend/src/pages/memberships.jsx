import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from './root';
import { Col, Collapse, Row, Card, CardTitle, CardHeader, CardBody, CardFooter,
  Label, Badge, Table, Button, Form } from 'reactstrap';
import { PageTitle } from '../components/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { fetchNrProjects } from '../api/projects';
import { TypeString, TypeColor } from '../config/map-projecttypes';
import { GeneralInfo, Persons, Finance, Summary } from '../components/GeneralProjectInfo';
import { convertToEuropean, convertTimeToEuropean } from '../utils/dates';
import { AuthContext } from '../components/AuthContextProvider';
import { CustomCreatableSelect, CustomReactSelect } from '../components/CustomReactSelect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperPlane,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';


function extractUsers(projectUsers, role) {
  let users = projectUsers.filter(user => (
    user['role']['name'] === role
  ))

  return users
}

function extractEmails(email) {
  const emails = email.split(';')

  if (emails.length > 0)
    return emails.join(', ')
  else
    return email
}


export const BriefSummary = ({project, isSubmitted}) => {
  return (
    <>
      <Col md={{size: 12}}>
        <Label
          htmlFor="projectSummary"
          aria-label="projectSummary"
          className="mr-1 mt-2 form-label">
          Opis:
        </Label>
      </Col>
      <Col md={{size: 12}} className="mb-3">
        <textarea
          id="projectSummary"
          className="form-control fst-italic"
          rows="3"
          disabled={isSubmitted}
          style={{backgroundColor: "rgba(255, 255, 255, 0)"}}
          defaultValue={
            project.project_type.name === 'research-croris' ?
              project.croris_summary
            :
              project.reason
          }
        />
      </Col>
    </>
  )
}


const BriefProjectInfo = ({project}) => {
  return (
    <>
      <Col className="text-left" md={{size: 2}}>
        Šifra:
      </Col>
      <Col md={{size: 3}}>
        <Label
          htmlFor="projectTime"
          aria-label="projectTime"
          className="mr-1">
          Trajanje:
        </Label>
      </Col>
      <Col md={{size: 2}}>
        <Label
          htmlFor="projectTime"
          aria-label="projectTime"
          className="mr-1">
          Odobren:
        </Label>
      </Col>
      <Col md={{size: 2}}>
        <Label
          htmlFor="projectType"
          aria-label="projectType"
          className="mr-1">
          Tip:
        </Label>
      </Col>

      <div className="w-100"></div>

      <Col md={{size: 2}}>
        <div className="p-2">
          <Badge color={"secondary fw-normal"}>
            { project.identifier }
          </Badge>
        </div>
      </Col>
      <Col md={{size: 3}}>
        <div className="p-2 fs-5 font-monospace">
          { convertToEuropean(project.date_start) } &minus; { convertToEuropean(project.date_end) }
        </div>
      </Col>
      <Col md={{size: 2}}>
        <div className="p-2 fs-5 font-monospace">
          { convertToEuropean(project.date_changed) }
        </div>
      </Col>
      <Col md={{size: 2}}>
        <span className={`badge fw-normal ${TypeColor(project.project_type.name)}`} >
          { TypeString(project.project_type.name) }
        </span>
      </Col>
    </>
  )
}


const UsersTableGeneral = ({project}) => {
  const lead = extractUsers(project.userproject_set, 'lead')[0]
  const alreadyJoined = extractUsers(project.userproject_set, 'collaborator')
  const { userDetails } = useContext(AuthContext);
  const amILead = lead['user']['person_oib'] === userDetails.person_oib

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      collaboratorEmails: '',
    }
  });
  const onSubmit = data => {
    data['myoib'] = userDetails.person_oib
    data['project'] = project['identifier']
    alert(JSON.stringify(data, null, 2));
  }

  return (
    <>
      <Row className={amILead ? 'mt-4 ms-4 me-4 mb-2' : 'mt-4 ms-4 me-4 mb-5'}>
        <Col>
          <Table responsive hover className="shadow-sm bg-white">
            <thead id="hzsi-thead" className="table-active align-middle text-center text-white">
              <tr className="border-bottom border-1 border-dark">
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
                  Prijavljen
                </th>
              </tr>
            </thead>
            <tbody>
              <>
                <tr>
                  <td className="p-3 align-middle text-center">
                    { lead['user'].first_name }
                  </td>
                  <td className="p-3 align-middle text-center">
                    { lead['user'].last_name }
                  </td>
                  <td className="align-middle text-center">
                    Voditelj
                  </td>
                  <td className="align-middle text-center">
                    { lead['user'].person_mail }
                  </td>
                  <td className="align-middle text-center">
                    Da
                  </td>
                </tr>
                {
                  alreadyJoined.length > 0 && alreadyJoined.map((user, i) => (
                    <tr key={`row-${i}`}>
                      <td className="p-3 align-middle text-center">
                        { user['user'].first_name }
                      </td>
                      <td className="p-3 align-middle text-center">
                        { user['user'].last_name }
                      </td>
                      <td className="align-middle text-center">
                        Suradnik
                      </td>
                      <td className="align-middle text-center">
                        { user['user'].person_mail }
                      </td>
                      <td className="align-middle text-center">
                        Da
                      </td>
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
          <Form onSubmit={handleSubmit(onSubmit)} className="needs-validation">
            <Row className="mt-3 mb-5">
              <Col>
                <Row>
                  <Col className="d-flex justify-content-center">
                    <Button size="lg" color="success" onClick={toggle}>
                      <FontAwesomeIcon icon={faUsers}/>{' '}
                      Pozovi suradnike
                    </Button>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col className="d-flex justify-content-center">
                    <Collapse isOpen={isOpen}>
                      <Card className="p-4" style={{maxWidth: '680px'}}>
                        <CardTitle>
                          <h5>
                            Upis email adresa novih suradnika
                          </h5>
                        </CardTitle>
                        <CardBody className="mb-4">
                          <Controller
                            name="collaboratorEmails"
                            control={control}
                            render={ ({field}) =>
                              <CustomCreatableSelect
                                name="collaboratorEmails"
                                forwardedRef={field.ref}
                                controlWidth="600px"
                                placeholder="suradnik1@email.hr ENTER/TAB suradnik2@email.hr..."
                                fontSize="18px"
                                onChange={(e) => setValue('collaboratorEmails', e)}
                              />
                            }
                          />
                        </CardBody>
                        <CardFooter className="d-flex bg-white mt-2 mb-1 align-items-center justify-content-center">
                          <Button className="mt-4 mb-1" color="success" id="submit-button" type="submit">
                            <FontAwesomeIcon icon={faPaperPlane}/>{' '}
                            Posalji poveznice za prijavu
                          </Button>
                        </CardFooter>
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


const UsersTableCroris = ({project}) => {
  const { userDetails } = useContext(AuthContext);
  const collaborators = project['croris_collaborators']
  const lead = extractUsers(project.userproject_set, 'lead')[0]
  const alreadyJoined = extractUsers(project.userproject_set, 'collaborator')
  let oibsJoined = new Set()
  alreadyJoined.forEach(user => oibsJoined.add(user['user']['person_oib']))
  const amILead = lead['user']['person_oib'] === userDetails.person_oib

  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      collaboratorEmails: '',
    }
  });
  const onSubmit = data => {
    data['myoib'] = userDetails.person_oib
    data['project'] = project['identifier']
    alert(JSON.stringify(data, null, 2));
  }

  const missingCollab = new Array()
  collaborators.forEach((user) => {
    if (!oibsJoined.has(user['oib']))
      missingCollab.push(user)
  })

  return (
    <>
      <Row className={amILead ? 'mt-4 ms-4 me-4 mb-2' : 'mt-4 ms-4 me-4 mb-5'}>
        <Col>
          <Table responsive hover className="shadow-sm bg-white">
            <thead id="hzsi-thead" className="table-active align-middle text-center text-white">
              <tr className="border-bottom border-1 border-dark">
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
              </tr>
            </thead>
            <tbody>
              <>
                <tr>
                  <td className="p-3 align-middle text-center">
                    { lead['user'].first_name }
                  </td>
                  <td className="p-3 align-middle text-center">
                    { lead['user'].last_name }
                  </td>
                  <td className="align-middle text-center">
                    Voditelj
                  </td>
                  <td className="align-middle text-center">
                    { extractEmails(lead['user'].person_mail) }
                  </td>
                  <td className="align-middle text-center">
                    Da
                  </td>
                  <td className="align-middle text-center">
                    Da
                  </td>
                </tr>
                {
                  alreadyJoined.length > 0 && alreadyJoined.map((user, i) => (
                    <tr key={`row-${i}`}>
                      <td className="p-3 align-middle text-center">
                        { user['user'].first_name }
                      </td>
                      <td className="p-3 align-middle text-center">
                        { user['user'].last_name }
                      </td>
                      <td className="align-middle text-center">
                        Suradnik
                      </td>
                      <td className="align-middle text-center">
                        { extractEmails(user['user'].person_mail) }
                      </td>
                      <td className="align-middle text-center">
                        Da
                      </td>
                      <td className="align-middle text-center">
                        Da
                      </td>
                    </tr>
                  ))
                }
                {
                  collaborators.length > 0 && collaborators.map((user, i) =>
                    !oibsJoined.has(user['oib']) &&
                      (
                        <tr key={`row-${i}`}>
                          <td className="p-3 align-middle text-center">
                            { user.first_name }
                          </td>
                          <td className="p-3 align-middle text-center">
                            { user.last_name }
                          </td>
                          <td className="align-middle text-center">
                            Suradnik
                          </td>
                          <td className="align-middle text-center">
                            { extractEmails(user.email) }
                          </td>
                          <td className="align-middle text-center">
                            {
                              user.email ? 'Da' : 'Ne'
                            }
                          </td>
                          <td className="align-middle text-center">
                            Ne
                          </td>
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
          <Form onSubmit={handleSubmit(onSubmit)} className="needs-validation">
            <Row className="mt-3 mb-5">
              <Col>
                <Row>
                  <Col className="d-flex justify-content-center">
                    <Button size="lg" color="success" onClick={toggle}>
                      <FontAwesomeIcon icon={faUsers}/>{' '}
                      Pozovi suradnike
                    </Button>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col className="d-flex justify-content-center">
                    <Collapse isOpen={isOpen}>
                      <Card className="p-4" style={{maxWidth: '680px'}}>
                        <CardTitle>
                          <h5>
                            Odaberi email adrese na koje želis slati poveznice s prijavom
                          </h5>
                        </CardTitle>
                        <CardBody className="mb-4">
                          <Controller
                            name="collaboratorEmails"
                            control={control}
                            render={ ({field}) =>
                              <CustomReactSelect
                                name="collaboratorEmails"
                                forwardedRef={field.ref}
                                controlWidth="600px"
                                placeholder="Odaberi..."
                                closeMenuOnSelect={false}
                                collaboratorsFixedMultiValue
                                isMulti
                                fontSize="18px"
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
                        </CardBody>
                        <CardFooter className="d-flex bg-white mt-2 mb-1 align-items-center justify-content-center">
                          <Button className="mt-4 mb-1" color="success" id="submit-button" type="submit">
                            <FontAwesomeIcon icon={faPaperPlane}/>{' '}
                            Posalji poveznice za prijavu
                          </Button>
                        </CardFooter>
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


const Memberships = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);

  const {status: nrStatus, data: nrProjects} = useQuery({
      queryKey: ['projects'],
      queryFn: fetchNrProjects
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname])

  if (nrStatus === 'success' && nrProjects) {
    let projectsApproved = nrProjects.filter(project =>
      project.state.name !== 'deny' && project.state.name !== 'submit'
    )

    return (
      <>
        <Row className="mb-5">
          <PageTitle pageTitle={pageTitle}/>
        </Row>
        {
          projectsApproved.length > 0 ?
            projectsApproved.map((project, i) =>
              <>
                <Row className="mb-5" key={`row-${i}`}>
                  <Col key={`col-${i}`}>
                    <Card className="ms-3 bg-light me-3 shadow-sm" key={`card-${i}`}>
                      <CardHeader className="d-flex justify-content-between">
                        <span className="fs-5 text-dark fw-bold">
                          { project?.name }
                        </span>
                      </CardHeader>
                      <CardBody className="mb-1 bg-light">
                        {
                          project.project_type.name === 'research-croris' ?
                            <UsersTableCroris project={project} />
                          :
                            <UsersTableGeneral project={project} />
                        }
                        <Row>
                          <BriefProjectInfo project={project} />
                        </Row>
                        <Row>
                          {
                            // <BriefSummary project={project}/>
                          }
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                <Row style={{height: '100px'}}/>
              </>
            )
          :
            <Row className="mt-3 mb-3">
              <Col className="d-flex align-items-center justify-content-center shadow-sm bg-light border border-danger rounded text-muted text-center p-3 fs-3" style={{height: '400px'}} md={{offset: 1, size: 10}}>
                Nemate prijavljenih sudjelovanja na odobrenim projektima
              </Col>
            </Row>
        }
      </>
    )
  }
};

export default Memberships;
