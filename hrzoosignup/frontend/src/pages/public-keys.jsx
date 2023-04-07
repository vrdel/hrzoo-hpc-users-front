import React, { useContext, useState, useEffect } from 'react';
import { SharedData } from './root';
import { Col, Row, Table, Form } from 'reactstrap';
import { PageTitle } from '../components/PageTitle';
import { useQuery } from '@tanstack/react-query';
import { fetchSshKeys } from '../api/sshkeys';
import { useForm, Controller, useWatch, useFieldArray } from "react-hook-form";



const PublicKeys = () => {
  const { LinkTitles } = useContext(SharedData);
  const [pageTitle, setPageTitle] = useState(undefined);
  const [sshData, setSshData] = useState(undefined);

  const {status, data: sshKeysData, error, isFetching} = useQuery({
      queryKey: ['ssh-keys'],
      queryFn: fetchSshKeys,
      staleTime: 15 * 60 * 1000
  })
  useEffect(() => {
    setPageTitle(LinkTitles(location.pathname))
    setSshData(sshKeysData)
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
    console.log('VRDEL DEBUG', fields, sshKeysData)
    return (
      <>
        <Row>
          <PageTitle pageTitle={pageTitle}/>
        </Row>

        <Row className="mt-4 ms-4 me-4 mb-3">
          <Col>
            <Form onSubmit={handleSubmit(() => {})} className="needs-validation">
              <Table bordered responsive hover size="sm">
                <thead className="table-active table-bordered align-middle text-center">
                  <tr>
                    <th>
                      Ime kljuca
                    </th>
                    <th>
                      Digitalni otisak ključa
                    </th>
                    <th>
                      Tip
                    </th>
                    <th style={{'width': '60px'}}>
                      Akcije
                    </th>
                  </tr>
                </thead>
                <tbody>
                  { fields.map((key, index) =>
                    <tr key={key.id}>
                      <td className="align-middle text-center">
                        { key.name }
                      </td>
                      <td className="align-middle text-center">
                        { key.fingerprint }
                      </td>
                      <td className="align-middle text-center">
                        { key.public_key}
                      </td>
                    </tr>
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
