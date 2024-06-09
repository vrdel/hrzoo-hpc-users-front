import React, { useState } from 'react';
import {
  Col,
  Row,
  Table,
  Collapse,
  Button,
  InputGroup,
  InputGroupText,
  Spinner
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCopy,
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import { copyToClipboard } from 'Utils/copy-clipboard';
import { FormattedMessage, useIntl } from 'react-intl';


export const TableUserKeys = ({sshKeys, statusSshKeys}) => {
  const [showedKeys, setShowedKeys] = useState(undefined)
  const intl = useIntl()

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

  return (
    <Row className="ms-2 me-3 g-0">
      <Col>
        <Table responsive hover className="shadow-sm">
          <thead id="hzsi-thead" className="align-middle text-center text-white">
            <tr>
              <th className="fw-normal">
                <FormattedMessage
                  defaultMessage="Ime ključa"
                  description="tableuserkeys-keyname"
                />
              </th>
              <th className="fw-normal">
                <FormattedMessage
                  defaultMessage="Digitalni otisak ključa"
                  description="tableuserkeys-fingerprint"
                />
              </th>
              <th className="fw-normal">
                <FormattedMessage
                  defaultMessage="Tip"
                  description="tableuserkeys-type"
                />
              </th>
              <th className="fw-normal">
                <FormattedMessage
                  defaultMessage="Radnje"
                  description="tableuserkeys-actions"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            { sshKeys && sshKeys.length > 0 && sshKeys.map((key, index) =>
              <React.Fragment key={index}>
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
                  </td>
                </tr>
                <tr>
                  <td  className="p-0 m-0" colSpan="4">
                    <Collapse className="m-2 p-2" isOpen={isShowed(key.name)}>
                      <Row>
                        <Col sm={{size: 11}}>
                          <InputGroup>
                            <InputGroupText>
                              <FormattedMessage
                                defaultMessage="Javni ključ:"
                                description="tableuserkeys-label"
                              />
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
                          <Button size="sm" className="ms-3" color="success"
                            onClick={(e) => copyToClipboard(
                              e, key.public_key,
                              intl.formatMessage({
                                defaultMessage: "Javni ključ kopiran u međuspremnik",
                                description: "tableuserkeys-toast-ok"
                              }),
                              intl.formatMessage({
                                defaultMessage: "Greška prilikom kopiranja javnog ključa u međuspremnik",
                                description: "tableuserkeys-toast-fail"
                              }),
                              "sshkey"
                            )}
                          >
                            <FontAwesomeIcon icon={faCopy} />
                          </Button>
                        </Col>
                      </Row>
                    </Collapse>
                  </td>
                </tr>
              </React.Fragment>
            )}
            {
              sshKeys && sshKeys.length === 0 &&
                <tr key="4">
                  <td colSpan="4" className="table-light border-0 text-muted text-center p-3 fs-5">
                    <FormattedMessage
                      defaultMessage="Korisnik nema javnih ključeva dodanih"
                      description="tableuserkeys-empty"
                    />
                  </td>
                </tr>
            }
            {
              statusSshKeys === 'loading' &&
                <tr key="4">
                  <td colSpan="4" className="table-light border-0 text-muted text-center p-3 fs-5">
                    <Spinner
                      style={{
                        height: '3rem',
                        width: '3rem',
                        borderColor: '#b04c46',
                        borderRightColor: 'transparent'
                      }}
                    />
                  </td>
                </tr>
            }
          </tbody>
        </Table>
      </Col>
    </Row>
  )
}
