import React, { useState } from 'react';
import { Col, Badge, Row, Table, Label, Tooltip, Button } from 'reactstrap';
import { faCheckCircle, faStopCircle, faCopy} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { copyToClipboard } from 'Utils/copy-clipboard';
import {  FormattedMessage } from 'react-intl';


const TooltipMsgActive = ({myInfo=true}) => {
  if (myInfo)
    return (
      <>
        Aktivan<br/>
        Prijavljeni ste na bar jedan aktivan projekt
      </>
    )
  else
    return (
      <>
        Aktivan<br/>
        Korisnik je prijavljen na bar jedan aktivan projekt
      </>
    )
}

const TooltipMsgInactive = ({myInfo}) => {
  if (myInfo)
    return (
      <>
        Neaktivan<br/>
        Niste prijavljeni ni na jedan aktivan projekt
      </>
    )
  else
    return (
      <>
        Neaktivan<br/>
        Korisnik nije prijavljen ni na jedan aktivan projekt
      </>
    )
}


const StatusInfo = ({myInfo=true, userDetails}) => {
  const [tooltipOpened, setTooltipOpened] = useState(undefined);
  const showTooltip = (toolid) => {
    let showed = new Object()
    if (tooltipOpened === undefined && toolid) {
      showed[toolid] = true
      setTooltipOpened(showed)
    }
    else {
      showed = JSON.parse(JSON.stringify(tooltipOpened))
      showed[toolid] = !showed[toolid]
      setTooltipOpened(showed)
    }
  }
  const isOpened = (toolid) => {
    if (tooltipOpened !== undefined)
      return tooltipOpened[toolid]
  }

  if (userDetails && userDetails.first_name && userDetails.person_username)
    return (
      <React.Fragment>
        <Row>
          <Col className="d-flex flex-row mt-4 ms-3 align-items-center" sm={{size:3}}>
            <Label for="dir" className="fs-5 text-white ps-2 pe-2 pt-1 pb-1" style={{backgroundColor: "#b04c46"}}>
              <FormattedMessage description="statusinfo" defaultMessage="Status" />
            </Label>
            <div className="fs-5 ps-2 d-flex align-items-center">
              {
                userDetails.status ?
                  <React.Fragment>
                    <FontAwesomeIcon id={`Tooltip-${userDetails.first_name.replace(/ /g, '-')}`} className="ms-3 fa-2x me-3" color="#198754" icon={ faCheckCircle } />
                    <Tooltip
                      placement='right'
                      isOpen={isOpened(userDetails.first_name)}
                      target={'Tooltip-' + userDetails.first_name.replace(/ /g, '-')}
                      toggle={() => showTooltip(userDetails.first_name)}
                    >
                      <TooltipMsgActive myInfo={myInfo} />
                    </Tooltip>
                  </React.Fragment>
                :
                  <React.Fragment>
                    <FontAwesomeIcon id={`Tooltip-${userDetails.first_name.replace(/ /g, '-')}`} className="ms-3 fa-2x me-3" color="#DC3545" icon={ faStopCircle } />
                    <Tooltip
                      placement='bottom'
                      isOpen={isOpened(userDetails.first_name)}
                      target={'Tooltip-' + userDetails.first_name.replace(/ /g, '-')}
                      toggle={() => showTooltip(userDetails.first_name)}
                    >
                      <TooltipMsgInactive myInfo={myInfo} />
                    </Tooltip>
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
                          <Badge color="success" className="fs-5" id={`Tooltip-${userDetails.person_username}`}>
                            {userDetails.person_username}
                            <Tooltip
                              placement='right'
                              isOpen={isOpened(userDetails.person_username)}
                              target={'Tooltip-' + userDetails.person_username}
                              toggle={() => showTooltip(userDetails.person_username)}
                            >
                              <FormattedMessage
                                description="statusinfo-tooltip"
                                defaultMessage="Dodijeljeno
                                  korisničko ime za pristup resursima"
                              />
                            </Tooltip>
                          </Badge>
                          <Button
                            className="ms-1"
                            color="light"
                            onClick={(e) => copyToClipboard(
                              e, userDetails.person_username,
                              "Korisničko ime kopirano u međuspremnik",
                              "Greška prilikom kopiranja korisničkog imena u međuspremnik",
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
      </React.Fragment>
    )
  else
    return null
}

export default StatusInfo
