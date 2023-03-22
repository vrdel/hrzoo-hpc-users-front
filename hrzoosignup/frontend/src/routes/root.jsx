import React from 'react';
import { Outlet } from 'react-router-dom';
import HeadTitle from '../ui/headtitle';


const Root = () => {
  return (
    <>
      <HeadTitle />
      <Outlet />
    </>
  )
};

export default Root;
