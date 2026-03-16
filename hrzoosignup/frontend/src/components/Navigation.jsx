import React, { useState, useContext, useRef } from 'react';
import {
  Navbar,
  Nav,
  Badge,
  Popover,
  Overlay,
  Button,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import 'Styles/nav.css';
import { ModalContext } from 'Components/BasePage'
import { AuthContext } from 'Components/AuthContextProvider';
import UserDetailsPopover from 'Components/UserDetailsPopover';
import { IntlContext } from 'Components/IntlContextProvider';
import { LanguageButtonNav } from 'Components/LocaleButton';
import { FormattedMessage } from 'react-intl';
import SrceLogoHead from 'Assets/srce-logo-head.svg';
import SrceLogoHeadEn from 'Assets/srce-logo-head-en.svg';
import { useIntl } from 'react-intl'


const Navigation = () => {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const popoverTarget = useRef(null)
  const modalContext = useContext(ModalContext)
  const { userDetails } = useContext(AuthContext)
  const { locale, setLocale } = useContext(IntlContext)
  const intl = useIntl()

  return (
    <Navbar expand="md" id="hzsi-nav" className="shadow-sm border rounded d-flex justify-content-between mt-2 mb-2 pt-3 pb-3">
      <Nav className="m-1 ms-3">
        <span className="pl-3 font-weight-bold text-center d-none d-md-inline">
          {
            locale === 'hr' ?
              <a href={intl.formatMessage({ defaultMessage: "https://www.srce.unizg.hr/napredno-racunanje", description: 'navigation-brand-link' })}
                target="_blank" rel="noopener noreferrer">
                <img src={SrceLogoHead} id="srcelogohr" alt="SRCE Logo HR" style={{ width: 530, height: "auto" }} />
              </a>
            :
              <a href={intl.formatMessage({ defaultMessage: "https://www.srce.unizg.hr/napredno-racunanje", description: 'navigation-brand-link' })}
                target="_blank" rel="noopener noreferrer">
                <img src={SrceLogoHeadEn} id="srcelogoen" alt="SRCE Logo EN" style={{ width: 540, height: "auto" }} />
              </a>
          }
        </span>
        <span className="pl-3 font-weight-bold text-center d-inline d-md-none me-3">
          {
            locale === 'hr' ?
              <a href={intl.formatMessage({ defaultMessage: "https://www.srce.unizg.hr/napredno-racunanje", description: 'navigation-brand-link' })}
                target="_blank" rel="noopener noreferrer">
                <img src={SrceLogoHead} id="srcelogohr" alt="SRCE Logo HR" style={{ width: 320, height: "auto" }} />
              </a>
            :
              <a href={intl.formatMessage({ defaultMessage: "https://www.srce.unizg.hr/napredno-racunanje", description: 'navigation-brand-link' })}
                target="_blank" rel="noopener noreferrer">
                <img src={SrceLogoHeadEn} id="srcelogoen" alt="SRCE Logo EN" style={{ width: 330, height: "auto" }} />
              </a>
          }
        </span>
      </Nav>
      <Nav className="flex-row">
        <Nav.Item className="d-flex align-items-center">
          <LanguageButtonNav locale={locale} setLocale={setLocale} />
        </Nav.Item>
        <Nav.Item className='m-2 text-dark'>
          <>
            <FormattedMessage
              description="navigation-welcome"
              defaultMessage="Dobrodošli"
            />,
            <br/>
            <span onClick ={() => setPopoverOpen(!popoverOpen)} ref={popoverTarget}>
              <Badge href="#" className="text-dark" bg="light"
                style={{fontSize: '100%', textDecoration: 'none', cursor: 'pointer'}}>
                <strong>{userDetails?.first_name}</strong>
              </Badge>
            </span>
            <Overlay
              target={popoverTarget.current}
              show={popoverOpen}
              onHide={() => setPopoverOpen(false)}
              placement="bottom"
              rootClose
            >
              {(props) => (
                <Popover {...props}>
                  <Popover.Body>
                    <UserDetailsPopover />
                  </Popover.Body>
                </Popover>
              )}
            </Overlay>
          </>
        </Nav.Item>
        <Nav.Item className='d-flex align-items-center me-3 m-2 text-light'>
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
        </Nav.Item>
      </Nav>
    </Navbar>
  );
};

export default Navigation;
