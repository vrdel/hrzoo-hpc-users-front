import React, { useState, useEffect,  useContext } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import Navigation from './Navigation';
import NavigationLinks from './NavigationLinks';
import ModalAreYouSure from './ModalAreYouSure';
import Footer from './Footer';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import '../styles/content.css';
import { doLogout } from '../api/auth';
import { fetchCroRIS } from '../api/croris';
import { AuthContext } from '../utils/AuthContextProvider';
import { defaultUnAuthnRedirect} from '../config/default-redirect';
import { useQuery } from '@tanstack/react-query';

export const ModalContext = React.createContext();


const BasePage = ({sessionData=undefined}) => {
  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [noToast, setNoToast] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYesCall, setOnYesCall] = useState(undefined)
  const { logout: doLogoutContext, isLoggedIn, setUserdetails } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()

  const {status, data: croRisData, error, failureReason, isFetching} = useQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRIS,
      staleTime: 15 * 60 * 1000
  })

  if (status === 'success' && croRisData) {
    if (croRisData['status']['code'] !== 200 && !noToast)
      toast.error(
        <span className="font-monospace">
          { JSON.stringify(croRisData['status'], null, 2) }
        </span>, {
          autoClose: false,
          toastId: 'basepage-no-croris',
          onClose: () => setNoToast(true)
        }
      )
  }
  else if (status === 'error')
    toast.error(
      <span className="font-monospace">
        { failureReason.message }
      </span>, {
        autoClose: false,
        toastId: 'basepage-no-croris',
        onClose: () => setNoToast(true)
      }
    )

  function onYesCallback() {
    if (onYesCall == 'dologout') {
      doLogout(() => navigate(defaultUnAuthnRedirect))
      doLogoutContext()
    }
  }

  useEffect(() => {
    if (!(isLoggedIn || sessionData.active))
      navigate(defaultUnAuthnRedirect, {replace: true, state: {"from": location}})
    else
      sessionData?.userdetails && setUserdetails(sessionData.userdetails)
  }, [sessionData, isLoggedIn])

  if (isLoggedIn || sessionData.active)
    return (
      <Container fluid="xl" className="pt-1 d-flex flex-column">
        <ModalContext.Provider
          value={{
            setAreYouSureModal, setModalTitle,
            setModalMsg, setOnYesCall, areYouSureModal
          }}
        >
          <ModalAreYouSure
            isOpen={areYouSureModal}
            toggle={() => setAreYouSureModal(!areYouSureModal)}
            title={modalTitle}
            msg={modalMsg}
            onYes={onYesCallback} />
          <ToastContainer theme='colored' />
          <Row>
            <Col>
              <Navigation />
              <NavigationLinks />
            </Col>
          </Row>
          <Row id="hzsi-contentwrap" className="pt-3 pb-3 border-start border-end rounded">
            <Col>
              <Outlet />
            </Col>
          </Row>
          <Row>
            <Col>
              <Footer />
            </Col>
          </Row>
        </ModalContext.Provider>
      </Container>
    )
  else
    return false
}

export default BasePage
