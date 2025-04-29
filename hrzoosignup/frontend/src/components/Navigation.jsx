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
import SrceLogoHead from 'Assets/srce-logo-head.png';
import SrceLogoHeadEn from 'Assets/srce-logo-head-en.png';
import SrceLogoHeadMid from 'Assets/srce-logo-head-mid.png';
import SrceLogoHeadMidEn from 'Assets/srce-logo-head-mid-en.png';
import SrceLogoHeadSmall from 'Assets/srce-logo-head-small.png';
import SrceLogoHeadSmallEn from 'Assets/srce-logo-head-small-en.png';
import { useIntl } from 'react-intl'


const Navigation = () => {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const modalContext = useContext(ModalContext)
  const { userDetails } = useContext(AuthContext)
  const { locale, setLocale } = useContext(IntlContext)
  const intl = useIntl()

  return (
    <Navbar expand="md" id="hzsi-nav" className="shadow-sm border rounded d-flex justify-content-between mt-2 mb-2 pt-3 pb-3">
      <Nav navbar className="m-1 ms-3">
        <span className="pl-3 font-weight-bold text-center d-none d-md-inline">
          {
            locale === 'hr' ?
              <a href={intl.formatMessage({ defaultMessage: "https://www.srce.unizg.hr/napredno-racunanje", description: 'navigation-brand-link' })}
                target="_blank" rel="noopener noreferrer">
                <img src={SrceLogoHead} id="srcelogohr" alt="SRCE Logo HR"/>
              </a>
            :
              <a href={intl.formatMessage({ defaultMessage: "https://www.srce.unizg.hr/napredno-racunanje", description: 'navigation-brand-link' })}
                target="_blank" rel="noopener noreferrer">
                <img src={SrceLogoHeadEn} id="srcelogoen" alt="SRCE Logo EN"/>
              </a>
          }
        </span>
        <span className="pl-3 font-weight-bold text-center d-inline d-md-none me-3">
          {
            locale === 'hr' ?
              <a href={intl.formatMessage({ defaultMessage: "https://www.srce.unizg.hr/napredno-racunanje", description: 'navigation-brand-link' })}
                target="_blank" rel="noopener noreferrer">
                <img src={SrceLogoHeadSmall} id="srcelogohr" alt="SRCE Logo HR"/>
              </a>
            :
              <a href={intl.formatMessage({ defaultMessage: "https://www.srce.unizg.hr/napredno-racunanje", description: 'navigation-brand-link' })}
                target="_blank" rel="noopener noreferrer">
                <img src={SrceLogoHeadSmallEn} id="srcelogoen" alt="SRCE Logo EN"/>
              </a>
          }
        </span>
      </Nav>
      <Nav navbar className="flex-row">
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
