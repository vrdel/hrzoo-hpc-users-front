import React from 'react';
import {
  Button,
} from 'reactstrap';
import Cookies from 'js-cookie';


export const LanguageButtonLogin = ({locale, setLocale, small=false}) => {
  function alternateLocale() {
    if (locale === 'en') {
      setLocale('hr')
      localStorage.setItem('loginLocaleSet', 'en')
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
        { locale === 'hr' && '🇭🇷'}
        { locale === 'en' && '🇬🇧'}
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
        { locale === 'hr' && '🇭🇷'}
        { locale === 'en' && '🇬🇧'}
      </span>
      <br/>
      { locale.toUpperCase() }
    </Button>
  )
}
