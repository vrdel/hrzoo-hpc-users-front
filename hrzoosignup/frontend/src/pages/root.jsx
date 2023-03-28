import React from 'react';
import { Outlet } from 'react-router-dom';
import HeadTitle from '../components/HeadTitle';
import { LinkTitles } from '../utils/link-titles';
import { ProjectTypesToSelect } from '../utils/project-types-select';


export const SharedData = React.createContext()


const Root = () => {
  return (
    <>
      <SharedData.Provider value={{
        linkTitles: LinkTitles,
        ProjectTypesToSelect: ProjectTypesToSelect
      }}>
        <HeadTitle />
        <Outlet />
      </SharedData.Provider>
    </>
  )
};

export default Root;
