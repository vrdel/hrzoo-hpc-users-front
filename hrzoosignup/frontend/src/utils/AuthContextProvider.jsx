import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const AuthContext = React.createContext({
  isLoggedIn: false,
  userDetails: null,
  login: () => {},
  logout: () => {}
});


export const AuthContextProvider = ( {children} ) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userDetails, setUserdetails] = useState("")
  const navigate = useNavigate()
  const location = useLocation()

  function login(user) {
    const origin = location.state?.from?.pathname || '/ui/novi-zahtjev'
    setIsLoggedIn(true)
    setUserdetails(user)
    navigate(origin)
  }

  function logout() {
    setIsLoggedIn(false)
    setUserdetails("")
  }

  const authContextValue = { isLoggedIn, userDetails, login, logout };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
