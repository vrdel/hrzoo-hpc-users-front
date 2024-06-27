import React from 'react'
import {
  Badge,
  Col,
  Label,
} from 'reactstrap';
import { TypeString, TypeColor } from 'Config/map-projecttypes';
import { FormattedMessage } from 'react-intl';
import _ from "lodash";


const ExtractUsers = ({projectUsers}) => {
  return (
    projectUsers.map((user, i) =>
      <React.Fragment key={`wrap-project-users-${i}`}>
        <Badge color="secondary" className="fs-6 mb-2 fw-normal" key={`project-users-${i}`}>
          { user.first_name }
          {' '}
          { user.last_name }
        </Badge>
        {'   '}
      </React.Fragment>
    )
  )
}


export const GeneralInfo = ({project, isSubmitted}) => {
  let leadInstitute = project.institute.filter(inst => inst['class'] === 'nositelj')

  if (leadInstitute.length === 0)
    leadInstitute = project.institute[0]
  else
    leadInstitute = leadInstitute[0]

  return (
    <>
      <Col className="text-left fw-bold" md={{size: 2}}>
        <FormattedMessage
          defaultMessage="Šifra:"
          description="generalproject-identifier"
        />
      </Col>
      <Col md={{size: 3}}>
        <Label
          htmlFor="projectTime"
          aria-label="projectTime"
          className="mr-1 fw-bold">
          <FormattedMessage
            defaultMessage="Trajanje:"
            description="generalproject-duration"
          />
        </Label>
      </Col>
      <Col md={{size: 3}}>
        <Label
          htmlFor="projectType"
          aria-label="projectType"
          className="mr-1 fw-bold">
          <FormattedMessage
            defaultMessage="Vrsta:"
            description="generalproject-type"
          />
        </Label>
      </Col>
      <Col md={{size: 4}}>
        <Label
          htmlFor="projectInstitution"
          aria-label="projectInstitution"
          className="mr-1 fw-bold">
          <FormattedMessage
            defaultMessage="Ustanova:"
            description="generalproject-institute"
          />
        </Label>
      </Col>

      <div className="w-100"></div>

      <Col md={{size: 2}}>
        <div className="p-2 fs-5">
          {
            project.identifier ?
              <Badge color={isSubmitted ? "secondary" : "primary"} className="fw-normal">
                { project.identifier }
              </Badge>
            :
              '\u2212'
          }
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
          <span className="fst-italic">
            <Badge className="bg-secondary-subtle fw-normal text-dark fs-6">
              {leadInstitute.name}
            </Badge>
          </span>
          <br/>
          <small>{leadInstitute.class}</small>
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
          <FormattedMessage
            defaultMessage="Osobe:"
            description="generalproject-persons"
          />
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
          <FormattedMessage
            defaultMessage="Financijer:"
            description="generalproject-finance"
          />
        </Label>
      </Col>
      <Col md={{size: 12}} className="mb-2">
        <div className="p-2">
          {
            project.finance.length > 1
              ?
                project.finance.map((finance, i) =>
                  <span key={`croris-finance-${i}`} className="fst-italic">
                    <Badge className="bg-warning-subtle fw-normal text-dark fs-6 me-2" key="project-institute">
                      { finance }
                    </Badge>
                  </span>
                )
              :
                <span className="fst-italic">
                  <Badge className="bg-warning-subtle fw-normal fs-6 text-dark">
                    { project.finance[0] }
                  </Badge>
                </span>
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
          <FormattedMessage
            defaultMessage="CroRIS poveznica:"
            description="generalproject-crorislink"
          />
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
          <FormattedMessage
            defaultMessage="Opis:"
            description="generalproject-description"
          />
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


export const ProjectTypeBadge = ({projectInfo}) => {
  if (projectInfo)
    return (
      <span className={`badge fw-normal position-relative ${TypeColor(projectInfo.project_type.name)}`} >
        { TypeString(projectInfo.project_type.name) }
        {
          _.findIndex(projectInfo.croris_finance, (fin) => fin.toLowerCase().includes('euro')) > -1 &&
          <span className="position-absolute fw-normal top-100 start-100 translate-middle badge rounded-pill bg-danger">
            EU
            <span className="visually-hidden">EU</span>
          </span>
        }
      </span>
    )
  else
    return null
}
