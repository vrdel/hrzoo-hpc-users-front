import React, { useState, useContext } from 'react';
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  Badge,
  Popover,
  PopoverBody,
  Button,
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLaptopCode,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import '../styles/nav.css';
import { ModalContext } from './BasePage'

const Navigation = () => {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const modalContext = useContext(ModalContext)

  return (
    <Navbar expand="md" id="hzsi-nav" className="border rounded d-flex justify-content-between pt-3 pb-3">
      <NavbarBrand href="https://www.srce.unizg.hr/napredno-racunanje"
        target="_blank" rel="noopener noreferrer" className="text-dark">
        <FontAwesomeIcon className="ps-4" icon={faLaptopCode} style={{color: "#c00000"}} size="3x" />
      </NavbarBrand>
      <Nav navbar className="m-1">
        <span className="pl-3 font-weight-bold text-center">
          <h2>
            Zahtjev za korištenjem usluge Napredno računanje
          </h2>
        </span>
      </Nav>
      <Nav navbar >
        <NavItem className='m-2 text-dark'>
          <>
            Dobrodošli,
            <br/>
            <span onClick ={() => setPopoverOpen(!popoverOpen)} id="userPopover">
              <Badge href="#" className="text-dark" color="light"
                style={{fontSize: '100%', textDecoration: 'none'}}>
                <strong>Username</strong>
              </Badge>
            </span>
            <Popover placement="bottom" isOpen={popoverOpen}
              target="userPopover" toggle={() => setPopoverOpen(!popoverOpen)}>
              <PopoverBody>
                User details
              </PopoverBody>
            </Popover>
          </>
        </NavItem>
        <NavItem className='m-2 text-light'>
          <Button
            size="sm"
            aria-label="Odjava"
            className='btn-danger'
            onClick={() => {
              modalContext.setAreYouSureModal(!modalContext.areYouSureModal)
              modalContext.setModalTitle("Odjava")
              modalContext.setModalMsg("Da li ste sigurni da se želite odjaviti?")
              modalContext.setOnYesCall(true)
            }}>
            <FontAwesomeIcon icon={faSignOutAlt} color="white" />
          </Button>
        </NavItem>
      </Nav>
    </Navbar>
  );
};

export default Navigation;
