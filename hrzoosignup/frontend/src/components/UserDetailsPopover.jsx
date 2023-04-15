import React, { useContext } from 'react';
import { Badge } from 'reactstrap';
import { AuthContext } from '../components/AuthContextProvider';


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
              Korisnik
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
    </>

  )
}

export default UserDetailsPopover
