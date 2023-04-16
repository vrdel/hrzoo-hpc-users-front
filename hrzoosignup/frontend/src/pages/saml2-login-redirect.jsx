import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const Saml2LoginRedirect = ({sessionData=undefined}) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionData.active &&
      (sessionData.userdetails.is_staff || sessionData.userdetails.is_superuser))
      navigate('/ui/upravljanje-zahtjevima')
    else
      navigate('/ui/moji-zahtjevi')
  }, [location.pathname])

  return (
    null
  )
};

export default Saml2LoginRedirect;
