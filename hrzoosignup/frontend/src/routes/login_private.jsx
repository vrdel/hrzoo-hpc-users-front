import React, { useEffect, useState } from 'react';
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
  CardFooter,
  Form,
  FormGroup } from 'reactstrap';
import {
  faLaptopCode,
} from '@fortawesome/free-solid-svg-icons';
import '../css/login.css';


const LoginPrivate = () => {
  const [loginFailedVisible, setLoginFailedVisible] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit = (data) => {
  }

  return (
    <Container>
      <Row className="login-first-row">
        <Col sm={{size: 4, offset: 4}}>
          <Card>
            <CardHeader
              id='hzsi-loginheader'
              className="d-sm-inline-flex align-items-center justify-content-around"
            >
              <FontAwesomeIcon icon={faLaptopCode} style={{color: "#c00000"}} size="3x" />
              <h4 className="text-dark"><strong>HRZOO Prijava</strong></h4>
            </CardHeader>
            <CardBody>
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
                    type="password"
                    control={control}
                    rules={{required: true}}
                    render={ ({field}) =>
                      <Input {...field}
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
                <div className="pt-3">
                </div>
                <FormGroup>
                  <Button color="success" type="submit" block className="mb-3">Prijava korisničkim imenom i lozinkom</Button>
                  <a className="btn btn-success btn-block" style={{width: '100%'}} role="button" href= {`/saml2/login`}>Prijava AAI @ EduHR</a>
                </FormGroup>
              </Form>
            </CardBody>
            <CardFooter id="hzsi-loginfooter">
              Footer
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPrivate;
