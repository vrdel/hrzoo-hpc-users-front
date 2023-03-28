import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import 'bootstrap/dist/css/bootstrap.min.css'
import BaseRoutes from './routes';
import { LinkTitles } from './shared/link-titles';
import { ProjectTypesToSelect } from './shared/project-types-select';


export const SharedData = React.createContext()


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <SharedData.Provider value={{
        linkTitles: LinkTitles,
        ProjectTypesToSelect: ProjectTypesToSelect
      }}>
        <BaseRoutes />
      </SharedData.Provider>
    </HelmetProvider>
  </React.StrictMode>
)
