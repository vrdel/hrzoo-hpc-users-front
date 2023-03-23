import React from 'react';
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavbarText
} from 'reactstrap';
import {Link} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLaptopCode,
} from '@fortawesome/free-solid-svg-icons';


const Navigation = () => {
  return (
    <Navbar className="fs-4 bg-danger" expand="md">
      <NavbarBrand tag={Link} to="/home">
        <FontAwesomeIcon icon={faLaptopCode} style={{color: "#c00000"}} size="2x" />
      </NavbarBrand>
      <NavbarText>
        Zahtjev za korištenjem usluge Napredno računanje
      </NavbarText>
    </Navbar>
  );
};

export default Navigation;
