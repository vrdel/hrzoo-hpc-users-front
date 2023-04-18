import React, { useContext } from 'react'
import {
  Routes, Route, BrowserRouter
} from 'react-router-dom';
import BasePage from './components/BasePage';
import LoginPrivate from './pages/login-private';
import LoginOffical from './pages/login-official';
import MyRequestsList from './pages/my-requests/list';
import { MyRequestChange } from './pages/my-requests/change';
import NewRequest from './pages/new-request';
import { ManageRequestsChange } from './pages/manage-requests/change';
import { ManageRequestsList } from './pages/manage-requests/list';
import ResearchProjectRequest from './pages/new-requests/research-project';
import ResearchProjectRequestSelected from './pages/new-requests/research-project-selected';
import GeneralRequest from './pages/new-requests/general';
import NewRequestIndex from './pages/new-requests/index';
import EmailInvitation from './pages/email-invite';
import Saml2LoginRedirect from './pages/saml2-login-redirect';
import PublicKeys from './pages/public-keys/list';
import NewPublicKey from './pages/public-keys/add';
import Memberships from './pages/memberships';
import MyInfo from './pages/my-info';
import NotFound from './pages/notfound';
import Root from './pages/root';
import { isActiveSession } from './api/auth';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from './components/AuthContextProvider';


const ProtectedRoute = ({sessionData, children}) => {
  const { isLoggedIn, userDetails } = useContext(AuthContext)

  if ((isLoggedIn || sessionData.active)
    && (userDetails.is_staff || userDetails.is_superuser))
    return children
  else
    return (
      <NotFound/>
    )
}


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
            <Route path="prijava" element={<LoginOffical />}/>
            <Route path="prijava-email/:inviteKey" element={
              <EmailInvitation sessionData={sessionData} />
            }/>
            <Route element={<BasePage sessionData={sessionData} />}>
              <Route path="upravljanje-zahtjevima" element={
                <ProtectedRoute sessionData={sessionData}>
                  <ManageRequestsList />
                </ProtectedRoute>
              }/>
              <Route path="saml2-login-redirect" element={
                <Saml2LoginRedirect sessionData={sessionData} />
              }/>
              <Route path="upravljanje-zahtjevima/:projId" element={
                <ProtectedRoute sessionData={sessionData}>
                  <ManageRequestsChange />
                </ProtectedRoute>
              }/>
              <Route path="moji-zahtjevi" element={
                <MyRequestsList />
              }/>
              <Route path="moji-zahtjevi/:projId" element={
                <MyRequestChange />
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
                <Route path="istrazivacki-projekt/:projId" element={
                  <ResearchProjectRequestSelected projectType="research-croris" />
                }/>
                <Route path="prakticna-nastava" element={
                  <GeneralRequest projectType="practical" />
                }/>
                <Route path="zavrsni-rad" element={
                  <GeneralRequest projectType="thesis" />
                }/>
              </Route>
              <Route path="javni-kljucevi" element={
                <PublicKeys />
              }/>
              <Route path="javni-kljucevi/novi" element={
                <NewPublicKey />
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
