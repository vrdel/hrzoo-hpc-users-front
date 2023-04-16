import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { defaultAuthnRedirect, defaultAuthnRedirectStaff } from '../config/default-redirect';


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
    const redir = user.is_staff || user.is_superuser ? defaultAuthnRedirectStaff : defaultAuthnRedirect
    const origin = location.state?.from?.pathname || redir
    setIsLoggedIn(true)
    setUserdetails(user)
    navigate(origin)
  }

  function logout() {
    setIsLoggedIn(false)
    setUserdetails("")
  }

  const authContextValue = { isLoggedIn, setIsLoggedIn, userDetails,
    setUserdetails, login, logout }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
