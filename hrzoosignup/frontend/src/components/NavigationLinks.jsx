import React, { useContext } from 'react';
import {
  Nav,
  NavItem,
} from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileSignature,
  faBook,
  faUsers,
  faKey,
  faCircleInfo,
  faStamp
} from '@fortawesome/free-solid-svg-icons';
import '../styles/nav.css';
import { AuthContext } from '../components/AuthContextProvider';


const NavigationLinks = () => {
  const activeBgColor = '#b04c46';
  const { userDetails } = useContext(AuthContext);

  return (
    <Nav tabs id="hzsi-navlinks" className="border-start border-end rounded d-flex sticky-top">
      {
        userDetails.is_staff &&
        <NavItem key='upravljanje-zahtjevima' className='ms-3 mt-1'>
          <NavLink
            style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
            className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
            to='/ui/upravljanje-zahtjevima'>
            <FontAwesomeIcon icon={faStamp} />{' '}
            Upravljanje zahtjevima
          </NavLink>
        </NavItem>
      }
      <NavItem key='moji-zahtjevi' className={`${userDetails.is_staff ? 'mt-1' : 'ms-3 mt-1'}`}>
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
      <NavItem key='moji-podatci' className='mt-1 me-3 ms-auto'>
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/moji-podatci'>
          <FontAwesomeIcon icon={faCircleInfo} />{' '}
          Moji podatci
        </NavLink>
      </NavItem>
    </Nav>
  )
}

export default NavigationLinks;
