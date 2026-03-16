import React from 'react';
import { Col, Badge, Row, Table, Form, Overlay, Tooltip, Button } from 'react-bootstrap';
import { faCheckCircle, faStopCircle, faCopy, faHome, faGlobe} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { copyToClipboard } from 'Utils/copy-clipboard';
import { FormattedMessage, useIntl } from 'react-intl';
import { useOpenedIndexMap } from 'Hooks/indexed-map';


const TooltipMsgActive = ({myInfo=true}) => {
  if (myInfo)
    return (
      <>
        <FormattedMessage
          defaultMessage="Aktivan {br}
                          Prijavljeni ste na bar jedan aktivan projekt"
          description="statusinfo-tooltipactive-1"
          values={{
            br: <br/>
          }}
        />
      </>
    )
  else
    return (
      <>
        <FormattedMessage
          defaultMessage="Aktivan {br}
                          Korisnik je prijavljen na bar jedan aktivan projekt"
          description="statusinfo-tooltipactive-2"
          values={{
            br: <br/>
          }}
        />
      </>
    )
}


const TooltipMsgLocal = () => {
  return (
    <>
      <FormattedMessage
        defaultMessage="Lokalni korisnik"
        description="statusinfo-tooltiplocal-1"
      />
    </>
  )
}


const TooltipMsgGlobe = () => {
  return (
    <>
      <FormattedMessage
        defaultMessage="Strani korisnik"
        description="statusinfo-tooltipglobe-1"
      />
    </>
  )
}


const TooltipMsgInactive = ({myInfo}) => {
  if (myInfo)
    return (
      <>
        <FormattedMessage
          defaultMessage="Neaktivan {br}
                          Niste prijavljeni ni na jedan aktivan projekt"
          description="statusinfo-tooltipinactive-1"
          values={{
            br: <br/>
          }}
        />
      </>
    )
  else
    return (
      <>
        <FormattedMessage
          defaultMessage="Neaktivan {br}
                          Korisnik nije prijavljen ni na jedan aktivan projekt"
          description="statusinfo-tooltipinactive-2"
          values={{
            br: <br/>
          }}
        />
      </>
    )
}


const StatusInfo = ({myInfo=true, userDetails}) => {
  const intl = useIntl()
  const { isOpen, toggleIndex } = useOpenedIndexMap()

  if (userDetails && userDetails.first_name && userDetails.person_username)
    return (
      <div className="overflow-hidden">
        <Row>
          <Col className="d-flex flex-row mt-4 ms-3 align-items-center" sm={{span:3}}>
            <Form.Label htmlFor="dir" className="fs-5 text-white ps-2 pe-2 pt-1 pb-1" style={{backgroundColor: "#b04c46"}}>
              <FormattedMessage description="statusinfo" defaultMessage="Status" />
            </Form.Label>
            <div className="fs-5 ps-2 d-flex align-items-center">
              {
                userDetails.status ?
                  <React.Fragment>
                    <FontAwesomeIcon id={`Tooltip-${userDetails.first_name.replace(/ /g, '-')}`} className="ms-3 fa-2x me-3" color="#198754" icon={ faCheckCircle } />
                    <Overlay
                      placement='right'
                      show={isOpen(userDetails.first_name)}
                      target={document.getElementById('Tooltip-' + userDetails.first_name.replace(/ /g, '-'))}
                    >
                      {(props) => (
                        <Tooltip {...props}>
                          <TooltipMsgActive myInfo={myInfo} />
                        </Tooltip>
                      )}
                    </Overlay>
                  </React.Fragment>
                :
                  <React.Fragment>
                    <FontAwesomeIcon id={`Tooltip-${userDetails.first_name.replace(/ /g, '-')}`} className="ms-3 fa-2x me-3" color="#DC3545" icon={ faStopCircle } />
                    <Overlay
                      placement='bottom'
                      show={isOpen(userDetails.first_name)}
                      target={document.getElementById('Tooltip-' + userDetails.first_name.replace(/ /g, '-'))}
                    >
                      {(props) => (
                        <Tooltip {...props}>
                          <TooltipMsgInactive myInfo={myInfo} />
                        </Tooltip>
                      )}
                    </Overlay>
                  </React.Fragment>
              }
              {
                userDetails.person_type === 'local'?
                  <React.Fragment>
                    <FontAwesomeIcon id={`Tooltip-type-${userDetails.first_name.replace(/ /g, '-')}`} className="ms-2 fa-2x me-2" color="#777777" icon={ faHome } />
                    <Overlay
                      placement='right'
                      show={isOpen(`${userDetails.first_name}-type`)}
                      target={document.getElementById('Tooltip-type-' + userDetails.first_name.replace(/ /g, '-'))}
                    >
                      {(props) => (
                        <Tooltip {...props}>
                          <TooltipMsgLocal />
                        </Tooltip>
                      )}
                    </Overlay>
                  </React.Fragment>
                :
                  <React.Fragment>
                    <FontAwesomeIcon id={`Tooltip-type-${userDetails.first_name.replace(/ /g, '-')}`} className="ms-2 fa-2x me-2" color="#777777" icon={ faGlobe } />
                    <Overlay
                      placement='right'
                      show={isOpen(`${userDetails.first_name}-type`)}
                      target={document.getElementById('Tooltip-type-' + userDetails.first_name.replace(/ /g, '-'))}
                    >
                      {(props) => (
                        <Tooltip {...props}>
                          <TooltipMsgGlobe />
                        </Tooltip>
                      )}
                    </Overlay>
                  </React.Fragment>
              }
            </div>
          </Col>
        </Row>
        {
          userDetails.person_username &&
            <Row className="mt-3 mb-3">
              <Col className="mt-3 ms-4">
                <Table borderless responsive className="text-left">
                  <thead>
                    <tr>
                      <th className="fw-bold fs-5">
                        <FormattedMessage description="statusinfo-username" defaultMessage="Korisničko ime" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <Badge bg="success" className="fs-5" id={`Tooltip-${userDetails.person_username}`}>
                            {userDetails.person_username}
                          </Badge>
                          <Overlay
                            placement='right'
                            show={isOpen(userDetails.person_username)}
                            target={document.getElementById('Tooltip-' + userDetails.person_username)}
                          >
                            {(props) => (
                              <Tooltip {...props}>
                                <FormattedMessage
                                  description="statusinfo-tooltip"
                                  defaultMessage="Dodijeljeno
                                    korisničko ime za pristup resursima"
                                />
                              </Tooltip>
                            )}
                          </Overlay>
                          <Button
                            className="ms-1"
                            variant="light"
                            onClick={(e) => copyToClipboard(
                              e, userDetails.person_username,
                              intl.formatMessage({
                                defaultMessage: "Korisničko ime kopirano u međuspremnik",
                                description: "statusinfo-clipboard-ok"
                              }),
                              intl.formatMessage({
                                defaultMessage: "Greška prilikom kopiranja korisničkog imena u međuspremnik",
                                description: "statusinfo-clipboard-fail"
                              }),
                              "username"
                            )}
                          >
                            <FontAwesomeIcon icon={faCopy} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
        }
      </div>
    )
  else
    return null
}

export default StatusInfo
