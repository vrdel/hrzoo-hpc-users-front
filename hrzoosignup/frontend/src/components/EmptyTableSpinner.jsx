import React from "react";
import { Col, Row, Table, Spinner } from "reactstrap";
import { PageTitle } from "./PageTitle";


export const EmptyTableSpinner = ({ pageTitle, colSpan, children }) => {
  return (
    <React.Fragment>
      <Row>
        <PageTitle pageTitle={ pageTitle } />
      </Row>
      <Row className="mt-4">
        <Col>
          <Table responsive hover className="shadow-sm">
            { children }
            <tbody>
              <tr>
                <td colSpan={colSpan} className="m-0 p-0 border-0 text-center p-5 m-5">
                  <Spinner
                    style={{
                      height: '20rem',
                      width: '20rem',
                      borderColor: '#b04c46',
                      borderRightColor: 'transparent'
                    }}
                  />
                </td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </React.Fragment>
  )
}
