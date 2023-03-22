import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// import './index.css'
import { HelmetProvider } from 'react-helmet-async'
import 'bootstrap/dist/css/bootstrap.min.css'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';
import Root from './routes/root';
import LoginPublic from './routes/login_public';
import LoginPrivate from './routes/login_private';


const router = createBrowserRouter([
  {
    path: "ui/",
    element: <Root/>,
    children: [
      {
        path: "prijava",
        element: <LoginPublic />,
      },
      {
        path: "login",
        element: <LoginPrivate />,
      },
    ]
  }
])


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>
)
