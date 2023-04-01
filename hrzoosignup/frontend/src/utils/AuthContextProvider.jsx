import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = React.createContext({
  isLoggedIn: false,
  userDetails: null,
  login: () => {},
  logout: () => {}
});


export const AuthContextProvider = ( {children} ) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserdetails] = useState("");
  const navigate = useNavigate();

  function login(user) {
    setIsLoggedIn(true);
    setUserdetails(user);
    navigate('/ui/novi-zahtjev')
  }

  function logout() {
    setIsLoggedIn(false);
    setUserdetails("");
  }

  const authContextValue = { isLoggedIn, userDetails, login, logout };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
