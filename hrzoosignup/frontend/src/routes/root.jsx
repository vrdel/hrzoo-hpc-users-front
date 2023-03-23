import React from 'react';
import { Outlet } from 'react-router-dom';
import HeadTitle from '../ui/HeadTitle';


const Root = () => {
  return (
    <>
      <HeadTitle />
      <Outlet />
    </>
  )
};

export default Root;
