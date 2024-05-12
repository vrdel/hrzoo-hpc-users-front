import React, { useContext } from 'react'
import {
  Routes, Route, BrowserRouter
} from 'react-router-dom';
import BasePage from 'Components/BasePage';
import LoginPrivate from 'Pages/login-private';
import LoginOffical from 'Pages/login-official';
import MyRequestsList from 'Pages/my-requests/list';
import { MyRequestChange } from 'Pages/my-requests/change';
import { ProjectChange } from 'Pages/projects/change';
import NewRequest from 'Pages/new-request';
import { ManageRequestsChange } from 'Pages/manage-requests/change';
import { ManageRequestsList } from 'Pages/manage-requests/list';
import { SoftwareList } from 'Pages/software/list';
import ResearchProjectRequest from 'Pages/new-requests/research-project';
import ResearchProjectRequestSelected from 'Pages/new-requests/research-project-selected';
import GeneralRequest from 'Pages/new-requests/general';
import InstituteRequest from 'Pages/new-requests/institute-project';
import InternalRequest from 'Pages/new-requests/internal-project';
import SrceWorkShopRequest from 'Pages/new-requests/srce-workshop';
import NewRequestIndex from 'Pages/new-requests/index';
import EmailInvitation from 'Pages/email-invite';
import Saml2LoginRedirect from 'Pages/saml2-login-redirect';
import Saml2NotAllowed from 'Pages/saml2-not-allowed';
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
import UserChange from 'Pages/users/change';
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
            <Route path="login-priv" element={<LoginPrivate sessionData={sessionData} />}/>
            <Route path="login" element={<LoginOffical sessionData={sessionData} />}/>
            <Route path="saml2-not-allowed/" element={<Saml2NotAllowed />}>
              <Route path=":errorType" element={<Saml2NotAllowed />}/>
            </Route>
            <Route path="login-email/:inviteKey" element={
              <EmailInvitation sessionData={sessionData} /> }
            />
            <Route element={<BasePage sessionData={sessionData} />}>
              <Route path="saml2-login-redirect" element={
                <Saml2LoginRedirect sessionData={sessionData} /> }
              />
              <Route path="requests" element={
                <ProtectedRoute sessionData={sessionData}>
                  <ManageRequestsList />
                </ProtectedRoute> }
              />
              <Route path="requests/:projId" element={
                <ProtectedRoute sessionData={sessionData}>
                  <ManageRequestsChange />
                </ProtectedRoute> }
              />
              <Route path="projects" element={
                <ProtectedRoute sessionData={ sessionData }>
                  <ProjectsList />
                </ProtectedRoute> }
              />
              <Route path="projects/:projId" element={
                <ProtectedRoute sessionData={ sessionData }>
                  <ProjectChange />
                </ProtectedRoute> }
              />
              <Route path="users" element={
                <ProtectedRoute sessionData={sessionData}>
                  <UsersList />
                </ProtectedRoute> }
              />
              <Route path="users/:userId" element={
                <ProtectedRoute sessionData={sessionData}>
                  <UserChange />
                </ProtectedRoute> }
              />
              <Route path="users/inactive" element={
                <ProtectedRoute sessionData={sessionData}>
                  <UsersInactiveList />
                </ProtectedRoute> }
              />
              <Route path="users/inactive/:userId" element={
                <ProtectedRoute sessionData={sessionData}>
                  <UserChange />
                </ProtectedRoute> }
              />
              <Route path="software" element={
                <ProtectedRoute sessionData={sessionData}>
                  <SoftwareList />
                </ProtectedRoute> }
              />
              <Route path="my-requests" element={
                <MyRequestsList /> }
              />
              <Route path="my-requests/:projId" element={
                <MyRequestChange /> }
              />
              <Route path="new-request" element={
                <NewRequest /> }
              >
                <Route index element={
                  <NewRequestIndex /> }
                />
                <Route path="research-project" element={
                  <ResearchProjectRequest /> }
                />
                <Route path="research-project/:projId" element={
                  <ResearchProjectRequestSelected projectType="research-croris" /> }
                />
                <Route path="practical-class" element={
                  <GeneralRequest projectType="practical" /> }
                />
                <Route path="thesis-project" element={
                  <GeneralRequest projectType="thesis" /> }
                />
                <Route path="institutional-project" element={
                  <InstituteRequest /> }
                />
                <Route path="internal-project" element={
                  <ProtectedRoute sessionData={sessionData}>
                    <InternalRequest/>
                  </ProtectedRoute> }
                />
                <Route path="srce-workshop" element={
                  <ProtectedRoute sessionData={sessionData}>
                    <SrceWorkShopRequest />
                  </ProtectedRoute> }
                />
              </Route>
              <Route path="public-keys" element={
                <PublicKeys /> }
              />
              <Route path="public-keys/new" element={
                <NewPublicKey /> }
              />
              <Route path="memberships" element={
                <Memberships /> }
              />
              <Route path="my-info" element={
                <MyInfo /> }
              />
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
