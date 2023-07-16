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
  faToggleOn,
  faToggleOff
} from '@fortawesome/free-solid-svg-icons';
import '../styles/nav.css';
import { AuthContext } from '../components/AuthContextProvider';
import {
  defaultAuthnRedirect,
  defaultAuthnRedirectStaff
} from '../config/default-redirect';



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
      <NavItem key='moji-podaci' className={isAdmin ? 'mt-1 ms-auto' : 'mt-1 me-3 ms-auto'}>
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
      <NavItem key='upravljanje-zahtjevima' className='ms-3 mt-1'>
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/upravljanje-zahtjevima'>
          <FontAwesomeIcon icon={faStamp} />{' '}
          Upravljanje zahtjevima
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
            <NavItem className='d-flex flex-column ms-3 me-3 justify-content-center ms-auto'>
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
                <NavItem className='d-flex flex-column ms-3 me-3 justify-content-center'>
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
