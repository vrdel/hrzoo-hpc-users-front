import React, { useContext } from 'react'
import {
  Routes, Route, BrowserRouter
} from 'react-router-dom';
import BasePage from 'Components/BasePage';
import LoginPrivate from 'Pages/login-private';
import LoginOffical from 'Pages/login-official';
import MyRequestsList from 'Pages/my-requests/list';
import { MyRequestChange } from 'Pages/my-requests/change';
import NewRequest from 'Pages/new-request';
import { ManageRequestsChange } from 'Pages/manage-requests/change';
import { ManageRequestsList } from 'Pages/manage-requests/list';
import { SoftwareList } from 'Pages/software/list';
import ResearchProjectRequest from 'Pages/new-requests/research-project';
import ResearchProjectRequestSelected from 'Pages/new-requests/research-project-selected';
import GeneralRequest from 'Pages/new-requests/general';
import InstituteRequest from 'Pages/new-requests/institute-project';
import InternalRequest from 'Pages/new-requests/internal-project';
import NewRequestIndex from 'Pages/new-requests/index';
import EmailInvitation from 'Pages/email-invite';
import Saml2LoginRedirect from 'Pages/saml2-login-redirect';
import PublicKeys from 'Pages/public-keys/list';
import NewPublicKey from 'Pages/public-keys/add';
import Memberships from 'Pages/memberships';
import MyInfo from 'Pages/my-info';
import NotFound from 'Pages/notfound';
import Root from 'Pages/root';
import { isActiveSession } from 'Api/auth';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from 'Components/AuthContextProvider';
import { UsersList, UsersInactiveList } from 'Pages/users/list';
import { ProjectsList } from 'Pages/projects/list';


function getAndSetReferrer() {
  let referrer = localStorage.getItem('referrer');
  let stackUrls = undefined;

  if (referrer)
    stackUrls = JSON.parse(referrer);
  else
    stackUrls = new Array();

  // track only last 3 urls
  if (stackUrls.length === 3) {
    stackUrls = new Array();
    stackUrls.push(window.location.pathname);
  }
  else if (stackUrls.indexOf(window.location.pathname) === -1)
    stackUrls.push(window.location.pathname);
  localStorage.setItem('referrer', JSON.stringify(stackUrls));
}


const ProtectedRoute = ({sessionData, children}) => {
  const { isLoggedIn, userDetails } = useContext(AuthContext)

  if ((isLoggedIn || sessionData.active)
    && (userDetails.is_staff || userDetails.is_superuser))
    return children
  else
    return null
}


const BaseRoutes = () => {
  const { status: sessionStatus, data: sessionData} = useQuery({
    queryKey: ['sessionactive'],
    queryFn: isActiveSession,
  })

  getAndSetReferrer();

  if (sessionStatus == 'success' && sessionData) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="ui" element={<Root />}>
            <Route path="prijava-priv" element={<LoginPrivate sessionData={sessionData} />}/>
            <Route path="prijava" element={<LoginOffical sessionData={sessionData} />}/>
            <Route path="prijava-email/:inviteKey" element={
              <EmailInvitation sessionData={sessionData} />
            }/>
            <Route element={<BasePage sessionData={sessionData} />}>
              <Route path="saml2-login-redirect" element={
                <Saml2LoginRedirect sessionData={sessionData} />
              }/>
              <Route path="upravljanje-zahtjevima" element={
                <ProtectedRoute sessionData={sessionData}>
                  <ManageRequestsList />
                </ProtectedRoute>
              }/>
              <Route path="projekti" element={
                <ProtectedRoute sessionData={ sessionData }>
                  <ProjectsList />
                </ProtectedRoute>
              } />
              <Route path="korisnici" element={
                <ProtectedRoute sessionData={sessionData}>
                  <UsersList />
                </ProtectedRoute>
              }/>
              <Route path="korisnici/neaktivni" element={
                <ProtectedRoute sessionData={sessionData}>
                  <UsersInactiveList />
                </ProtectedRoute>
              }/>
              <Route path="softver" element={
                <ProtectedRoute sessionData={sessionData}>
                  <SoftwareList />
                </ProtectedRoute>
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
                <Route path="izrada-rada" element={
                  <GeneralRequest projectType="thesis" />
                }/>
                <Route path="institucijski-projekt" element={
                  <InstituteRequest />
                }/>
                <Route path="interni-projekt" element={
                  <ProtectedRoute sessionData={sessionData}>
                    <InternalRequest/>
                  </ProtectedRoute>
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
              <Route path="moji-podaci" element={
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
