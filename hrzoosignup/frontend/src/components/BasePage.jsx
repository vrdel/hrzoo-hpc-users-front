import React, { useState, useEffect,  useContext } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { ToastContainer } from 'react-toastify'
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
import { QueryClient } from '@tanstack/react-query';

export const ModalContext = React.createContext();


const BasePage = ({isSessionActive=false}) => {
  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYesCall, setOnYesCall] = useState(undefined)
  const { logout: doLogoutContext, isLoggedIn } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = new QueryClient()

  const prefetchCroRisData = async() => {
    await queryClient.prefetchQuery({
      queryKey: ['croris-info'],
      queryFn: fetchCroRIS
    })
  }

  function onYesCallback() {
    if (onYesCall == 'dologout') {
      doLogout(() => navigate(defaultUnAuthnRedirect))
      doLogoutContext()
    }
  }

  useEffect(() => {
    if (!(isLoggedIn || isSessionActive))
      navigate(defaultUnAuthnRedirect, {replace: true, state: {"from": location}})
    else
      prefetchCroRisData()
  }, [isSessionActive, isLoggedIn])

  if (isLoggedIn || isSessionActive)
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
          <ToastContainer />
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
