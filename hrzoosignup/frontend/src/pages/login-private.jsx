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
  CardFooter,
  Input,
  Label,
  Form,
  FormGroup } from 'reactstrap';
import {
  faLaptopCode,
} from '@fortawesome/free-solid-svg-icons';
import 'Styles/login.css';
import { doUserPassLogin } from 'Api/auth';
import { AuthContext } from 'Components/AuthContextProvider';
import {
  defaultAuthnRedirect,
  defaultAuthnRedirectStaff,
  defaultAuthnRedirectWithAccounting,
  defaultAuthnRedirectWithAccountingLead
} from 'Config/default-redirect';
import { useNavigate } from 'react-router-dom';
import { LanguageButtonLogin } from 'Components/LocaleButton';
import { IntlContext } from 'Components/IntlContextProvider';
import SrceLogoHead from 'Assets/srce-logo-head-mid.png';
import SrceLogoHeadEn from 'Assets/srce-logo-head-mid-en.png';
import { useIntl } from 'react-intl'
import { FormattedMessage } from 'react-intl';


const LoginPrivate = ({sessionData=undefined}) => {
  const [loginFailedVisible, setLoginFailedVisible] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  });
  const { login: doLoginContext, setLoginType } = useContext(AuthContext);
  const { locale, setLocale } = useContext(IntlContext)
  const navigate = useNavigate();
  const intl = useIntl()

  useEffect(() => {
    if (sessionData?.active && sessionData?.userdetails)
      if (sessionData.userdetails.is_staff
        || sessionData.userdetails.is_superuser)
        navigate(defaultAuthnRedirectStaff)
      else {
        if (sessionData.config.enable_accounting)
          if (sessionData.userdetails.userproject_set.map(item => item.role.name).includes("lead"))
            navigate(defaultAuthnRedirectWithAccountingLead)
          else
            navigate(defaultAuthnRedirectWithAccounting)
        else
          navigate(defaultAuthnRedirect)
      }
  }, [sessionData])

  async function doLogin(username, password) {
    const session = await doUserPassLogin(username, password)

    if (session.active) {
      setLoginType('basic')
      doLoginContext(session)
    }
    else
      setLoginFailedVisible(true)
  }

  const onSubmit = (data) => {
    doLogin(data.username, data.password)
  }

  return (
    <Container fluid className={`image-background-${locale} d-flex justify-content-center`} style={{minHeight: '100vh'}}>
      <Row>
        <Col>
          <Row className="m-lg-3 p-lg-3 m-md-2 p-md-2 m-sm-1 p-sm-1"/>
          <Card className="shadow-lg ps-2 pe-2" style={{minHeight: '475px', width: '450px'}}>
            <CardHeader
              id='hzsi-loginheader'
              className="d-sm-inline-flex align-items-center justify-content-around"
            >
              {
                locale === 'hr' ?
                  <a href={intl.formatMessage({ defaultMessage: "https://www.srce.unizg.hr/napredno-racunanje", description: 'navigation-brand-link' })}
                    target="_blank" rel="noopener noreferrer">
                    <img src={SrceLogoHead} id="srcelogohr" alt="SRCE Logo HR"/>
                  </a>
                :
                  <a href={intl.formatMessage({ defaultMessage: "https://www.srce.unizg.hr/napredno-racunanje", description: 'navigation-brand-link' })}
                    target="_blank" rel="noopener noreferrer">
                    <img src={SrceLogoHeadEn} id="srcelogoen" alt="SRCE Logo EN"/>
                  </a>
              }
            </CardHeader>
            <CardBody className="pt-5">
              <Form onSubmit={handleSubmit(onSubmit)} className="needs-validation">
                <FormGroup className="text-start">
                  <Label for="username">
                    <FormattedMessage
                      defaultMessage="Korisničko ime:"
                      description="loginpriv-username"
                    />
                  </Label>
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
                  <Label for="password">
                    <FormattedMessage
                      defaultMessage="Lozinka:"
                      description="loginpriv-password"
                    />
                  </Label>
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
                      <FormattedMessage
                        defaultMessage="Prijava neuspjela, pogrešno korisničko ime i lozinka"
                        description="loginpriv-error"
                      />
                    </p>
                  </Alert>
                </FormGroup>
                <div className="pt-4">
                </div>
                <FormGroup>
                  <Button color="success" type="submit" block className="mb-3">
                    <FormattedMessage
                      defaultMessage="Prijava korisničkim imenom i lozinkom"
                      description="loginpriv-labelusernamepassword"
                    />
                  </Button>
                  <a className="btn btn-success btn-block" style={{width: '100%'}} role="button" href= {`/saml2/login`}>
                    <FormattedMessage
                      defaultMessage="Prijava AAI@EduHR"
                      description="loginpriv-labelaaieduhr"
                    />
                  </a>
                  {
                    sessionData?.config?.enable_edugain ?
                      <a className="mt-3 btn btn-primary btn-block" style={{width: '100%'}} role="button" href= {`/saml2/edugain/login`}>
                        <FormattedMessage
                          defaultMessage="Prijava eduGAIN"
                          description="loginpriv-labeledugain"
                        />
                      </a>
                    :
                      ''
                  }
                </FormGroup>
              </Form>
            </CardBody>
            <CardFooter className="bg-transparent d-flex align-items-center justify-content-center">
              <Row className="m-1">
                <Col>
                  <LanguageButtonLogin locale={locale} setLocale={setLocale} small={true}/>
                </Col>
              </Row>
            </CardFooter>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LoginPrivate;
