import React, { useState, useEffect, useContext } from 'react';
import { CustomReactSelect } from '../components/CustomReactSelect';
import { Outlet, useNavigate } from 'react-router-dom';
import { Col, Row, Button, Label } from 'reactstrap';
import { SharedData } from './root';
import { PageTitle } from '../components/PageTitle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { useQuery } from '@tanstack/react-query';
import { fetchCroRIS } from '../api/croris';
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';


const NewRequest = () => {
  const [pageTitle, setPageTitle] = useState(undefined)
  const [buttonDisabled, setButtonDisabled] = useState(undefined)
  const [continueButtonDisabled, setContinueButtonDisabled] = useState(undefined)
  const [selectedProject, setSelectedProject] = useState(undefined)
  const navigate = useNavigate()
  const { LinkTitles,
    RequestTypesToSelect,
    UrlToRequestType } = useContext(SharedData);

  const {status, data: croRisData} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRIS,
      staleTime: 15 * 60 * 1000
  })

  useEffect(() => {
    setPageTitle(LinkTitles[location.pathname])
    if (location.pathname.endsWith('novi-zahtjev'))
      setButtonDisabled(false)
    else {
      setButtonDisabled(true)
      setSelectedProject(UrlToRequestType[location.pathname])
    }
  }, [location.pathname])

  return (
    <>
      <Row>
        <PageTitle pageTitle={pageTitle}/>
      </Row>
      <Row className="mb-2 ms-2 mt-4">
        <Col className="d-inline-flex align-items-center">
          <Label
            htmlFor="requestType"
            aria-label="requestType"
          >
            Tip zahtjeva:
          </Label>
          <CustomReactSelect
            id="requestType"
            aria-label="requestType"
            className="ms-5"
            placeholder="Odaberi"
            controlWidth="400px"
            onChange={(e) => {
              if (e.value !== 'istrazivacki-projekt')
                setContinueButtonDisabled(false)
              else if (status === 'success' &&
                croRisData?.data?.person_info?.lead_status !== true) {
                toast.error(
                  <span className="font-monospace text-dark">
                    Nemate projekata prijavljenih u sustavu CroRIS
                  </span>, {
                    theme: 'light',
                    toastId: 'newreq-no-croris',
                    autoClose: 2500,
                  }
                )
                setContinueButtonDisabled(true)
              }
              return setSelectedProject(e)
            }}
            isDisabled={buttonDisabled}
            options={RequestTypesToSelect}
            value={selectedProject}
          />
          <Button
            color="success"
            className="ms-3"
            disabled={buttonDisabled || continueButtonDisabled}
            onClick={() => {
              navigate(selectedProject.value)
            }}>
            <FontAwesomeIcon icon={faArrowRight}/>{' '}
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
