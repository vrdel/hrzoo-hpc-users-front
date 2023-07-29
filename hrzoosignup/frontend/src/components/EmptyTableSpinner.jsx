import React from "react";
import { Col, Row, Table, Spinner } from "reactstrap";
import { PageTitle } from "./PageTitle";


export const EmptyTableSpinner = ({ pageTitle=undefined, colSpan, rowClass=undefined, children }) => {
  let wrapRowClass = "mt-4"

  if (rowClass)
    wrapRowClass = wrapRowClass + ' ' + rowClass

  return (
    <React.Fragment>
      {
        pageTitle &&
        <Row>
          <PageTitle pageTitle={ pageTitle } />
        </Row>
      }
      <Row className={wrapRowClass}>
        <Col>
          <Table responsive className="shadow-sm">
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
