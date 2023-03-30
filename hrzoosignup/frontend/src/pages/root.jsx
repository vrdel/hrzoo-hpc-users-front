import React from 'react';
import { Outlet } from 'react-router-dom';
import HeadTitle from '../components/HeadTitle';
import { LinkTitles } from '../utils/link-titles';
import { RequestTypesToSelect, UrlToRequestType } from '../utils/request-types';
import { ResourceTypesToSelect } from '../utils/resource-types';
import { listScientificDomain, mapDomainsToFields } from '../utils/scientific-domain';
import { buildOptionsFromArray } from '../utils/select-tools';


export const SharedData = React.createContext()


const Root = () => {
  return (
    <>
      <SharedData.Provider value={{
        LinkTitles,
        RequestTypesToSelect,
        UrlToRequestType,
        ResourceTypesToSelect,
        listScientificDomain,
        mapDomainsToFields,
        buildOptionsFromArray
      }}>
        <HeadTitle />
        <Outlet />
      </SharedData.Provider>
    </>
  )
};

export default Root;
