import React, { useContext } from 'react';
import {
  Nav,
} from 'react-bootstrap';
import { useNavigate, NavLink, useMatch } from 'react-router';
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
  faToggleOff,
  faChartBar
} from '@fortawesome/free-solid-svg-icons';
import 'Styles/nav.css';
import { AuthContext } from 'Components/AuthContextProvider';
import {
  defaultAuthnRedirect,
  defaultAuthnRedirectStaff
} from 'Config/default-redirect';
import { FormattedMessage } from 'react-intl';



const NavigationLinksUser = ({isAdmin, isLead, enableAccounting, activeBgColor}) => {
  const accountingProjectMatch = useMatch("/ui/project-accounting")
  const accountingUsersMatch = useMatch("/ui/project-users-accounting")
  const accountingMyMatch = useMatch("/ui/my-accounting")

  return (
    <>
      <Nav.Item key='my-requests' className='ms-3 mt-1'>
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/my-requests'>
          <FontAwesomeIcon icon={faBook} />{' '}
          <FormattedMessage
            description="navlinks-myrequests"
            defaultMessage="Moji zahtjevi"
          />
        </NavLink>
      </Nav.Item>
      <Nav.Item key='new-request' className='mt-1'>
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/new-request'>
          <FontAwesomeIcon icon={faFileSignature} />{' '}
          <FormattedMessage
            description="navlinks-newrequests"
            defaultMessage="Novi zahtjev"
          />
        </NavLink>
      </Nav.Item>
      <Nav.Item key='memberships' className='mt-1'>
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/memberships'>
          <FontAwesomeIcon icon={faUsers} />{' '}
          <FormattedMessage
            description="navlinks-memberships"
            defaultMessage="Članstva"
          />
        </NavLink>
      </Nav.Item>
      <Nav.Item key='public-keys' className='mt-1'>
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/public-keys'>
          <FontAwesomeIcon icon={faKey} />{' '}
          <FormattedMessage
            description="navlinks-pubkeys"
            defaultMessage="Javni ključevi"
          />
        </NavLink>
      </Nav.Item>
      {
        enableAccounting &&
          <Nav.Item key='accounting' className='mt-1'>
            <NavLink
              style={accountingProjectMatch ||
                accountingUsersMatch ||
                accountingMyMatch ? {'backgroundColor': activeBgColor} : {}}
              className={accountingProjectMatch ||
                accountingUsersMatch ||
                accountingMyMatch ? "nav-link active text-white" : "nav-link text-dark"}
              to={`/ui/${isLead ? "project" : "my"}-accounting`}
            >
              <FontAwesomeIcon icon={ faChartBar } />{' '}
              <FormattedMessage
                description="navlinks-accounting"
                defaultMessage="Iskorištenje resursa"
              />
            </NavLink>
          </Nav.Item>
      }
      <Nav.Item key='my-info' className={isAdmin ? 'mt-1 ms-xs-0 ms-sm-0 ms-md-auto ms-xl-auto' : 'mt-1 ms-auto me-3 me-xs-0 ms-xs-0'}>
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/my-info'>
          <FontAwesomeIcon icon={faCircleInfo} />{' '}
          <FormattedMessage
            description="navlinks-myinfo"
            defaultMessage="Moji podaci"
          />
        </NavLink>
      </Nav.Item>
    </>
  )
}


const NavigationLinksAdmin = ({activeBgColor}) => {
  return (
    <>
      <Nav.Item key='requests' className='ms-3 mt-1'>
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/requests'>
          <FontAwesomeIcon icon={faStamp} />{' '}
          <FormattedMessage
            description="navlinks-requests"
            defaultMessage="Zahtjevi"
          />
        </NavLink>
      </Nav.Item>
      <Nav.Item key="projects" className="mt-1">
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/projects'
        >
          <FontAwesomeIcon icon={faCertificate} />{" "}
          <FormattedMessage
            description="navlinks-projects"
            defaultMessage="Projekti"
          />
        </NavLink>
      </Nav.Item>
      <Nav.Item key="users" className="mt-1">
        <NavLink
          style={({isActive}) => isActive ? {'backgroundColor': activeBgColor} : {}}
          className={({isActive}) => isActive ? "nav-link active text-white" : "nav-link text-dark"}
          to='/ui/users'
        >
          <FontAwesomeIcon icon={faUsers} />{" "}
          <FormattedMessage
            description="navlinks-users"
            defaultMessage="Korisnici"
          />
        </NavLink>
      </Nav.Item>
    </>
  )
}


const NavigationLinks = ({userMode, setUserMode}) => {
  const activeBgColor = '#b04c46';
  const { userDetails, enableAccounting } = useContext(AuthContext);
  const navigate = useNavigate()
  const isLead = userDetails && "userproject_set" in userDetails && userDetails.userproject_set.map(item => item.role.name).includes("lead")

  return (
    <Nav tabs id="hzsi-navlinks" className="border shadow-sm rounded d-flex sticky-top">
      {
        (userDetails.is_staff || userDetails.is_superuser) && !userMode
        ?
          <>
            <NavigationLinksAdmin activeBgColor={activeBgColor} />
            <Nav.Item className='d-flex flex-column ms-3 me-3 justify-content-center ms-xs-0 ms-sm-3 ms-md-auto ms-xl-auto mt-sm-1 mt-xl-0 mt-md-1'>
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
            </Nav.Item>
          </>
        :
          <>
            <NavigationLinksUser
              isAdmin={userDetails.is_staff || userDetails.is_superuser}
              isLead={ isLead }
              enableAccounting={ enableAccounting }
              activeBgColor={activeBgColor}
            />
            {
              (userDetails.is_staff || userDetails.is_superuser)
              &&
                <Nav.Item className='d-flex flex-column ms-3 me-3 mt-sm-1 mt-xl-0 mt-md-1 justify-content-center'>
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
                </Nav.Item>
            }
          </>
      }
    </Nav>
  )
}

export default NavigationLinks;
