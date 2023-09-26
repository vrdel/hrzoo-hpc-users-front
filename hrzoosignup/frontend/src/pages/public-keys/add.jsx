import React, { useContext, useState, useEffect, useRef } from 'react';
import { SharedData } from '../root';
import {
  Col,
  Row,
  Button,
  InputGroup,
  Input,
  Label,
  Form,
  FormFeedback
} from 'reactstrap';
import { PageTitle } from '../../components/PageTitle';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addSshKey } from '../../api/sshkeys';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faFile,
  faKey,
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/content.css';
import ModalAreYouSure from '../../components/ModalAreYouSure';
import { useForm, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { url_ui_prefix } from '../../config/general';
import { AuthContext } from '../../components/AuthContextProvider';


const NewPublicKey = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYesCall, setOnYesCall] = useState(undefined)
  const [onYesCallArg, setOnYesCallArg] = useState(undefined)
  const [sshKeyFile, setSshKeyFile] = useState(undefined)
  const { csrfToken } = useContext(AuthContext)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const refFileInput = useRef(null)


  const { control, setValue, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      public_key: '',
      imported_public_key: ''
    }
  });

  const onSubmit = (data) => {
    setAreYouSureModal(!areYouSureModal)
    setModalTitle("Dodavanje javnog ključa")
    setModalMsg("Da li ste sigurni da želite dodati javni ključ?")
    setOnYesCall('doaddsshkey')
    setOnYesCallArg(data)
  }

  function onYesCallback() {
    if (onYesCall == 'doaddsshkey') {
      doAdd(onYesCallArg)
    }
  }

  function uploadKeyFile(event) {
    const reader = new FileReader()
    reader.onload = (event) => {
      setSshKeyFile(event.target.result)
    }
    reader.readAsText(event.target.files[0])
  }

  const addMutation = useMutation({
    mutationFn: (data) => {
      return addSshKey(data, csrfToken)
    },
  })
  const doAdd = (data) => addMutation.mutate(data, {
    onSuccess: () => {
      queryClient.invalidateQueries('ssh-keys');
      toast.success(
        <span className="font-monospace text-dark">
          Javni ključ uspješno dodan
        </span>, {
          toastId: 'sshkey-ok-add',
          autoClose: 2500,
          delay: 500,
          onClose: () => setTimeout(() => {navigate(url_ui_prefix + '/javni-kljucevi')}, 1500)
        }
      )
    },
    onError: (error) => {
      toast.error(
        <span className="font-monospace text-dark">
          Javni ključ nije bilo moguće dodati:{' '}
          { error.message }
        </span>, {
          toastId: 'sshkey-fail-add',
          autoClose: 2500,
          delay: 500
        }
      )
    }
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
    if (sshKeyFile)
      setValue('public_key', sshKeyFile)
  }, [location.pathname, sshKeyFile])

  return (
    <>
      <Row>
        <PageTitle pageTitle={pageTitle}/>
      </Row>
      <ModalAreYouSure
        isOpen={areYouSureModal}
        toggle={() => setAreYouSureModal(!areYouSureModal)}
        title={modalTitle}
        msg={modalMsg}
        onYes={onYesCallback} />
      <Form onSubmit={handleSubmit(onSubmit)} className="needs-validation">
        <Row style={{minHeight: '60px'}}>
        </Row>
        <Row>
          <Col className="mt-4" sm={{size: 3, offset: 1}}>
            <Label for="name" className="fs-5 text-white ps-2 pe-2 pt-1 pb-1" style={{backgroundColor: "#b04c46"}}>
              Ime ključa:
            </Label>
            <InputGroup>
              <Controller
                name="name"
                control={control}
                rules={{required: true}}
                render={ ({field}) =>
                  <Input
                    {...field}
                    placeholder="moj-laptop"
                    className={`form-control shadow-sm fs-5 ${errors && errors.name && "is-invalid"}`}
                  />
                }
              />
              <ErrorMessage
                errors={errors}
                name="name"
                render={({ message }) =>
                  <FormFeedback className="end-0">
                    { message }
                  </FormFeedback>
                }
              />
            </InputGroup>
            <Row style={{minHeight: '60px'}}>
            </Row>
            <Row className="d-none d-lg-block">
              <Col>
                <FontAwesomeIcon icon={faKey} className="ms-5 fa-10x" style={{color: "#f1f1f1"}}/>
              </Col>
            </Row>
          </Col>
          <Col className="ms-4 g-0" sm={{size: 7}}>
            <div className="d-flex justify-content-between">
              <Label className="mt-4 fs-5 ps-2 pe-2 pt-1 pb-1 text-white" style={{backgroundColor: "#b04c46"}} for="public_key">
                Javni ključ:
              </Label>
              <Input
                type='file'
                id="fileInput"
                className="d-none"
                innerRef={refFileInput}
                onChange={(e) => {
                  uploadKeyFile(e)
                }}
              />
              <Button color="success" className="mt-3 mb-2 me-5 me-sm-0 me-md-0 me-xl-0" onClick={() => refFileInput.current.click()}>
                <FontAwesomeIcon icon={faFile}/>{' '}
                Učitaj
              </Button>
            </div>
            <InputGroup>
              <Controller
                name="public_key"
                control={control}
                rules={{required: true}}
                render={ ({field}) =>
                  <textarea
                    name="public_key"
                    {...field}
                    aria-label="public_key"
                    type="text"
                    placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAA... me@laptop"
                    className={`shadow-sm bg-body rounded font-monospace fs-5 me-5 me-sm-0 me-md-0 me-xl-0 form-control ${errors && errors.public_key ? "is-invalid" : ''}`}
                    rows="12"
                  />
                }
              />
              <ErrorMessage
                errors={errors}
                name="public_key"
                render={({ message }) =>
                  <FormFeedback className="end-0">
                    { message }
                  </FormFeedback>
                }
              />
            </InputGroup>
            <Row className="g-0 mt-1 me-2 me-sm-2 me-md-2 me-xl-2">
              <Col md={{size: 12}} sm={{size: 12}} xl={{size: 12}}  >
                <small className="fst-italic">
                  <span className="fw-bold">Napomena:</span> U formu se zalijepi javna komponenta ključa (id_rsa.pub) ili se ista može učitati iz datoteke
                </small>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className='mt-5 mb-5'>
          <Col className="text-center">
            <Button size="lg" className="mt-3" color="success" type="submit">
              <FontAwesomeIcon icon={faPlus}/>{' '}
              Dodaj
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  )
}

export default NewPublicKey;
