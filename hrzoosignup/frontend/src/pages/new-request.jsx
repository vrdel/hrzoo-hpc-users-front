import React, { useState, useEffect, useContext } from 'react';
import { CustomReactSelect } from '../components/CustomReactSelect';
import { Outlet, useNavigate } from 'react-router-dom';
import { Col, Row, Button, Label } from 'reactstrap';
import { SharedData } from './root';
import { PageTitle } from '../components/PageTitle';


const NewRequest = () => {
  const [pageTitle, setPageTitle] = useState(undefined)
  const [buttonDisabled, setButtonDisabled] = useState(undefined)
  const [selectedProject, setSelectedProject] = useState(undefined)
  const navigate = useNavigate()
  const { linkTitles, ProjectTypesToSelect } = useContext(SharedData);

  useEffect(() => {
    setPageTitle(linkTitles[location.pathname])
    if (location.pathname.endsWith('novi-zahtjev'))
      setButtonDisabled(false)
    else
      setButtonDisabled(true)
  }, [location.pathname])

  return (
    <>
      <Row>
        <PageTitle pageTitle={pageTitle}/>
      </Row>
      <Row className="mb-2 ms-2 mt-4">
        <Col className="d-inline-flex align-items-center">
          <Label
            className="fs-5"
            htmlFor="projectType"
            aria-label="projectType"
          >
            <strong>
              Tip projekta:
            </strong>
          </Label>
          <CustomReactSelect
            className="ms-5 fs-5"
            placeholder="Odaberi"
            controlWidth="400px"
            onChange={setSelectedProject}
            isDisabled={buttonDisabled}
            options={ProjectTypesToSelect}
          />
          <Button
            color="success"
            className="ms-5 fs-5"
            disabled={buttonDisabled}
            onClick={() => {
              navigate(selectedProject.value)
            }}>
            Nastavi
          </Button>
        </Col>
      </Row>
      <Row>
        <Outlet />
      </Row>
    </>
  )
};

export default NewRequest;