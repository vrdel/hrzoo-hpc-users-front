import React, { useContext } from 'react'
import {
  Routes, Route, BrowserRouter, useNavigate
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
import { AuthContext } from './utils/AuthContextProvider';
import { defaultUnAuthnRedirect } from './config/default-redirect'


const ProtectedRoute = ( {children} )  => {
  const navigate = useNavigate()
  const { isLoggedIn } = useContext(AuthContext)

  if (!isLoggedIn)
    navigate(defaultUnAuthnRedirect)
  else
    return children
}


const BaseRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="ui" element={<Root />}>
          <Route path="prijava-priv" element={<LoginPrivate />}/>
          <Route path="prijava" element={<LoginPublic />}/>
          <Route element={<BasePage />}>
            <Route path="moji-zahtjevi" element={
              <ProtectedRoute>
                <MyRequests />
              </ProtectedRoute>
            }/>
            <Route path="novi-zahtjev" element={
              <ProtectedRoute>
                <NewRequest />
              </ProtectedRoute>
            }>
              <Route index element={
                <ProtectedRoute>
                  <NewRequestIndex />
                </ProtectedRoute>
              }/>
              <Route path="istrazivacki-projekt" element={
                <ProtectedRoute>
                  <ResearchProjectRequest />
                </ProtectedRoute>
              }/>
              <Route path="prakticna-nastava" element={
                <ProtectedRoute>
                  <GeneralRequest />
                </ProtectedRoute>
              }/>
              <Route path="zavrsni-rad" element={
                <ProtectedRoute>
                  <GeneralRequest />
                </ProtectedRoute>
              }/>
            </Route>
            <Route path="javni-kljucevi" element={
              <ProtectedRoute>
                <PublicKeys />
              </ProtectedRoute>
            }/>
            <Route path="clanstva" element={
              <ProtectedRoute>
                <Memberships />
              </ProtectedRoute>
            }/>
            <Route path="moji-podatci" element={
              <ProtectedRoute>
                <MyInfo />
              </ProtectedRoute>
            }/>
          </Route>
          <Route path="*" element={<NotFound />}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default BaseRoutes;
