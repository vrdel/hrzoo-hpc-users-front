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
import { fetchCroRISMe } from 'Api/croris';
import { canSubmitInstituteProject } from 'Api/projects';
import { toast } from 'react-toastify';
import { AuthContext } from 'Components/AuthContextProvider';
import { defaultUnAuthnRedirect} from 'Config/default-redirect';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl'


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
  const intl = useIntl()

  let requestTypesToSelect = RequestTypesToSelect(intl)
  if (!userDetails.is_staff && !userDetails.is_superuser) {
    requestTypesToSelect = RequestTypesToSelect(intl).filter((e) =>
      e.value !== 'internal-project' && e.value !== 'srce-workshop'
    )
  }

  const {status, data: croRisData, error} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRISMe,
      staleTime: 15 * 60 * 1000
  })

  const {status: statusSubmitInstitute, data: dataSubmitInstitute, error:
    errorSubmitInstitute} = useQuery({
      queryKey: ['can-submit-institute'],
      queryFn: canSubmitInstituteProject,
      staleTime: 15 * 60 * 1000
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname, intl))
    if (location.pathname.endsWith('new-request'))
      setButtonDisabled(false)
    else {
      setButtonDisabled(true)
      setSelectedProject(UrlToRequestType(location.pathname, intl))
    }
    if (status === 'error' && error.message.includes('403'))
      navigate(defaultUnAuthnRedirect)
  }, [location.pathname, status, intl])

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
            <FormattedMessage
              defaultMessage="Tip zahtjeva"
              description="newrequest-label"
            />
          </Label>
          <CustomReactSelect
            id="requestType"
            aria-label="requestType"
            className="ms-lg-5 me-lg-0 ms-md-5 me-md-0 me-xs-5 me-sm-5 me-5 ms-xs-0 ms-sm-0 ms-0 mt-lg-0 mt-md-0 mt-xs-2 mt-sm-2 mt-2 shadow-sm"
            placeholder={
              intl.formatMessage({
                defaultMessage: "Odaberi",
                description: "newrequest-select-placeholder"
              })
            }
            controlWidth="40%"
            onChange={(e) => {
              if (e.value === 'institutional-project'
                && statusSubmitInstitute === 'success'
                && dataSubmitInstitute?.status?.operation === 'DENY') {
                // && dataSubmitInstitute?.status?.operation === 'ALLOW') {
                let msg = dataSubmitInstitute.status.message
                let reasonDetail = ''

                if (msg === 'MBZ unknown')
                  reasonDetail = intl.formatMessage({
                    defaultMessage: 'Matični broj znanstvenika (MBZ) nije poznat',
                    description: 'newrequest-reason-mbzunk'
                  })
                else if (msg === 'Already submitted')
                  reasonDetail = intl.formatMessage({
                    defaultMessage: 'Jedan institucijski projekt je već prijavljen',
                    description: 'newrequest-reason-institutionalready'
                  })
                else if (msg === 'Access CroRIS')
                  reasonDetail = intl.formatMessage({
                    defaultMessage: 'Pristup ste već ostvarili temeljem istraživačkog projekta u sustavu CroRIS',
                    description: 'newrequest-reason-alreadycroris'
                  })
                else if (msg === 'No CroRIS data')
                  reasonDetail = intl.formatMessage({
                    defaultMessage: 'Nema podataka iz sustava CroRIS',
                    description: 'newrequest-reason-nocroris'
                  })
                else if (msg === 'Lead CroRIS project')
                  reasonDetail = intl.formatMessage({
                    defaultMessage: 'Registrirani ste kao voditelj na istraživačkim projektima u sustavu CroRIS. Posjetite stranicu "Moji podaci" za više detalja.',
                    description: 'newrequest-reason-alreadylead'
                  })
                else if (msg === 'Associate CroRIS project')
                  reasonDetail = intl.formatMessage({
                    defaultMessage: 'Registrirani ste kao suradnik na istraživačkim projektima u sustavu CroRIS. Posjetite stranicu "Moji podaci" za više detalja.',
                    description: 'newrequest-reason-alreadyassociate'
                  })
                toast.error(
                  <span className="font-monospace text-dark">
                    <FormattedMessage
                      defaultMessage="Nemate mogućnost prijave institucijskog projekta: { reasonDetail }"
                      description="newrequest-no-instituteproject-titleexplanation"
                      values={{
                        reasonDetail
                      }}
                    />
                  </span>, {
                    toastId: 'newreq-no-institute',
                    autoClose: 2500,
                  }
                )
                setContinueButtonDisabled(true)
              }
              else if (e.value === 'research-project'
                && status === 'success'
                && croRisData?.status?.code !== 200) {
                toast.error(
                  <span className="font-monospace text-dark">
                    <FormattedMessage defaultMessage="Nema podataka iz sustava CroRIS"
                      description="newqrequest-no-crorisdata"
                    />
                  </span>, {
                    toastId: 'newreq-no-croris-data',
                    autoClose: 2500,
                  }
                )
                setContinueButtonDisabled(true)
              }
              else if (e.value === 'research-project'
                && status === 'success'
                && croRisData?.data?.person_info?.lead_status !== true) {
                toast.error(
                  <span className="font-monospace text-dark">
                    <FormattedMessage
                      defaultMessage="Nemate projekata prijavljenih u sustavu CroRIS"
                      description="newrequest-no-researchproject"
                    />
                  </span>, {
                    toastId: 'newreq-no-croris',
                    autoClose: 2500,
                  }
                )
                setContinueButtonDisabled(true)
              }
              else if (e.value === 'thesis-project') {
                toast.info(
                  <span className="font-monospace text-dark">
                    <FormattedMessage
                      defaultMessage='Zahtjev "Izrada rada" se odnosi na izradu završnih, diplomskih i doktorskih radova i podnosi ga mentor. Po odobrenju zahtjeva, mentor poziva studenta ili doktoranda na projekt.'
                      description="newrequest-thesis-explanation"
                    />
                  </span>, {
                    toastId: 'newreq-thesis',
                    autoClose: 5000,
                  }
                )
                setContinueButtonDisabled(false)
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
                    <FormattedMessage
                      defaultMessage="Morate odabrati jedan tip zahtjeva da biste nastavili"
                      description="newrequest-norequest-selected"
                    />
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
            <FormattedMessage
              defaultMessage="Nastavi"
              description="newrequest-continue-label"
            />
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
