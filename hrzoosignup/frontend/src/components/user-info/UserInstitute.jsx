import React from 'react';
import { Col, Row, Table, Label } from 'reactstrap';


const InstituteTableInfo = ({userDetails}) => {
  return (
    <React.Fragment>
      <Row>
        <Col className="mt-4 ms-3" sm={{size:3}}>
          <Label for="dir" className="fs-5 text-white ps-2 pe-2 pt-1 pb-1" style={{backgroundColor: "#b04c46"}}>
            Imenik
          </Label>
        </Col>
      </Row>
      <Row>
        <Col className="mt-3 ms-4" md={{size: 11}}>
          <Table borderless responsive className="text-left">
            <thead>
              <tr>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  Ime
                </th>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  Prezime
                </th>
                <th className="fw-bold fs-5" style={{width: '30%'}}>
                  Korisnička oznaka
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
                <td>
                  {
                    userDetails.person_uniqueid ?
                      userDetails.person_uniqueid
                    :
                      '\u2212'
                  }
                </td>
                <td>
                  {
                    userDetails.person_mail ?
                      userDetails.person_mail
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
                  Povezanost
                </th>
                <th className="fw-bold fs-5" style={{width: '20%'}}>
                  Naziv ustanove
                </th>
                <th className="fw-bold fs-5" style={{width: '30%'}}>
                </th>
                <th className="fw-bold fs-5" style={{width: '30%'}}>
                  Organizacijska jedinica
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
