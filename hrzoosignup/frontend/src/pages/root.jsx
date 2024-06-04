import React from 'react';
import { Outlet } from 'react-router-dom';
import { LinkTitles } from 'Config/link-titles';
import { RequestTypesToSelect, UrlToRequestType } from 'Config/request-types';
import { ResourceTypesToSelect, ResourceTypesToSelectAdmin } from 'Config/resource-types';
import { AuthContextProvider } from 'Components/AuthContextProvider';

export const SharedData = React.createContext()

const Root = () => {
  return (
    <SharedData.Provider value={{
      LinkTitles,
      RequestTypesToSelect,
      UrlToRequestType,
      ResourceTypesToSelect,
      ResourceTypesToSelectAdmin,
    }}>
      <AuthContextProvider>
        <Outlet />
      </AuthContextProvider>
    </SharedData.Provider>
  )
};

export default Root;
