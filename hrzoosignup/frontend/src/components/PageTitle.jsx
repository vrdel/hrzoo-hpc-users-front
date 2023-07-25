import React from 'react'
import { Col } from 'reactstrap';

export const PageTitle = ({pageTitle, isEditing=false, children}) => {

  if (isEditing)
    pageTitle = pageTitle.replace(/\w* /, 'Uređivanje ')

  return (
    <Col className={isEditing
      ? "ms-3 shadow-sm me-3 mt-2 p-2 mb-2 rounded text-white bg-danger"
      : "ms-3 shadow-sm me-3 mt-2 p-2 mb-2 rounded bg-light"}>
      <div className="d-flex justify-content-between">
        <h4 className="mt-2">
          { pageTitle }
        </h4>
        {children}
      </div>
    </Col>
  )
}
