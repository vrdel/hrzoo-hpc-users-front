import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { defaultAuthnRedirect, defaultAuthnRedirectStaff } from '../config/default-redirect';
import { url_ui_prefix } from '../config/general';


const Saml2LoginRedirect = ({sessionData=undefined}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const inviteKey = localStorage.getItem('invitation-key-set')
    const redir = sessionData.userdetails.is_staff || sessionData.userdetails.is_superuser
      ? defaultAuthnRedirectStaff
      : defaultAuthnRedirect
    const origin = location.state?.from?.pathname || redir
    if (inviteKey)
      navigate(url_ui_prefix + '/prijava-email/' + inviteKey)
    else
      navigate(origin)
  }, [location.pathname])

  return (
    null
  )
};

export default Saml2LoginRedirect;
