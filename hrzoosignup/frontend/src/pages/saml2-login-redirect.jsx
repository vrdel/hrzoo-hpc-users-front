import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  defaultUnAuthnRedirect,
  defaultAuthnRedirect,
  defaultAuthnRedirectStaff
} from '../config/default-redirect';
import { url_ui_prefix } from '../config/general';


const Saml2LoginRedirect = ({sessionData=undefined}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const inviteKey = localStorage.getItem('invitation-key-set')
    if (inviteKey)
      navigate(url_ui_prefix + '/prijava-email/' + inviteKey)
    else {
      const defaultRedirect = sessionData.userdetails.is_staff
        || sessionData.userdetails.is_superuser
        ? defaultAuthnRedirectStaff
        : defaultAuthnRedirect
      let wantVisit = JSON.parse(localStorage.getItem('referrer'))
      if (wantVisit) {
        // before - defaultUnAuthnRedirect or path user initially requested
        // last - path of this component
        if (wantVisit.length >= 2)
          wantVisit = wantVisit[wantVisit.length - 2]
        if (wantVisit !== defaultUnAuthnRedirect)
          navigate(wantVisit)
        else
          navigate(defaultRedirect)
      }
      else
        navigate(defaultRedirect)
      localStorage.removeItem('referrer')
    }
  }, [location.pathname])

  return (
    null
  )
};

export default Saml2LoginRedirect;
