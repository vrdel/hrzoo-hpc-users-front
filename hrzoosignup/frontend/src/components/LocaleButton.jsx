import React from 'react';
import {
  Button,
} from 'react-bootstrap';
import Cookies from 'js-cookie';
import "Styles/flag-icons-subset.scss";


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
    <Button size="sm" variant="light"
      onClick={ () => alternateLocale() } >
      <span className={`${small ? 'fs-5 m-0 p-0' : 'fs-4 m-0 p-0'}`}>
        { locale === 'en' && <span className="fi fi-hr" style={{width: 30, height: 'auto'}}></span> }
        { locale === 'hr' && <span className="fi fi-gb" style={{width: 30, height: 'auto'}}></span> }
      </span>
      {' '}
      <span className={`${small ? 'fs-6' : 'fs-5'}`}>
        { locale === 'hr' ? 'en'.toUpperCase() : 'hr'.toUpperCase() }
      </span>
    </Button>
  )
}


export const LanguageButtonNav = ({locale, setLocale}) => {
  function alternateLocale() {
    if (locale === 'hr') {
      setLocale('en')
      Cookies.set('hzsi-lang', 'en')
    }
    else {
      setLocale('hr')
      Cookies.set('hzsi-lang', 'hr')
    }
  }

  return (
    <Button size="sm" variant="light"
      onClick={ () => alternateLocale() } >
      <span className="fs-6 m-0 p-0">
        { locale === 'en' && <span className="fi fi-hr" style={{width: 20, height: 'auto'}}></span> }
        { locale === 'hr' && <span className="fi fi-gb" style={{width: 20, height: 'auto'}}></span> }
      </span>
      <br/>
      { locale === 'hr' ? 'en'.toUpperCase() : 'hr'.toUpperCase() }
    </Button>
  )
}
