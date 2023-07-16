import React from 'react'
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Row,
  Col,
  Label,
} from 'reactstrap';


const ExtractUsers = ({projectUsers}) => {
  return (
    projectUsers.map((user, i) =>
      <>
        <Badge color="secondary" className="fs-6 mb-2 fw-normal" key={`project-users-${i}`}>
          { user.first_name }
          {' '}
          { user.last_name }
        </Badge>
        {'   '}
      </>
    )
  )
}


export const GeneralInfo = ({project, isSubmitted}) => {
  return (
    <>
      <Col className="text-left fw-bold" md={{size: 2}}>
        Šifra:
      </Col>
      <Col md={{size: 3}}>
        <Label
          htmlFor="projectTime"
          aria-label="projectTime"
          className="mr-1 fw-bold">
          Trajanje:
        </Label>
      </Col>
      <Col md={{size: 3}}>
        <Label
          htmlFor="projectType"
          aria-label="projectType"
          className="mr-1 fw-bold">
          Vrsta:
        </Label>
      </Col>
      <Col md={{size: 4}}>
        <Label
          htmlFor="projectInstitution"
          aria-label="projectInstitution"
          className="mr-1 fw-bold">
          Ustanova:
        </Label>
      </Col>

      <div className="w-100"></div>

      <Col md={{size: 2}}>
        <div className="p-2 fs-5">
          <Badge color={isSubmitted ? "secondary" : "primary"} className="fw-normal">
            { project.identifier }
          </Badge>
        </div>
      </Col>
      <Col md={{size: 3}}>
        <div className="p-2 fs-5 font-monospace">
          { project.start } &minus; { project.end }
        </div>
      </Col>
      <Col md={{size: 3}}>
        <div className="p-2 fs-5">
          <Badge color={isSubmitted ? "secondary" : "dark"} className="fw-normal">
            {project.type}
          </Badge>
        </div>
      </Col>
      <Col md={{size: 4}}>
        <div className="p-2">
          {project.institute.name}<br/>
          <small>{project.institute.class}</small>
        </div>
      </Col>
    </>
  )
}


export const Persons = ({project, person_info, projectsLeadUsers}) => {
  return (
    <>
      <Col md={{size: 12}}>
        <Label
          htmlFor="projectPersons"
          aria-label="projectPersons"
          className="mr-1 form-label fw-bold">
          Osobe:
        </Label>
      </Col>

      <Col md={{size: 12}}>
        <div className="p-2">
          <ExtractUsers projectUsers={[person_info, ...projectsLeadUsers[project['croris_id']]]} />
        </div>
      </Col>
    </>
  )
}


export const Finance = ({project}) => {
  return (
    <>
      <Col md={{size: 12}}>
        <Label
          htmlFor="projectFinance"
          aria-label="projectFinance"
          className="mr-1 mt-3 form-label fw-bold">
          Financijer:
        </Label>
      </Col>
      <Col md={{size: 12}} className="mb-2">
        <div className="p-2">
          {
            project.finance.length > 1
              ?
                project.finance.map((finance, i) =>
                  <span key={`croris-finance-${i}`}>
                    { finance }
                    {
                      project.finance.length - 1 !== i ?
                          '; '
                        :
                          ''
                    }
                  </span>
                )
              :
                project.finance[0]
          }
        </div>
      </Col>
    </>
  )
}

export const CrorisUrl = ({project}) => {
  return (
    <>
      <Col md={{size: 12}}>
        <Label
          htmlFor="projectCrorisUrl"
          aria-label="projectCrorisUrl"
          className="mr-1 mt-3 form-label fw-bold">
          CroRIS poveznica:
        </Label>
      </Col>
      <Col md={{size: 10}}>
        <a href={`https://www.croris.hr/projekti/projekt/${project.croris_id}/`} className="ps-2" target="_blank" style={{'textDecoration': 'none'}} rel="noopener noreferrer">
          https://www.croris.hr/projekti/projekt/{project.croris_id}
        </a>
      </Col>
    </>
  )
}




export const Summary = ({project, isSubmitted}) => {
  return (
    <>
      <Col md={{size: 12}}>
        <Label
          htmlFor="projectSummary"
          aria-label="projectSummary"
          className="mr-1 mt-2 form-label fw-bold">
          Opis:
        </Label>
      </Col>
      <Col md={{size: 12}} className="mb-3">
        <textarea
          id="projectSummary"
          className="form-control fst-italic"
          rows="6"
          style={{backgroundColor: "rgba(255, 255, 255, 0)"}}
          disabled={isSubmitted}
          defaultValue={
            project.summary
          }
        />
      </Col>
    </>
  )
}
