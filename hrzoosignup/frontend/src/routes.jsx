import React from 'react'
import {
  Routes, Route, BrowserRouter
} from 'react-router-dom';
import BasePage from './ui/BasePage';
import LoginPrivate from './routes/login-private';
import LoginPublic from './routes/login-public';
import MyRequests from './routes/my-requests';
import NewRequest from './routes/new-request';
import NotFound from './routes/notfound';
import Root from './routes/root';


const BaseRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="ui" element={<Root />}>
          <Route path="prijava-priv" element={<LoginPrivate />}/>
          <Route path="prijava" element={<LoginPublic />}/>
          <Route element={<BasePage />}>
            <Route path="moji-zahtjevi" element={<MyRequests />}/>
            <Route path="novi-zahtjev" element={<NewRequest />}/>
          </Route>
          <Route path="*" element={<NotFound />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default BaseRoutes;
