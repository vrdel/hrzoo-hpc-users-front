import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultAuthnRedirect, defaultAuthnRedirectStaff } from '../config/default-redirect';


const Saml2LoginRedirect = ({sessionData=undefined}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionData.active &&
      (sessionData.userdetails.is_staff || sessionData.userdetails.is_superuser))
      navigate(defaultAuthnRedirectStaff)
    else
      navigate(defaultAuthnRedirect)
  }, [location.pathname])

  return (
    null
  )
};

export default Saml2LoginRedirect;
