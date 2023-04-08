import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from './root';
import { Col, Row, Table, Form, Collapse, Button, InputGroup, Input, InputGroupText } from 'reactstrap';
import { PageTitle } from '../components/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { fetchSshKeys } from '../api/sshkeys';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCopy,
  faArrowDown,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useForm, Controller, useWatch, useFieldArray } from "react-hook-form";
import '../styles/content.css';



const PublicKeys = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const [showedKeys, setShowedKeys] = useState(undefined);

  const showKey = (keyid) => {
    let showed = new Object()
    if (showedKeys === undefined && keyid) {
      showed[keyid] = true
      setShowedKeys(showed)
    }
    else {
      showed = JSON.parse(JSON.stringify(showedKeys))
      showed[keyid] = !showed[keyid]
      setShowedKeys(showed)
    }
  }
  const isShowed = (keyid) => {
    if (showedKeys !== undefined)
      return showedKeys[keyid]
  }

  const {status, data: sshKeysData, error, isFetching} = useQuery({
      queryKey: ['ssh-keys'],
      queryFn: fetchSshKeys,
      staleTime: 15 * 60 * 1000
  })
  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
    if (sshKeysData?.length > 0)
      setValue('sshKeys', sshKeysData)
  }, [location.pathname, sshKeysData])

  const onSubmit = data => {
    JSON.stringify(data, null, 2)
  }

  const { control, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      sshKeys: sshKeysData
    }
  });

  const { fields, remove } = useFieldArray({
    control,
    name: "sshKeys"
  })

  if (status === 'success' && sshKeysData.length > 0)
  {
    return (
      <>
        <Row>
          <PageTitle pageTitle={pageTitle}/>
        </Row>

        <Row className="mt-4 ms-4 me-4 mb-3">
          <Col>
            <Form onSubmit={handleSubmit(() => {})} className="needs-validation">
              <Table responsive hover>
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
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody>
                  { fields.map((key, index) =>
                    <>
                      <tr key={key.id}>
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
                          <Button size="sm" color="primary" onClick={() => showKey(key.id)}>
                            <FontAwesomeIcon icon={faArrowDown} />
                          </Button>
                          <Button size="sm" className="ms-2" color="danger" onClick={() => showKey(key.id)}>
                            <FontAwesomeIcon icon={faTimes} />
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td  className="p-0 m-0" colSpan="4">
                          <Collapse className="m-2 p-2" isOpen={isShowed(key.id)}>
                            <Row>
                              <Col sm={{size: 11}}>
                                <InputGroup>
                                  <InputGroupText>
                                    Javni ključ:
                                  </InputGroupText>
                                  <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder={
                                      key.public_key
                                    }
                                  />
                                </InputGroup>
                              </Col>
                              <Col>
                                <Button color="success">
                                  <FontAwesomeIcon icon={faCopy} />
                                </Button>
                              </Col>
                            </Row>
                          </Collapse>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </Table>
            </Form>
          </Col>
        </Row>
      </>
    )
  }
};

export default PublicKeys;
