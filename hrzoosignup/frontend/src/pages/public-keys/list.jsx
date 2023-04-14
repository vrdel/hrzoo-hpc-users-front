import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from '../root';
import {
  Col,
  Row,
  Table,
  Collapse,
  Button,
  InputGroup,
  InputGroupText,
  Placeholder
} from 'reactstrap';
import { PageTitle } from '../../components/PageTitle';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchSshKeys, deleteSshKey } from '../../api/sshkeys';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCopy,
  faArrowDown,
  faKey,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/content.css';
import ModalAreYouSure from '../../components/ModalAreYouSure';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


const PublicKeys = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const [showedKeys, setShowedKeys] = useState(undefined);
  const [areYouSureModal, setAreYouSureModal] = useState(false)
  const [modalTitle, setModalTitle] = useState(undefined)
  const [modalMsg, setModalMsg] = useState(undefined)
  const [onYesCall, setOnYesCall] = useState(undefined)
  const [onYesCallArg, setOnYesCallArg] = useState(undefined)
  const [sshKeys, setSshKeys] = useState(undefined)
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const showKey = (keyname) => {
    let showed = new Object()
    if (showedKeys === undefined && keyname) {
      showed[keyname] = true
      setShowedKeys(showed)
    }
    else {
      showed = JSON.parse(JSON.stringify(showedKeys))
      showed[keyname] = !showed[keyname]
      setShowedKeys(showed)
    }
  }
  const isShowed = (keyname) => {
    if (showedKeys !== undefined)
      return showedKeys[keyname]
  }

  const {status, data: sshKeysData, error, isFetching} = useQuery({
      queryKey: ['ssh-keys'],
      queryFn: fetchSshKeys,
      staleTime: 15 * 60 * 1000
  })

  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
    if (sshKeysData?.length > 0)
      setSshKeys(sshKeysData)
    else if (sshKeysData?.length === 0)
      setSshKeys(new Array())
  }, [location.pathname, sshKeysData])

  const deleteMutation = useMutation({
    mutationFn: (keyname) => {
      return deleteSshKey(keyname)
    },
  })
  const doDelete = (keyname) => deleteMutation.mutate(keyname, {
    onSuccess: () => {
      queryClient.invalidateQueries('ssh-keys');
      toast.success(
        <span className="font-monospace text-dark">
          Javni ključ uspješno izbrisan
        </span>, {
          toastId: 'sshkey-ok-delete',
          autoClose: 2500,
          delay: 500
        }
      )
    },
    onError: (error) => {
      toast.error(
        <span className="font-monospace text-dark">
          Javni ključ nije bilo moguće izbrisati:{' '}
          { error.message }
        </span>, {
          toastId: 'sshkey-fail-delete',
          autoClose: 2500,
          delay: 500
        }
      )
    }
  })

  function onYesCallback() {
    if (onYesCall == 'doremovesshkey') {
      doDelete(onYesCallArg)
    }
  }

  if (status === 'success' && sshKeys?.length > 0)
  {
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
        <Row className="mt-4 ms-4 me-4 mb-5">
          <Col>
            <Table responsive hover className="shadow-sm">
              <thead id="hzsi-thead" className="table-active align-middle text-center text-white">
                <tr className="border-bottom border-2 border-dark">
                  <th className="fw-normal">
                    Ime ključa
                  </th>
                  <th className="fw-normal">
                    Digitalni otisak ključa
                  </th>
                  <th className="fw-normal">
                    Tip
                  </th>
                  <th className="fw-normal">
                    Radnje
                  </th>
                </tr>
              </thead>
              <tbody>
                { sshKeys.map((key, index) =>
                  <>
                    <tr key={index}>
                      <td className="p-3 align-middle text-center">
                        { key.name }
                      </td>
                      <td className="p-3 align-middle text-center font-monospace" style={{maxLength: '5'}}>
                        { key.fingerprint }
                      </td>
                      <td className="align-middle text-center">
                        { key.public_key.split(' ')[0] }
                      </td>
                      <td className="align-middle text-center">
                        <Button size="sm" color="primary" onClick={() => showKey(key.name)}>
                          <FontAwesomeIcon icon={faArrowDown} />
                        </Button>
                        <Button size="sm" className="ms-2" color="danger" onClick={() => {
                          setAreYouSureModal(!areYouSureModal)
                          setModalTitle("Brisanje javnog ključa")
                          setModalMsg("Da li ste sigurni da želite obrisati javni ključ?")
                          setOnYesCall('doremovesshkey')
                          setOnYesCallArg(key.name)
                        }}>
                          <FontAwesomeIcon icon={faTimes} />
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td  className="p-0 m-0" colSpan="4">
                        <Collapse className="m-2 p-2" isOpen={isShowed(key.name)}>
                          <Row>
                            <Col sm={{size: 11}}>
                              <InputGroup>
                                <InputGroupText>
                                  Javni ključ:
                                </InputGroupText>
                                <textarea
                                  className="font-monospace form-control"
                                  rows="5"
                                  placeholder={
                                    key.public_key
                                  }
                                />
                              </InputGroup>
                            </Col>
                            <Col className="d-flex align-self-center align-content-center">
                              <Button size="sm" className="ms-3" color="success">
                                <FontAwesomeIcon icon={faCopy} />
                              </Button>
                            </Col>
                          </Row>
                        </Collapse>
                      </td>
                    </tr>
                  </>
                )}
                {
                  sshKeys.length < 5 && [...Array(5 - sshKeys.length)].map((e, i) =>
                    <tr key={i + 5}>
                      <td colSpan="4" style={{height: "40px"}}>
                      </td>
                    </tr>
                  )
                }
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row className="mb-5 mt-5">
          <Col className="d-flex justify-content-center">
            <Button color="success" onClick={() => {
                navigate('novi')
            }}>
              <FontAwesomeIcon icon={faKey}/>{' '}
              Dodaj javni ključ
            </Button>
          </Col>
        </Row>
      </>
    )
  }
  else if (status === "success" && sshKeys?.length === 0) {
    return (
      <>
        <Row>
          <PageTitle pageTitle={pageTitle}/>
        </Row>
        <Row className="mt-4 ms-4 me-4 mb-3">
          <Col>
            <Table responsive hover className="shadow-sm">
              <thead id="hzsi-thead" className="table-active align-middle text-center text-white">
                <tr className="border-bottom border-2 border-dark">
                  <th className="fw-normal">
                    Ime ključa
                  </th>
                  <th className="fw-normal">
                    Digitalni otisak ključa
                  </th>
                  <th className="fw-normal">
                    Tip
                  </th>
                  <th className="fw-normal">
                    Radnje
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="4" className="m-0 p-0 bg-light border-0">
                        <Placeholder size="lg" xs={12} style={{height: '40px', backgroundColor: "rgba(255, 255, 255, 0)"}}/>
                      </td>
                    </tr>
                  ))
                }
                <tr key="4">
                  <td colSpan="4" className="table-light border-0 text-muted text-center p-3 fs-3">
                    Nemate javnih ključeva dodanih
                  </td>
                </tr>
                {
                  [...Array(3)].map((_, i) => (
                    <tr key={i + 6}>
                      <td colSpan="4" className="m-0 p-0 bg-light border-0">
                        <Placeholder size="lg" xs={12} style={{height: '40px', backgroundColor: "rgba(255, 255, 255, 0)"}}/>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row className="mb-2 mt-3">
          <Col className="d-flex justify-content-center">
            <Button color="success" onClick={() => {
                navigate('novi')
            }}>
              <FontAwesomeIcon icon={faKey}/>{' '}
              Dodaj javni ključ
            </Button>
          </Col>
        </Row>
      </>
    )
  }
};

export default PublicKeys;
