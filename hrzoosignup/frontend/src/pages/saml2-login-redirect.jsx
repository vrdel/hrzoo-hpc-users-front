import React, { useEffect, useContext } from 'react';
import { AuthContext } from 'Components/AuthContextProvider';
import { useNavigate } from 'react-router-dom';
import {
  defaultUnAuthnRedirect,
  defaultAuthnRedirect,
  defaultAuthnRedirectStaff
} from 'Config/default-redirect';
import { url_ui_prefix } from 'Config/general';
import { IntlContext } from 'Components/IntlContextProvider';


const Saml2LoginRedirect = ({sessionData=undefined}) => {
  const navigate = useNavigate();
  const { setLoginType } = useContext(AuthContext)
  const { locale } = useContext(IntlContext)

  useEffect(() => {
    const inviteKey = localStorage.getItem('invitation-key-set')
    if (inviteKey)
      if (locale === 'en')
        navigate(url_ui_prefix + '/login-email/' + inviteKey + '/en')
      else
        navigate(url_ui_prefix + '/login-email/' + inviteKey)
    else {
      setLoginType('saml2')
      const defaultRedirect = sessionData.userdetails.is_staff
        || sessionData.userdetails.is_superuser
        ? defaultAuthnRedirectStaff
        : defaultAuthnRedirect
      let wantVisit = JSON.parse(localStorage.getItem('referrer'))
      if (wantVisit && wantVisit.length > 0) {
        // before - defaultUnAuthnRedirect or path user initially requested
        // last - path of this component
        if (wantVisit.length >= 2)
          wantVisit = wantVisit[wantVisit.length - 2]
        else if (wantVisit.length == 1)
          wantVisit = wantVisit[0]
        if (wantVisit !== defaultUnAuthnRedirect && !wantVisit.includes('saml2-login-redirect'))
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
