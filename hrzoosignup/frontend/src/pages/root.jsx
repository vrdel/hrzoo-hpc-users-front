import React from 'react';
import { Outlet } from 'react-router-dom';
import HeadTitle from '../components/HeadTitle';


const Root = () => {
  return (
    <>
      <HeadTitle />
      <Outlet />
    </>
  )
};

export default Root;
