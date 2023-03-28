import React from 'react'
import {
  Routes, Route, BrowserRouter
} from 'react-router-dom';
import BasePage from './ui/BasePage';
import LoginPrivate from './routes/login-private';
import LoginPublic from './routes/login-public';
import MyRequests from './routes/my-requests';
import NewRequest from './routes/new-request';
import ResearchProjectRequest from './routes/new-requests/research-project';
import GeneralRequest from './routes/new-requests/general';
import NewRequestIndex from './routes/new-requests/index';
import PublicKeys from './routes/public-keys';
import Memberships from './routes/memberships';
import MyInfo from './routes/my-info';
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
            <Route path="novi-zahtjev" element={<NewRequest />}>
              <Route index element={<NewRequestIndex />}/>
              <Route path="istrazivacki-projekt" element={<ResearchProjectRequest />}/>
              <Route path="prakticna-nastava" element={<GeneralRequest />}/>
              <Route path="zavrsni-rad" element={<GeneralRequest />}/>
            </Route>
            <Route path="javni-kljucevi" element={<PublicKeys />}/>
            <Route path="clanstva" element={<Memberships />}/>
            <Route path="moji-podatci" element={<MyInfo />}/>
          </Route>
          <Route path="*" element={<NotFound />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default BaseRoutes;
