import React, { useContext, useState } from 'react';
import {
  Nav,
  NavItem,
} from 'reactstrap';
import { useNavigate, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileSignature,
  faBook,
  faUsers,
  faKey,
  faCircleInfo,
  faStamp,
  faCertificate,
  faWindowRestore,
  faToggleOn,
  faToggleOff
} from '@fortawesome/free-solid-svg-icons';
import 'Styles/nav.css';
import { AuthContext } from 'Components/AuthContextProvider';
import {
  defaultAuthnRedirect,
  defaultAuthnRedirectStaff
} from 'Config/default-redirect';



const NavigationLinksUser = ({isAdmin, activeBgColor}) => {
  return (
    <>
      <NavItem key='moji-zahtjevi' className='ms-3 mt-1'>
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/moji-zahtjevi'>
          <FontAwesomeIcon icon={faBook} />{' '}
          Moji zahtjevi
        </NavLink>
      </NavItem>
      <NavItem key='novi-zahtjev' className='mt-1'>
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/novi-zahtjev'>
          <FontAwesomeIcon icon={faFileSignature} />{' '}
          Novi zahtjev
        </NavLink>
      </NavItem>
      <NavItem key='clanstva' className='mt-1'>
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/clanstva'>
          <FontAwesomeIcon icon={faUsers} />{' '}
          Članstva
        </NavLink>
      </NavItem>
      <NavItem key='javni-kljucevi' className='mt-1'>
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/javni-kljucevi'>
          <FontAwesomeIcon icon={faKey} />{' '}
          Javni ključevi
        </NavLink>
      </NavItem>
      <NavItem key='moji-podaci' className={isAdmin ? 'mt-1 ms-xs-0 ms-sm-0 ms-md-auto ms-xl-auto' : 'mt-1 ms-auto me-3 me-xs-0 ms-xs-0'}>
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/moji-podaci'>
          <FontAwesomeIcon icon={faCircleInfo} />{' '}
          Moji podaci
        </NavLink>
      </NavItem>
    </>
  )
}


const NavigationLinksAdmin = ({activeBgColor}) => {
  return (
    <>
      <NavItem key='zahtjevi' className='ms-3 mt-1'>
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/zahtjevi'>
          <FontAwesomeIcon icon={faStamp} />{' '}
          Zahtjevi
        </NavLink>
      </NavItem>
      <NavItem key="projekti" className="mt-1">
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/projekti'
        >
          <FontAwesomeIcon icon={faCertificate} />{" "}
          Projekti
        </NavLink>
      </NavItem>
      <NavItem key="korisnici" className="mt-1">
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/korisnici'
        >
          <FontAwesomeIcon icon={faUsers} />{" "}
          Korisnici
        </NavLink>
      </NavItem>
      <NavItem key="softver" className="mt-1">
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/softver'
        >
          <FontAwesomeIcon icon={faWindowRestore} />{" "}
          Softver
        </NavLink>
      </NavItem>
    </>
  )
}


const NavigationLinks = ({userMode, setUserMode}) => {
  const activeBgColor = '#b04c46';
  const { userDetails } = useContext(AuthContext);
  const navigate = useNavigate()

  return (
    <Nav tabs id="hzsi-navlinks" className="border-start border-end rounded d-flex sticky-top">
      {
        (userDetails.is_staff || userDetails.is_superuser) && !userMode
        ?
          <>
            <NavigationLinksAdmin activeBgColor={activeBgColor} />
            <NavItem className='d-flex flex-column ms-3 me-3 justify-content-center ms-xs-0 ms-sm-3 ms-md-auto ms-xl-auto mt-sm-1 mt-xl-0 mt-md-1'>
              <span className='d-flex align-items-center badge danger rounded-pill'
                size="sm"
                style={{cursor: 'pointer'}}
                id="badge-admin"
                onClick={() => {
                  setUserMode(!userMode)
                  navigate(defaultAuthnRedirect)
                }}
              >
                <FontAwesomeIcon className="me-2" size="xl" icon={faToggleOn} />
                <div className="me-1">
                  admin
                </div>
              </span>
            </NavItem>
          </>
        :
          <>
            <NavigationLinksUser
              isAdmin={userDetails.is_staff || userDetails.is_superuser}
              activeBgColor={activeBgColor}
            />
            {
              (userDetails.is_staff || userDetails.is_superuser)
              &&
                <NavItem className='d-flex flex-column ms-3 me-3 mt-sm-1 mt-xl-0 mt-md-1 justify-content-center'>
                  <span className="d-flex align-items-center badge success rounded-pill"
                    size="sm"
                    id="badge-user"
                    style={{cursor: 'pointer'}}
                    onClick={() => {
                      setUserMode(!userMode)
                      navigate(defaultAuthnRedirectStaff)
                    }}
                  >
                    <FontAwesomeIcon className="me-2" size="xl" icon={faToggleOff} />
                    <div className="me-1">
                      user
                    </div>
                  </span>
                </NavItem>
            }
          </>
      }
    </Nav>
  )
}

export default NavigationLinks;
