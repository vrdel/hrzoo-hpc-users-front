import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultAuthnRedirect, defaultAuthnRedirectStaff } from '../config/default-redirect';


const Saml2LoginRedirect = ({sessionData=undefined}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const redir = sessionData.userdetails.is_staff || sessionData.userdetails.is_superuser
      ? defaultAuthnRedirectStaff
      : defaultAuthnRedirect
    const origin = location.state?.from?.pathname || redir
    navigate(origin)
  }, [location.pathname])

  return (
    null
  )
};

export default Saml2LoginRedirect;
