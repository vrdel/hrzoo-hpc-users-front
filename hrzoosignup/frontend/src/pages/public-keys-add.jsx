import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from './root';
import {
  Col,
  Row,
  Table,
  Button,
  InputGroup,
  Input,
  InputGroupText,
  Label,
  Placeholder,
  Form,
  FormFeedback
} from 'reactstrap';
import { PageTitle } from '../components/PageTitle';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addSshKey } from '../api/sshkeys';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCopy,
  faArrowDown,
  faKey,
  faPlus,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import '../styles/content.css';
import ModalAreYouSure from '../components/ModalAreYouSure';
import { useForm, Controller } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { toast } from 'react-toastify';


const NewPublicKey = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYesCall, setOnYesCall] = useState(undefined)
  const [onYesCallArg, setOnYesCallArg] = useState(undefined)

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
  }, [location.pathname])

  const queryClient = useQueryClient();

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      public_key: ''
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

  const addMutation = useMutation({
    mutationFn: (data) => {
      return addSshKey(data)
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
          delay: 500
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
        <Row>
          <Col className="mt-4" sm={{size: 3, offset: 1}}>
            <Label for="name" className="fs-5 fw-bold">
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
                    className={`form-control fs-5 ${errors && errors.name && "is-invalid"}`}
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
          </Col>
          <Col className="ms-4" sm={{size: 7}}>
            <Label className="mt-4 fs-5 fw-bold" for="public_key">
              Javni ključ:
            </Label>
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
                    className={`font-monospace fs-5 form-control ${errors && errors.public_key ? "is-invalid" : ''}`}
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
