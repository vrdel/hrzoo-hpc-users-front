import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from './root';
import { Col, Row, Card, CardHeader, CardBody, Label, Badge, Table } from 'reactstrap';
import { PageTitle } from '../components/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { fetchNrProjects } from '../api/projects';
import { TypeString, TypeColor } from '../config/map-projecttypes';
import { GeneralInfo, Persons, Finance, Summary } from '../components/GeneralProjectInfo';
import { convertToEuropean, convertTimeToEuropean } from '../utils/dates';


function extractUsers(projectUsers, role) {
  let users = projectUsers.filter(user => (
    user['role']['name'] === role
  ))

  return users
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
          htmlFor="projectType"
          aria-label="projectType"
          className="mr-1">
          Tip:
        </Label>
      </Col>
      <Col md={{size: 4}}>
        <Label
          htmlFor="projectInstitution"
          aria-label="projectInstitution"
          className="mr-1">
          Ustanova:
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
        <span className={`badge fw-normal ${TypeColor(project.project_type.name)}`} >
          { TypeString(project.project_type.name) }
        </span>
      </Col>
      <Col md={{size: 4}}>
        <div className="p-2">
          {project.institute}<br/>
        </div>
      </Col>
    </>
  )
}


const UsersTableGeneral = ({project}) => {
  const lead = extractUsers(project.userproject_set, 'lead')[0]
  const alreadyJoined = extractUsers(project.userproject_set, 'collaborator')

  return (
    <Row className="mt-4 ms-4 me-4 mb-5">
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
  )
}


const UsersTableCroris = ({project}) => {
  const collaborators = project['croris_collaborators']
  const lead = extractUsers(project.userproject_set, 'lead')[0]
  const alreadyJoined = extractUsers(project.userproject_set, 'collaborator')
  let oibsJoined = new Set()
  alreadyJoined.forEach(user => oibsJoined.add(user['user']['person_oib']))

  return (
    <Row className="mt-4 ms-4 me-4 mb-5">
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
                  { lead['user'].person_mail }
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
                      { user['user'].person_mail }
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
                          { user.email }
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
