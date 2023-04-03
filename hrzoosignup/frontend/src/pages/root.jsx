import React from 'react';
import { Outlet } from 'react-router-dom';
import HeadTitle from '../components/HeadTitle';
import { LinkTitles } from '../config/link-titles';
import { RequestTypesToSelect, UrlToRequestType } from '../config/request-types';
import { ResourceTypesToSelect } from '../config/resource-types';
import { listScientificDomain, mapDomainsToFields } from '../config/scientific-domain';
import { listScientificSoftware } from '../config/scientific-software';
import { buildOptionsFromArray } from '../utils/select-tools';
import { AuthContextProvider } from '../utils/AuthContextProvider';


export const SharedData = React.createContext()


const Root = () => {
  return (
    <SharedData.Provider value={{
      LinkTitles,
      RequestTypesToSelect,
      UrlToRequestType,
      ResourceTypesToSelect,
      listScientificDomain,
      mapDomainsToFields,
      buildOptionsFromArray,
      listScientificSoftware
    }}>
      <HeadTitle />
      <AuthContextProvider>
        <Outlet />
      </AuthContextProvider>
    </SharedData.Provider>
  )
};

export default Root;
