import React, { useState, useEffect } from 'react';
import { IntlProvider } from 'react-intl';

export const IntlContext = React.createContext({
  locale: '',
  setLocale: () => {}
});
const defaultLocale = 'hr'


export const IntlContextProvider = ( {children} ) => {
  const [locale, setLocale] = useState(defaultLocale)
  const [loadedMsgs, setLoadedMsgs] = useState(undefined)

  function loadMsgs(locale) {
    return import(`../compiled-lang/${locale}.json`).then(
      (messages) => setLoadedMsgs(messages)
    )
  }

  useEffect(() => {
    loadMsgs(locale)
  }, [locale])

  if (locale && loadedMsgs) {
    return (
      <IntlContext.Provider value={{locale, setLocale}}>
        <IntlProvider
          defaultLocale={defaultLocale}
          locale={locale}
          messages={loadedMsgs}
        >
          {children}
        </IntlProvider>
      </IntlContext.Provider>
    );
  }
  else
    return null
}
