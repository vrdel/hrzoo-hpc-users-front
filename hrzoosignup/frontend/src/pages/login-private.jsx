import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useForm, Controller } from "react-hook-form";
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
  Form,
  FormGroup } from 'reactstrap';
import {
  faLaptopCode,
} from '@fortawesome/free-solid-svg-icons';
import '../styles/login.css';
import { doUserPassLogin } from '../api/auth';
import { AuthContext } from '../components/AuthContextProvider';
import { defaultAuthnRedirect, defaultAuthnRedirectStaff } from '../config/default-redirect';
import { useNavigate } from 'react-router-dom';


const LoginPrivate = ({sessionData=undefined}) => {
  const [loginFailedVisible, setLoginFailedVisible] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  });
  const { login: doLoginContext } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionData?.active && sessionData?.userdetails)
      if (sessionData.userdetails.is_staff
        || sessionData.userdetails.is_superuser)
        navigate(defaultAuthnRedirectStaff)
      else
        navigate(defaultAuthnRedirect)
  }, [sessionData])

  async function doLogin(username, password) {
    const session = await doUserPassLogin(username, password)

    if (session.active)
      doLoginContext(session)
    else
      setLoginFailedVisible(true)
  }

  const onSubmit = (data) => {
    doLogin(data.username, data.password)
  }

  return (
    <Container fluid className="image-background d-flex justify-content-center" style={{minHeight: '100vh'}}>
      <Row className="login-first-row">
        <Col>
          <Row style={{'height': '110px'}}/>
          <Card className="shadow-lg p-2" style={{minHeight: '475px', width: '450px'}}>
            <CardHeader
              id='hzsi-loginheader'
              className="d-sm-inline-flex align-items-center justify-content-around"
            >
              <FontAwesomeIcon icon={faLaptopCode} style={{color: "#c00000"}} size="3x" />
              <h4 className="text-dark"><strong>Napredno računanje</strong></h4>
            </CardHeader>
            <CardBody className="pt-5">
              <Form onSubmit={handleSubmit(onSubmit)} className="needs-validation">
                <FormGroup className="text-start">
                  <Label for="username">Korisničko ime: </Label>
                  <Controller
                    name="username"
                    control={control}
                    rules={{required: true}}
                    render={ ({field}) =>
                      <Input {...field}
                        className={`form-control ${errors.username} && "is-invalid"`}
                      />
                    }
                  />
                </FormGroup>
                <FormGroup className="text-start">
                  <Label for="password">Lozinka: </Label>
                  <Controller
                    name="password"
                    control={control}
                    rules={{required: true}}
                    render={ ({field}) =>
                      <Input {...field}
                        type="password"
                        className={`form-control ${errors.password} && "is-invalid"`}
                      />
                    }
                  />
                </FormGroup>
                <FormGroup>
                  <Alert color="danger"
                    isOpen={loginFailedVisible}
                    toggle={() => setLoginFailedVisible(false)} fade={false}>
                    <p className="text-center">
                      Prijava neuspjela, pogrešno korisničko ime i lozinka
                    </p>
                  </Alert>
                </FormGroup>
                <div className="pt-4">
                </div>
                <FormGroup>
                  <Button color="success" type="submit" block className="mb-3">Prijava korisničkim imenom i lozinkom</Button>
                  <a className="btn btn-success btn-block" style={{width: '100%'}} role="button" href= {`/saml2/login`}>Prijava AAI @ EduHR</a>
                </FormGroup>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPrivate;
