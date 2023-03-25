import React, { useState } from 'react';
import {
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
import { Link } from 'react-router-dom';


const NavigationLinks = () => {
  return (
    <Nav tabs id="hzsi-navlinks" className="d-flex justify-content-center border-left border-right border-top rounded-top sticky-top">
      <NavItem key='moji-zahtjevi' className='mt-1'>
        <NavLink
          tag={Link}
          active={location.pathname.split('/')[2] === 'moji-zahtjevi' ? true : false}
          className={location.pathname.split('/')[2] === 'moji-zahtjevi' ? "text-white" : "text-dark"}
          id={location.pathname.split('/')[2] === 'moji-zahtjevi' ? "hzsi-bg-danger" : ""}
          to='/ui/moji-zahtjevi'>
          Moji zahtjevi
        </NavLink>
      </NavItem>
      <NavItem key='novi-zahtjev' className='mt-1'>
        <NavLink
          tag={Link}
          active={location.pathname.split('/')[2] === 'novi-zahtjev' ? true : false}
          className={location.pathname.split('/')[2] === 'novi-zahtjev' ? "text-white hzsi-bg-danger" : "text-dark"}
          id={location.pathname.split('/')[2] === 'moji-zahtjevi' ? "hzsi-bg-danger" : ""}
          to='/ui/novi-zahtjev'>
          Novi zahtjev
        </NavLink>
      </NavItem>
      <NavItem key='iskoristenost-resursa' className='mt-1'>
        <NavLink
          tag={Link}
          active={location.pathname.split('/')[2] === 'iskoristenost-resursa' ? true : false}
          className={location.pathname.split('/')[2] === 'iskoristenost-resursa' ? "text-white" : "text-dark"}
          id={location.pathname.split('/')[2] === 'moji-zahtjevi' ? "hzsi-bg-danger" : ""}
          to='/ui/iskoristenost-resursa'>
          Iskorištenost resursa
        </NavLink>
      </NavItem>
      <NavItem key='javni-resursa' className='mt-1'>
        <NavLink
          tag={Link}
          active={location.pathname.split('/')[2] === 'iskoristenost-resursa' ? true : false}
          className={location.pathname.split('/')[2] === 'iskoristenost-resursa' ? "text-white" : "text-dark"}
          id={location.pathname.split('/')[2] === 'moji-zahtjevi' ? "hzsi-bg-danger" : ""}
          to='/ui/javni-kljucevi'>
          Javni ključevi
        </NavLink>
      </NavItem>
    </Nav>
  )
}

export default NavigationLinks;
