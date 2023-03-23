import React from 'react'
import { Row, Col, Container } from 'reactstrap'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import Footer from './Footer';


const DefaultPage = () => {
  return (
    <Container fluid="lg" className="d-flex flex-column">
      <ToastContainer/>
      <Row>
        <Col>
          <Navigation/>
        </Col>
      </Row>
      <Row className="pt-5">
        <Col className="pt-4">
          <Row>
            <Col>
              <h3 className="bg-light p-1 rounded border-bottom">
                { location.pathname }
              </h3>
            </Col>
          </Row>
          <Row className="pt-3">
            <Col>
              <Outlet />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mt-auto">
        <Col className="bg-secondary bg-opacity-10 border-top mt-2">
          <Footer/>
        </Col>
      </Row>
    </Container>
  )
}

export default DefaultPage
