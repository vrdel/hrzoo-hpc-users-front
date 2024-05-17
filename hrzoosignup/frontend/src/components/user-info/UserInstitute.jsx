import React from 'react';
import { MiniButton } from 'Components/MiniButton';
import { copyToClipboard } from 'Utils/copy-clipboard';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { Col, Row, Table, Label } from 'reactstrap';
import { FormattedMessage, useIntl } from 'react-intl';


const InstituteTableInfo = ({userDetails}) => {
  const intl = useIntl()

  return (
    <React.Fragment>
      <Row>
        <Col className="mt-4 ms-3" sm={{size:3}}>
          <Label for="dir" className="fs-5 text-white ps-2 pe-2 pt-1 pb-1" style={{backgroundColor: "#b04c46"}}>
            <FormattedMessage
              defaultMessage="Imenik"
              description="userins-directory"
            />
          </Label>
        </Col>
      </Row>
      <Row>
        <Col className="mt-3 ms-4" md={{size: 11}}>
          <Table borderless responsive className="text-left">
            <thead>
              <tr>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  <FormattedMessage
                    defaultMessage="Ime"
                    description="userins-firstname"
                  />
                </th>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  <FormattedMessage
                    defaultMessage="Prezime"
                    description="userins-lastname"
                  />
                </th>
                <th className="fw-bold fs-5" style={{width: '30%'}}>
                  <FormattedMessage
                    defaultMessage="Korisnička oznaka"
                    description="userins-useridentifier"
                  />
                </th>
                <th className="fw-bold fs-5">
                  Email
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {
                    userDetails.first_name ?
                      userDetails.first_name
                    :
                      '\u2212'
                  }
                </td>
                <td>
                  {
                    userDetails.last_name ?
                      userDetails.last_name
                    :
                      '\u2212'
                  }
                </td>
                <td className="font-monospace">
                  {
                    userDetails.person_uniqueid ?
                      <span className="d-flex align-items-center">
                        { userDetails.person_uniqueid }
                        <MiniButton
                          childClassName="me-3"
                          onClick={(e) => copyToClipboard(
                            e, userDetails.person_uniqueid,
                            intl.formatMessage({
                              defaultMessage: "Korisnička oznaka kopirana u međuspremnik",
                              description: "usersins-clipboard-ok"
                            }),
                            intl.formatMessage({
                              defaultMessage: "Greška prilikom kopiranja korisničke oznake u međuspremnik",
                              description: "userins-clipboard-fail"
                            }),
                            "id-uid"
                          )}
                        >
                          <FontAwesomeIcon size="xs" icon={faCopy} />
                        </MiniButton>
                      </span>
                    :
                      '\u2212'
                  }
                </td>
                <td className="font-monospace">
                  {
                    userDetails.person_mail ?
                      <span className="d-flex align-items-center">
                        { userDetails.person_mail }
                        <MiniButton
                          childClassName="me-3"
                          onClick={(e) => copyToClipboard(
                            e, userDetails.person_mail,
                            intl.formatMessage({
                              defaultMessage: "Email korisnika kopiran u međuspremnik",
                              description: "userinfo-croris-clipboard-ok"
                            }),
                            intl.formatMessage({
                              defaultMessage: "Greška prilikom kopiranja emaila korisnika u međuspremnik",
                              description: "userinfo-croris-clipboard-fail"
                            }),
                            "id-emailuser"
                          )}
                        >
                          <FontAwesomeIcon size="xs" icon={faCopy} />
                        </MiniButton>
                      </span>
                    :
                      '\u2212'
                  }
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
      <Row>
        <Col className="ms-4" md={{size: 11}}>
          <Table borderless responsive className="text-left">
            <thead>
              <tr>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  <FormattedMessage
                    defaultMessage="Povezanost"
                    description="userins-affiliation"
                  />
                </th>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  <FormattedMessage
                    defaultMessage="Naziv ustanove"
                    description="userins-institution"
                  />
                </th>
                <th className="fw-bold fs-5" style={{width: '30%'}}>
                </th>
                <th className="fw-bold fs-5" style={{width: '30%'}}>
                  <FormattedMessage
                    defaultMessage="Organizacijska jedinica"
                    description="userins-organizationalunit"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {
                    userDetails.person_affiliation ?
                      userDetails.person_affiliation
                    :
                      '\u2212'
                  }
                </td>
                <td colSpan="2">
                  {
                    userDetails.person_institution ?
                      userDetails.person_institution
                    :
                      '\u2212'
                  }
                </td>
                <td>
                  {
                    userDetails.person_organisation ?
                      userDetails.person_organisation
                    :
                      '\u2212'
                  }
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default InstituteTableInfo
