import React, { useState } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import Navigation from './Navigation';
import NavigationLinks from './NavigationLinks';
import ModalAreYouSure from './ModalAreYouSure';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import '../styles/content.css';

export const ModalContext = React.createContext();


const BasePage = () => {
  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYesCall, setOnYesCall] = useState(undefined)

  function onYesCallback() {
    if (onYesCall)
      console.log('VRDEL DEBUG', 'im ok')
  }

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
}

export default BasePage
