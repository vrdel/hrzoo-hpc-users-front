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
import 'Styles/nav.css';
import { ModalContext } from 'Components/BasePage'
import { AuthContext } from 'Components/AuthContextProvider';
import UserDetailsPopover from 'Components/UserDetailsPopover';
import { IntlContext } from 'Components/IntlContextProvider';
import { LanguageButtonNav } from 'Components/LocaleButton';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl'


const Navigation = () => {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const modalContext = useContext(ModalContext)
  const { userDetails } = useContext(AuthContext)
  const { locale, setLocale } = useContext(IntlContext)
  const intl = useIntl()

  return (
    <Navbar expand="md" id="hzsi-nav" className="shadow-sm border rounded d-flex justify-content-between mt-2 mb-2 pt-3 pb-3">
      <NavbarBrand href="https://www.srce.unizg.hr/napredno-racunanje"
        target="_blank" rel="noopener noreferrer" className="text-dark">
        <FontAwesomeIcon className="ps-4" icon={faLaptopCode} style={{color: "#c00000"}} size="3x" />
      </NavbarBrand>
      <Nav navbar className="m-1">
        <span className="pl-3 font-weight-bold text-center">
          <h2>
            <FormattedMessage
              description="navigation-title"
              defaultMessage="Zahtjev za korištenje usluge Napredno računanje"
            />
          </h2>
        </span>
      </Nav>
      <Nav navbar>
        <NavItem className="d-flex align-items-center">
          <LanguageButtonNav locale={locale} setLocale={setLocale} />
        </NavItem>
        <NavItem className='m-2 text-dark'>
          <>
            <FormattedMessage
              description="navigation-welcome"
              defaultMessage="Dobrodošli"
            />,
            <br/>
            <span onClick ={() => setPopoverOpen(!popoverOpen)} id="userPopover">
              <Badge href="#" className="text-dark" color="light"
                style={{fontSize: '100%', textDecoration: 'none'}}>
                <strong>{userDetails?.first_name}</strong>
              </Badge>
            </span>
            <Popover placement="bottom" isOpen={popoverOpen}
              target="userPopover" toggle={() => setPopoverOpen(!popoverOpen)}>
              <PopoverBody>
                <UserDetailsPopover />
              </PopoverBody>
            </Popover>
          </>
        </NavItem>
        <NavItem className='d-flex align-items-center me-3 m-2 text-light'>
          <Button
            size="sm"
            aria-label="Odjava"
            className='btn-danger'
            onClick={() => {
              modalContext.setAreYouSureModal(!modalContext.areYouSureModal)
              modalContext.setModalTitle(intl.formatMessage({
                defaultMessage: 'Odjava',
                description: 'navigation-modaltitle'
              }))
              modalContext.setModalMsg(intl.formatMessage({
                defaultMessage: 'Da li ste sigurni da se želite odjaviti?',
                description: 'navigation-modalquestion'
              }))
              modalContext.setOnYesCall('dologout')
            }}>
            <FontAwesomeIcon icon={faSignOutAlt} color="white" />
          </Button>
        </NavItem>
      </Nav>
    </Navbar>
  );
};

export default Navigation;
