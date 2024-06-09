import React, { useContext } from 'react';
import { Badge } from 'reactstrap';
import { AuthContext } from 'Components/AuthContextProvider';
import { faCheckCircle, faStopCircle, faHome, faGlobe} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FormattedMessage } from 'react-intl';


const UserDetailsPopover = () => {
  const { userDetails } = useContext(AuthContext)

  return (
    <>
      <div className="text-center">
        {
          userDetails.is_staff || userDetails.is_superuser ?
            <Badge color="danger" className="mb-1 mt-1" pill>
              Admin
            </Badge>
          :
            <Badge color="success" className="mb-1 mt-1" pill>
              <FormattedMessage
                defaultMessage="Korisnik"
                description="userdetails-popover-user"
              />
            </Badge>
      }
      </div>
      {
        <div className="text-center mt-1">
          <b>{userDetails.first_name}{' '}{userDetails.last_name}</b>
        </div>
      }
      {
        <div className="text-center text-primary mt-1">
          {userDetails.person_uniqueid}
        </div>
      }
      <div className="text-center">
        {
          userDetails.status === true ?
            <FontAwesomeIcon className="ms-3" color="#198754" icon={ faCheckCircle } />
          :
            <FontAwesomeIcon className="ms-3" color="#DC3545" icon={ faStopCircle } />
        }
        {
          userDetails.person_type === 'local' ?
            <FontAwesomeIcon className="ms-1 me-3" color="#777777" icon={ faHome } />
          :
            <FontAwesomeIcon className="ms-1 me-3" color="#777777" icon={ faGlobe } />
        }
      </div>
    </>
  )
}

export default UserDetailsPopover
