import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultUnAuthnRedirect,
  defaultAuthnRedirect,
  defaultAuthnRedirectStaff
} from 'Config/default-redirect';
import { useQueryClient } from '@tanstack/react-query';


export const AuthContext = React.createContext();


export const AuthContextProvider = ( {children} ) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userDetails, setUserdetails] = useState("")
  const [csrfToken, setCsrfToken] = useState("")
  const [loginType, setLoginType] = useState("")
  const [enableAccounting, setEnableAccounting] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient();

  function login(session) {
    setIsLoggedIn(true)
    setUserdetails(session.userdetails)
    setCsrfToken(session.csrftoken)
    setEnableAccounting(session.config.enable_accounting)

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
    setLoginType("")
    setEnableAccounting(false)
    localStorage.removeItem('referrer')
    queryClient.invalidateQueries("sessionactive")
  }

  const authContextValue = { isLoggedIn, setIsLoggedIn, userDetails,
    setUserdetails, login, logout, csrfToken, setCsrfToken, loginType,
    setLoginType, enableAccounting, setEnableAccounting }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
