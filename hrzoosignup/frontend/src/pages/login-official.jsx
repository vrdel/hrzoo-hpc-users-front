import React, { useEffect, useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useForm, Controller } from "react-hook-form";
import SrceLogoTiny from '../assets/srce-logo-e-mail-sig.png';
import SrceBig from '../assets/pravisrce.png';
import {
  Alert,
  Container,
  Button,
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  Input,
  Label,
  CardFooter,
  Form,
  FormGroup } from 'reactstrap';
import {
  faLaptopCode,
} from '@fortawesome/free-solid-svg-icons';
import '../styles/login-official.css';
import { doUserPassLogin } from '../api/auth';
import { AuthContext } from '../components/AuthContextProvider.jsx';


const LoginOfficial = () => {
  const [loginFailedVisible, setLoginFailedVisible] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  });
  const { login : doLoginContext } = useContext(AuthContext);

  async function doLogin(username, password) {
    const session = await doUserPassLogin(username, password)

    if (session.active)
      doLoginContext(session.userdetails)
    else
      setLoginFailedVisible(true)
  }

  const onSubmit = (data) => {
    doLogin(data.username, data.password)
  }

  return (
    <Container fluid className="d-flex justify-content-center" style={{minHeight: '100vh'}}>
      <Row>
        <Col>
          <div style={{'height': '130px'}}/>
          <Card className="shadow" style={{height: '600px', width: '650px'}}>
            <CardHeader
              id='hzsi-loginheader'
              className="p-5 d-sm-inline-flex align-items-center justify-content-center "
            >
              <FontAwesomeIcon icon={faLaptopCode} style={{color: "#c00000"}} size="4x" />
              <h2 className="ms-5 text-dark"><strong>Napredno računanje</strong></h2>
            </CardHeader>
            <CardBody className="pt-5">

              <p className="fs-4 mb-4 text-center">
                Prijavom u sustav potvrđujete da prihvaćate{' '}
                <a href="https://www.srce.unizg.hr/napredno-racunanje/pravila" target="_blank" rel="noopener noreferrer">
                  Pravila korištenja usluge Napredno računanje
                </a>
              </p>
              <a className="btn mt-5 fs-3 btn-success btn-lg btn-block" style={{width: '100%'}} role="button" href= {`/saml2/login`}>Prijava putem AAI@EduHR</a>
            </CardBody>
            <CardFooter id="hzsi-loginfooter" style={{height: "100px"}}>
              <div className="text-center pt-3">
                <a href="https://www.srce.unizg.hr/" target="_blank" rel="noopener noreferrer">
                  <img src={SrceBig} id="srcelogo" alt="SRCE Logo"/>
                </a>
              </div>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginOfficial;
