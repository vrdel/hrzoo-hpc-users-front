import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { defaultUnAuthnRedirect,
  defaultAuthnRedirect,
  defaultAuthnRedirectStaff,
  defaultAuthnRedirectWithAccounting,
  defaultAuthnRedirectWithAccountingLead
} from 'Config/default-redirect';
import { useQueryClient } from '@tanstack/react-query';


export const AuthContext = React.createContext();


export const AuthContextProvider = ( {children} ) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userDetails, setUserdetails] = useState("")
  const [csrfToken, setCsrfToken] = useState("")
  const [loginType, setLoginType] = useState("")
  const [backendConfig, setBackendConfig] = useState(undefined)
  const [enableAccounting, setEnableAccounting] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient();

  function login(session) {
    setIsLoggedIn(true)
    setUserdetails(session.userdetails)
    setCsrfToken(session.csrftoken)
    setBackendConfig(session.config)
    setEnableAccounting(session.config.enable_accounting)

    const defaultRedirect = session.userdetails.is_staff
      || session.userdetails.is_superuser
      ? defaultAuthnRedirectStaff
        : enableAccounting
          ? session.userdetails.userproject_set.map(item => item.role.name).includes("lead") ?
            defaultAuthnRedirectWithAccountingLead
            :
             defaultAuthnRedirectWithAccounting
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
    setBackendConfig(false)
    localStorage.removeItem('referrer')
    queryClient.invalidateQueries({ queryKey: "sessionactive" })
  }

  const authContextValue = { isLoggedIn, setIsLoggedIn, userDetails,
    setUserdetails, backendConfig, setBackendConfig, login, logout, csrfToken,
    setCsrfToken, loginType, setLoginType, enableAccounting,
    setEnableAccounting }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
