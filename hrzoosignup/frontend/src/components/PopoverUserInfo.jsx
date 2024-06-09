import React from "react";
import { copyToClipboard } from 'Utils/copy-clipboard';
import { MiniButton } from 'Components/MiniButton';
import { Col, Row, PopoverHeader, PopoverBody } from "reactstrap";
import { useQuery } from "@tanstack/react-query";
import { fetchSpecificUser } from "Api/users";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faArrowRight, faHome, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage, useIntl } from 'react-intl';


const PopoverUserInfo = ({rhfId, userName, showPopover}) => {
  const {status, data: userData, error} = useQuery({
      queryKey: ['change-user', userName],
      queryFn: () => fetchSpecificUser(userName),
  })
  const intl = useIntl();

  if (status === 'success' && userData) {
    return (
      <>
        <PopoverHeader className="d-flex align-items-center font-monospace justify-content-between">
          <span className="d-flex flex-row align-items-center">
            { userName }
            <MiniButton
              childClassName="me-3"
              onClick={(e) => copyToClipboard(
                e, userName,
                intl.formatMessage({
                  defaultMessage: "Korisnička oznaka kopirana u međuspremnik",
                  description: "popover-username-copy-ok"
                }),
                intl.formatMessage({
                  defaultMessage: "Greška prilikom kopiranja korisničke oznake u međuspremnik",
                  description: "popover-username-copy-fail"
                }),
                "id-username"
              )}
            >
              <FontAwesomeIcon size="xs" icon={faCopy} />
            </MiniButton>
          </span>
          {
            userData.person_type === 'local' ?
              <FontAwesomeIcon color="#777777" icon={ faHome } />
            :
              <FontAwesomeIcon color="#777777" icon={ faGlobe } />
          }
        </PopoverHeader>
        <PopoverBody>
          <Row>
            <Col className="fw-bold">
              <FormattedMessage
                defaultMessage="Ime i prezime"
                description="popover-firstlast-name"
              />
            </Col>
          </Row>
          <Row>
            <Col className="ms-2 me-2 fs-6 fst-italic">
              {`${userData.first_name} ${userData.last_name}`}
            </Col>
          </Row>
          <Row className="mt-2">
            <Col className="fw-bold">
              <FormattedMessage
                defaultMessage="Ustanova"
                description="popover-institution"
              />
            </Col>
          </Row>
          <Row>
            <Col className="ms-2 me-2 fs-6 fst-italic">
              {`${userData.person_institution}`}<br/>
              <small>{`${userData.person_affiliation}`}</small>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col className="fw-bold">
              <FormattedMessage
                defaultMessage="Email"
                description="popover-email"
              />
            </Col>
          </Row>
          <Row>
            <Col className="d-flex font-monospace align-items-center ms-2 me-2 fs-6 fst-italic">
              {`${userData.person_mail}`}
              <MiniButton
                childClassName="me-3"
                onClick={(e) => copyToClipboard(
                  e, userData.person_mail,
                  intl.formatMessage({
                    defaultMessage: "Email korisnika kopiran u međuspremnik",
                    description: "popover-emailuser-copy-ok"
                  }),
                  intl.formatMessage({
                    defaultMessage: "Greška prilikom kopiranja emaila korisnika u međuspremnik",
                    description: "popover-emailuser-copy-fail"
                  }),
                  "id-emailuser"
                )}
              >
                <FontAwesomeIcon size="xs" icon={faCopy} />
              </MiniButton>
            </Col>
          </Row>
          <Row className="mt-4">
            <Col className="d-flex justify-content-center align-items-center align-self-center">
              <a className="btn btn-primary btn-sm"
                target="_blank"
                style={{'textDecoration': 'none'}}
                rel="noopener noreferrer"
                role="button"
                onClick={() => showPopover(rhfId)}
                href={`/ui/users/${userData.username}`}
              >
                <FontAwesomeIcon icon={faArrowRight}/>{' '}
                <FormattedMessage
                  defaultMessage="Detalji korisnika"
                  description="popover-user-details"
                />
              </a>
            </Col>
          </Row>
        </PopoverBody>
      </>
    )
  }
  else
    return null
}

export default PopoverUserInfo;
