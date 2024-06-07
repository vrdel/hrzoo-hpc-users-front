import React from 'react';
import {
  Button,
} from 'reactstrap';
import Cookies from 'js-cookie';
import EnFlag20 from 'Assets/en-flag-20.png';
import EnFlag30 from 'Assets/en-flag-30.png';
import HrFlag20 from 'Assets/hr-flag-20.png';
import HrFlag30 from 'Assets/hr-flag-30.png';


export const LanguageButtonLogin = ({locale, setLocale, small=false}) => {
  function alternateLocale() {
    if (locale === 'en') {
      setLocale('hr')
      localStorage.setItem('loginLocaleSet', 'hr')
      Cookies.set('hzsi-lang', 'hr')
    }
    else {
      setLocale('en')
      localStorage.setItem('loginLocaleSet', 'en')
      Cookies.set('hzsi-lang', 'en')
    }
  }

  return (
    <Button size="sm" color="light"
      onClick={ () => alternateLocale() } >
      <span className={`${small ? 'fs-5 m-0 p-0' : 'fs-4 m-0 p-0'}`}>
        { locale === 'hr' && <img src={HrFlag30} alt="Croatian flag"/> }
        { locale === 'en' && <img src={EnFlag30} alt="English flag"/> }
      </span>
      {' '}
      <span className={`${small ? 'fs-6' : 'fs-5'}`}>
        { locale.toUpperCase() }
      </span>
    </Button>
  )
}


export const LanguageButtonNav = ({locale, setLocale}) => {
  function alternateLocale() {
    if (locale === 'en') {
      setLocale('hr')
      Cookies.set('hzsi-lang', 'hr')
    }
    else {
      setLocale('en')
      Cookies.set('hzsi-lang', 'en')
    }
  }

  return (
    <Button size="sm" color="light"
      onClick={ () => alternateLocale() } >
      <span className="fs-6 m-0 p-0">
        { locale === 'hr' && <img src={HrFlag20} alt="Croatian flag"/> }
        { locale === 'en' && <img src={EnFlag20} alt="English flag"/> }
      </span>
      <br/>
      { locale.toUpperCase() }
    </Button>
  )
}
