import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import 'bootstrap/dist/css/bootstrap.min.css'
import BaseRoutes from './routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { IntlContextProvider } from 'Components/IntlContextProvider';
import 'Styles/bootstrap-custom.scss'

const queryClient = new QueryClient()


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <IntlContextProvider>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <BaseRoutes />
        </QueryClientProvider>
      </HelmetProvider>
    </IntlContextProvider>
  </React.StrictMode>
)
