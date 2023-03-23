import React from 'react'
import { Navbar, Nav, NavbarText } from 'reactstrap'


const Footer = () => {
  let dateObj = new Date()
  let year = new Intl.DateTimeFormat('hr-HR', {year: 'numeric'}).format(dateObj)
  let month = new Intl.DateTimeFormat('hr-HR', {month: 'numeric'}).format(dateObj)
  let day = new Intl.DateTimeFormat('hr-HR', {day: 'numeric'}).format(dateObj)

  return (
    <Navbar expand="md">
      <Nav>
        <NavbarText className="fs-6 fst-italic font-monospace">
          {day}{month}{year}
        </NavbarText>
      </Nav>
      <Nav>
        <NavbarText className="fs-6 fst-italic font-monospace">
            dvrcic
        </NavbarText>
      </Nav>
    </Navbar>
  )
}

export default Footer
