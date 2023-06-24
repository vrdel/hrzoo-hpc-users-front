import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { defaultUnAuthnRedirect,
  defaultAuthnRedirect,
  defaultAuthnRedirectStaff
} from '../config/default-redirect';


export const AuthContext = React.createContext({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  userDetails: null,
  setUserdetails: () => {},
  login: () => {},
  logout: () => {},
});


export const AuthContextProvider = ( {children} ) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userDetails, setUserdetails] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  function login(user) {
    setIsLoggedIn(true)
    setUserdetails(user)

    let wantVisit = JSON.parse(localStorage.getItem('referrer'))
    if (wantVisit) {
      // last - defaultUnAuthnRedirect or path user initially requested
      if (wantVisit.length >= 1)
        wantVisit = wantVisit[wantVisit.length - 1]
      const defaultRedirect = user.is_staff
        || user.is_superuser
        ? defaultAuthnRedirectStaff
        : defaultAuthnRedirect
      if (wantVisit !== defaultUnAuthnRedirect)
        navigate(wantVisit)
      else
        navigate(defaultRedirect)
    }
    localStorage.removeItem('referrer')
  }

  function logout() {
    setIsLoggedIn(false)
    setUserdetails("")
    localStorage.removeItem("referrer")
  }

  const authContextValue = { isLoggedIn, setIsLoggedIn, userDetails,
    setUserdetails, login, logout }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
