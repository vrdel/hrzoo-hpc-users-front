import React, { useContext, useState, useEffect } from 'react'
import {
  Routes, Route, BrowserRouter
} from 'react-router-dom';
import BasePage from './components/BasePage';
import LoginPrivate from './pages/login-private';
import LoginPublic from './pages/login-public';
import MyRequests from './pages/my-requests';
import NewRequest from './pages/new-request';
import ResearchProjectRequest from './pages/new-requests/research-project';
import GeneralRequest from './pages/new-requests/general';
import NewRequestIndex from './pages/new-requests/index';
import PublicKeys from './pages/public-keys';
import Memberships from './pages/memberships';
import MyInfo from './pages/my-info';
import NotFound from './pages/notfound';
import Root from './pages/root';
import { isActiveSession } from './api/auth';
import { useQuery } from '@tanstack/react-query';

const BaseRoutes = () => {
  const { status: sessionStatus, data: sessionData} = useQuery({
    queryKey: ['sessionactive'],
    queryFn: isActiveSession,
    staleTime: 60 * 60 * 1000,
  })

  if (sessionStatus == 'success' && sessionData) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="ui" element={<Root />}>
            <Route path="prijava-priv" element={<LoginPrivate />}/>
            <Route path="prijava" element={<LoginPublic />}/>
            <Route element={<BasePage isSessionActive={sessionData.active} />}>
              <Route path="moji-zahtjevi" element={
                <MyRequests />
              }/>
              <Route path="novi-zahtjev" element={
                <NewRequest />
              }>
                <Route index element={
                  <NewRequestIndex />
                }/>
                <Route path="istrazivacki-projekt" element={
                  <ResearchProjectRequest />
                }/>
                <Route path="prakticna-nastava" element={
                  <GeneralRequest />
                }/>
                <Route path="zavrsni-rad" element={
                  <GeneralRequest />
                }/>
              </Route>
              <Route path="javni-kljucevi" element={
                <PublicKeys />
              }/>
              <Route path="clanstva" element={
                <Memberships />
              }/>
              <Route path="moji-podatci" element={
                <MyInfo />
              }/>
            </Route>
            <Route path="*" element={<NotFound />}/>
          </Route>
        </Routes>
      </BrowserRouter>
    )
  }
  else
    return false
}

export default BaseRoutes;
