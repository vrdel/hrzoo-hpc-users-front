import React, { useState, useEffect, useContext } from 'react';
import { CustomReactSelect } from 'Components/CustomReactSelect';
import { Outlet, useNavigate } from 'react-router-dom';
import { Col, Row, Button, Label } from 'reactstrap';
import { SharedData } from 'Pages/root';
import { PageTitle } from 'Components/PageTitle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { useQuery } from '@tanstack/react-query';
import { fetchCroRIS } from 'Api/croris';
import { canSubmitInstituteProject } from 'Api/projects';
import { toast } from 'react-toastify';
import { AuthContext } from 'Components/AuthContextProvider';
import { defaultUnAuthnRedirect} from 'Config/default-redirect';


const NewRequest = () => {
  const [pageTitle, setPageTitle] = useState(undefined)
  const [buttonDisabled, setButtonDisabled] = useState(undefined)
  const [continueButtonDisabled, setContinueButtonDisabled] = useState(undefined)
  const [selectedProject, setSelectedProject] = useState(undefined)
  const navigate = useNavigate()
  const { LinkTitles,
    RequestTypesToSelect,
    UrlToRequestType } = useContext(SharedData);
  const { userDetails } = useContext(AuthContext);

  let requestTypesToSelect = RequestTypesToSelect
  if (!userDetails.is_staff && !userDetails.is_superuser) {
    requestTypesToSelect = RequestTypesToSelect.filter((e) =>
      e.value !== 'interni-projekt'
    )
  }

  const {status, data: croRisData, error} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRIS,
      staleTime: 15 * 60 * 1000
  })

  const {status: statusSubmitInstitute, data: dataSubmitInstitute, error:
    errorSubmitInstitute} = useQuery({
      queryKey: ['can-submit-institute'],
      queryFn: canSubmitInstituteProject,
      staleTime: 15 * 60 * 1000
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
    if (location.pathname.endsWith('novi-zahtjev'))
      setButtonDisabled(false)
    else {
      setButtonDisabled(true)
      setSelectedProject(UrlToRequestType(location.pathname))
    }
    if (status === 'error' && error.message.includes('403'))
      navigate(defaultUnAuthnRedirect)
  }, [location.pathname, status])

  return (
    <>
      <Row>
        <PageTitle pageTitle={pageTitle}/>
      </Row>
      <Row className="mb-2 ms-2 mt-4">
        <Col md={{size: 12}} lg={{size: 9}} className="d-lg-inline-flex d-md-inline-flex d-flex-sm-column d-flex-xs-column align-items-center">
          <Label
            htmlFor="requestType"
            className="ps-2 pe-2 mt-1 pt-1 pb-1 text-white"
            aria-label="requestType"
            style={{backgroundColor: "#b04c46"}}
          >
            Tip zahtjeva
          </Label>
          <CustomReactSelect
            id="requestType"
            aria-label="requestType"
            className="ms-lg-5 me-lg-0 ms-md-5 me-md-0 me-xs-5 me-sm-5 me-5 ms-xs-0 ms-sm-0 ms-0 mt-lg-0 mt-md-0 mt-xs-2 mt-sm-2 mt-2 shadow-sm"
            placeholder="Odaberi"
            controlWidth="40%"
            onChange={(e) => {
              if (e.value === 'institucijski-projekt'
                && statusSubmitInstitute === 'success'
                && dataSubmitInstitute?.status?.operation === 'DENY') {
                // && dataSubmitInstitute?.status?.operation === 'ALLOW') {
                let msg = dataSubmitInstitute.status.message
                let reasonDetail = ''

                if (msg === 'MBZ unknown')
                  reasonDetail = 'Matični broj znanstvenika (MBZ) nije poznat'
                else if (msg === 'Already submitted')
                  reasonDetail = 'Jedan institucijski projekt je već prijavljen'
                else if (msg === 'Access CroRIS')
                  reasonDetail = 'Pristup ste već ostvarili temeljem istraživačkog projekta u sustavu CroRIS'
                else if (msg === 'No CroRIS data')
                  reasonDetail = 'Nema podataka iz sustava CroRIS'
                else if (msg === 'Lead CroRIS project')
                  reasonDetail = 'Registrirani ste kao voditelj na istraživačkim projektima u sustavu CroRIS. Posjetite stranicu "Moji podaci" za više detalja.'
                else if (msg === 'Associate CroRIS project')
                  reasonDetail = 'Registrirani ste kao suradnik na istraživačkim projektima u sustavu CroRIS. Posjetite stranicu "Moji podaci" za više detalja.'

                toast.error(
                  <span className="font-monospace text-dark">
                    Nemate mogućnost prijave institucijskog projekta:{' '}
                    { reasonDetail }
                  </span>, {
                    toastId: 'newreq-no-institute',
                    autoClose: 2500,
                  }
                )
                setContinueButtonDisabled(true)
              }
              else if (e.value === 'istrazivacki-projekt'
                && croRisData?.status?.code !== 200) {
                toast.error(
                  <span className="font-monospace text-dark">
                    Nema podataka iz sustava CroRIS
                  </span>, {
                    toastId: 'newreq-no-croris-data',
                    autoClose: 2500,
                  }
                )
                setContinueButtonDisabled(true)
              }
              else if (e.value === 'istrazivacki-projekt'
                && status === 'success'
                && croRisData?.data?.person_info?.lead_status !== true) {
                toast.error(
                  <span className="font-monospace text-dark">
                    Nemate projekata prijavljenih u sustavu CroRIS
                  </span>, {
                    toastId: 'newreq-no-croris',
                    autoClose: 2500,
                  }
                )
                setContinueButtonDisabled(true)
              }
              else
                setContinueButtonDisabled(false)

              return setSelectedProject(e)
            }}
            isDisabled={buttonDisabled}
            options={requestTypesToSelect}
            value={selectedProject}
          />
          <Button
            color="success"
            className="ms-lg-3 ms-md-3 ms-xs-0 ms-sm-0 mt-sm-3 mt-xs-3 mt-lg-0 mt-md-0 mt-3"
            disabled={buttonDisabled || continueButtonDisabled}
            onClick={() => {
              if (!selectedProject)
                toast.warn(
                  <span className="font-monospace text-dark">
                    Morate odabrati jedan tip zahtjeva da biste nastavili
                  </span>, {
                    toastId: 'newreq-no-croris-data',
                    autoClose: 2500,
                  }
                )
              else
                navigate(selectedProject.value)
            }}
          >
            <FontAwesomeIcon icon={faArrowRight}/>{' '}
            Nastavi
          </Button>
        </Col>
        <Col className="d-md-block" lg={{size: 3}}>
        </Col>
      </Row>
      <Row>
        <Outlet />
      </Row>
    </>
  )
};

export default NewRequest;
