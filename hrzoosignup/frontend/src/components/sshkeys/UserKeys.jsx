import React, { useContext, useState, useEffect } from 'react';
import {
  Col,
  Row,
  Table,
  Collapse,
  Button,
  InputGroup,
  InputGroupText,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCopy,
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import { copyToClipboard } from 'Utils/copy-clipboard';


export const TableUserKeys = ({sshKeys}) => {
  const [showedKeys, setShowedKeys] = useState(undefined);

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
              <React.Fragment key={index}>
                <tr key={index}>
                  <td className="p-3 align-middle fs-5 text-center">
                    { key.name }
                  </td>
                  <td className="p-3 align-middle fs-5 text-center font-monospace" style={{maxLength: '5'}}>
                    { key.fingerprint }
                  </td>
                  <td className="align-middle fs-5 text-center">
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
                          <Button size="sm" className="ms-3" color="success"
                            onClick={(e) => copyToClipboard(
                              e, key.public_key,
                              "Javni ključ kopiran u međuspremnik",
                              "Greška prilikom kopiranja javnog ključa u međuspremnik",
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
          </tbody>
        </Table>
      </Col>
    </Row>
  )
}
