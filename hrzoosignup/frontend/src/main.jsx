import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import 'bootstrap/dist/css/bootstrap.min.css'
import BaseRoutes from './routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { IntlProvider } from 'react-intl';
import 'Styles/bootstrap-custom.scss'

const queryClient = new QueryClient()
const defaultLocale = "hr"


function loadLocaleData(locale) {
  switch (locale) {
    case 'hr':
      return import('./compiled-lang/hr.json')
    //default:
      //return import('compiled-lang/en.json')
  }
}

const messages = await loadLocaleData(defaultLocale)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <IntlProvider
      defaultLocale={defaultLocale}
      messages={messages}
    >
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <BaseRoutes />
        </QueryClientProvider>
      </HelmetProvider>
    </IntlProvider>
  </React.StrictMode>
)
