import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { defaultUnAuthnRedirect,
  defaultAuthnRedirect,
  defaultAuthnRedirectStaff
} from 'Config/default-redirect';
import { useQueryClient } from '@tanstack/react-query';


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
  const [csrfToken, setCsrfToken] = useState("")
  const navigate = useNavigate()
  const queryClient = useQueryClient();

  function login(session) {
    setIsLoggedIn(true)
    setUserdetails(session.userdetails)
    setCsrfToken(session.csrftoken)

    const defaultRedirect = session.userdetails.is_staff
      || session.userdetails.is_superuser
      ? defaultAuthnRedirectStaff
      : defaultAuthnRedirect

    let wantVisit = JSON.parse(localStorage.getItem('referrer'))
    if (wantVisit && wantVisit.length > 0) {
      // last - defaultUnAuthnRedirect or path user initially requested
      if (wantVisit.length >= 1)
        wantVisit = wantVisit[wantVisit.length - 1]
      if (wantVisit !== defaultUnAuthnRedirect)
        navigate(wantVisit)
      else
        navigate(defaultRedirect)
    }
    else
      navigate(defaultRedirect)

    localStorage.removeItem('referrer')
  }

  function logout() {
    setIsLoggedIn(false)
    setUserdetails("")
    localStorage.removeItem('referrer')
    queryClient.invalidateQueries("sessionactive")
    setTimeout(() => {
      navigate(defaultUnAuthnRedirect)
    }, 800)
  }

  const authContextValue = { isLoggedIn, setIsLoggedIn, userDetails,
    setUserdetails, login, logout, csrfToken, setCsrfToken }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
