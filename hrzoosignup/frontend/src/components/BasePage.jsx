import React, { useState, useEffect,  useContext } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import Navigation from 'Components/Navigation';
import NavigationLinks from 'Components/NavigationLinks';
import ModalAreYouSure from 'Components/ModalAreYouSure';
import Footer from 'Components/Footer';
import { Outlet, useNavigate } from 'react-router-dom';
import 'Styles/content.css';
import { doLogout } from 'Api/auth';
import { fetchCroRISMe } from 'Api/croris';
import { AuthContext } from 'Components/AuthContextProvider';
import { defaultUnAuthnRedirect} from 'Config/default-redirect';
import { useQuery } from '@tanstack/react-query';
import { IntlContext } from 'Components/IntlContextProvider';
import HeadTitle from 'Components/HeadTitle';

export const ModalContext = React.createContext();


const BasePage = ({sessionData=undefined}) => {
  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [noToast, setNoToast] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [userMode, setUserMode] = useState(false);
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYesCall, setOnYesCall] = useState(undefined)
  const [onYesCallArg, setOnYesCallArg] = useState(undefined)
  const {
    logout: doLogoutContext,
    isLoggedIn, setUserdetails,
    setCsrfToken, loginType, 
    setEnableAccounting } = useContext(AuthContext)
  const navigate = useNavigate()
  const { locale, setLocale } = useContext(IntlContext)

  const {status, data: croRisData, error, failureReason, isFetching} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRISMe,
      staleTime: 15 * 60 * 1000
  })

  if (status === 'success' && croRisData && !noToast)
    if (croRisData['status']['code'] !== 200 && !noToast) {
      // for person not having entry in CroRIS just skip silently
      if (!croRisData['status']['message'].includes('Ne postoji traženi resurs')
        && !croRisData['status']['message'].includes('Could not parse JSON data from CroRIS'))
        toast.error(
          <span className="font-monospace">
            { croRisData['status']['message'] }
          </span>, {
            theme: 'colored',
            autoClose: false,
            toastId: 'basepage-no-croris',
            onClose: () => setNoToast(true)
          }
        )
    }

  async function onYesCallback() {
    if (onYesCall === 'dologout') {
      await doLogout(sessionData.csrftoken)
      doLogoutContext()
      if (loginType === 'saml2') {
        if (sessionData.saml2_idp.toLowerCase().includes('edugainproxy'))
          window.location = '/saml2/edugain/logout'
        else
          window.location = '/saml2/logout'
      }
      else
        window.location = defaultUnAuthnRedirect
    }
  }

  useEffect(() => {
    if (!(isLoggedIn || sessionData.active))
      navigate(defaultUnAuthnRedirect)
    else {
      sessionData?.userdetails && setUserdetails(sessionData.userdetails)
      sessionData?.csrftoken && setCsrfToken(sessionData.csrftoken)
      sessionData?.config?.enable_accounting && setEnableAccounting(sessionData.config.enable_accounting)
      const loginLocaleSet = localStorage.getItem('loginLocaleSet')
      if (loginLocaleSet && loginLocaleSet !== locale) {
        setLocale(loginLocaleSet)
        localStorage.removeItem('loginLocaleSet')
      }
    }
  }, [sessionData, isLoggedIn])

  if (isLoggedIn || sessionData.active)
    return (
      // TODO: <Container fluid={userMode ? "xl" : false} className="pt-1 d-flex flex-column" style={userMode ? {maxWidth: '1500px'} : {maxWidth: '100%'}}>
      <Container fluid="xl" className="pt-1 d-flex flex-column" style={{maxWidth: '1600px'}}>
        <HeadTitle />
        <ModalAreYouSure
          isOpen={areYouSureModal}
          toggle={() => setAreYouSureModal(!areYouSureModal)}
          title={modalTitle}
          msg={modalMsg}
          onYes={onYesCallback} />
        <ToastContainer/>
        <Row>
          <Col>
            <ModalContext.Provider
              value={{
                setAreYouSureModal, setModalTitle, setModalMsg, setOnYesCall,
                areYouSureModal, setOnYesCallArg
              }}
            >
              <Navigation />
              <NavigationLinks userMode={userMode} setUserMode={setUserMode} />
            </ModalContext.Provider>
          </Col>
        </Row>
        <Row id="hzsi-contentwrap" className="shadow-sm pt-3 pb-3 border-start border-end rounded">
          <Col>
            <Outlet />
          </Col>
        </Row>
        <Row className="mt-2">
          <Col>
            <Footer />
          </Col>
        </Row>
      </Container>
    )
  else
    return false
}

export default BasePage
