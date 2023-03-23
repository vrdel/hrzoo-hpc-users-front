import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import 'bootstrap/dist/css/bootstrap.min.css'
import {
  Routes, Route, BrowserRouter
} from 'react-router-dom';
import Root from './routes/root';
import LoginPublic from './routes/login-public';
import LoginPrivate from './routes/login-private';
import MyRequests from './routes/my-requests';
import NotFound from './routes/notfound';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="ui" element={<Root />}>
            <Route path="prijava-priv" element={<LoginPrivate/>}/>
            <Route path="prijava" element={<LoginPublic/>}/>
            <Route path="moji-zahtjevi" element={<MyRequests/>}/>
            <Route path="*" element={<NotFound/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)
