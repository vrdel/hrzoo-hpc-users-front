import React, { useContext, useState } from 'react';
import {
  Nav,
  NavItem,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import { NavLink, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileSignature,
  faBook,
  faUsers,
  faKey,
  faCircleInfo,
  faUserEdit,
  faStamp
} from '@fortawesome/free-solid-svg-icons';
import '../styles/nav.css';
import { AuthContext } from '../components/AuthContextProvider';
import { elemInArray } from '../utils/array_help';


const NavigationLinksUser = ({activeBgColor}) => {
  const { userDetails } = useContext(AuthContext);

  return (
    <>
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
      <NavItem key='moji-podaci' className='mt-1 me-3 ms-auto'>
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


const NavigationLinks = () => {
  const activeBgColor = '#b04c46';
  const { userDetails } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggle = () => setDropdownOpen(!dropdownOpen);

  let userPages = ['novi-zahtjev', 'moji-zahtjevi', 'clanstva', 'javni-kljucevi']


  return (
    <Nav tabs id="hzsi-navlinks" className="border-start border-end rounded d-flex sticky-top">
      {
        userDetails.is_staff
        ?
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
            <Dropdown
              isOpen={dropdownOpen}
              toggle={toggle}
              className="mt-1 ms-1">
              <DropdownToggle nav caret
                style={elemInArray(location.pathname.split('/')[2], userPages) ? {'backgroundColor': activeBgColor, 'textColor': 'text-white'} : {}}
                className={elemInArray(location.pathname.split('/')[2], userPages) ? "text-white" : "text-dark"}>
                <FontAwesomeIcon icon={faUserEdit}/> Korisničke forme
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem className="ps-3 pe-3 p-2">
                  <Link
                    style={{textDecoration: "none"}}
                    id="hzsi-navlinks-dropdown"
                    className="text-dark ps-3 pe-3 p-2"
                    to='/ui/moji-zahtjevi'>
                    <FontAwesomeIcon icon={faBook} />{' '}
                    Moji zahtjevi
                  </Link>
                </DropdownItem>
                <DropdownItem className="ps-3 pe-3 p-2">
                  <Link
                    style={{textDecoration: "none"}}
                    id="hzsi-navlinks-dropdown"
                    className="text-dark ps-3 pe-3 p-2"
                    to='/ui/novi-zahtjev'>
                    <FontAwesomeIcon icon={faFileSignature} />{' '}
                    Novi zahtjev
                  </Link>
                </DropdownItem>
                <DropdownItem className="ps-3 pe-3 p-2">
                  <Link
                    style={{textDecoration: "none"}}
                    className="text-dark ps-3 pe-3 p-2"
                    id="hzsi-navlinks-dropdown"
                    to='/ui/clanstva'>
                    <FontAwesomeIcon icon={faUsers} />{' '}
                    Članstva
                  </Link>
                </DropdownItem>
                <DropdownItem className="ps-3 pe-3 p-2">
                  <Link
                    style={{textDecoration: "none"}}
                    id="hzsi-navlinks-dropdown"
                    className="text-dark ps-3 pe-3 p-2"
                    to='/ui/javni-kljucevi'>
                    <FontAwesomeIcon icon={faKey} />{' '}
                    Javni ključevi
                  </Link>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <NavItem key='moji-podaci' className='mt-1 me-3 ms-auto'>
              <NavLink
                style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
                className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
                to='/ui/moji-podaci'>
                <FontAwesomeIcon icon={faCircleInfo} />{' '}
                Moji podaci
              </NavLink>
            </NavItem>
          </>
        :
          <NavigationLinksUser activeBgColor={activeBgColor} />
      }
    </Nav>
  )
}

export default NavigationLinks;
