import React from "react";
import { copyToClipboard } from 'Utils/copy-clipboard';
import { MiniButton } from 'Components/MiniButton';
import { Col, Row, PopoverHeader, PopoverBody } from "reactstrap";
import { useQuery } from "@tanstack/react-query";
import { fetchSpecificUser } from "Api/users";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faArrowRight, faHome, faGlobe } from "@fortawesome/free-solid-svg-icons";


const PopoverUserInfo = ({rhfId, userName, showPopover}) => {
  const {status, data: userData, error} = useQuery({
      queryKey: ['change-user', userName],
      queryFn: () => fetchSpecificUser(userName),
  })

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
                "Korisnička oznaka kopirana u međuspremnik",
                "Greška prilikom kopiranja korisničke oznake u međuspremnik",
                "id-username"
              )}
            >
              <FontAwesomeIcon size="xs" icon={faCopy} />
            </MiniButton>
          </span>
          {
            userData.person_type === 'local'?
              <FontAwesomeIcon color="#777777" icon={ faHome } />
            :
              <FontAwesomeIcon color="#777777" icon={ faGlobe } />
          }
        </PopoverHeader>
        <PopoverBody>
          <Row>
            <Col className="fw-bold">
              Ime i prezime
            </Col>
          </Row>
          <Row>
            <Col className="ms-2 me-2 fs-6 fst-italic">
              {`${userData.first_name} ${userData.last_name}`}
            </Col>
          </Row>
          <Row className="mt-2">
            <Col className="fw-bold">
              Ustanova
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
              Email
            </Col>
          </Row>
          <Row>
            <Col className="d-flex font-monospace align-items-center ms-2 me-2 fs-6 fst-italic">
              {`${userData.person_mail}`}
              <MiniButton
                childClassName="me-3"
                onClick={(e) => copyToClipboard(
                  e, userData.person_mail,
                  "Email korisnika kopiran u međuspremnik",
                  "Greška prilikom kopiranja emaila korisnika u međuspremnik",
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
                Detalji korisnika
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
