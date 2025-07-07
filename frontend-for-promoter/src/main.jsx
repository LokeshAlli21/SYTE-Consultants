import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { createBrowserRouter, RouterProvider } from "react-router-dom"

import AuthLayout from './auth/AuthLayout.jsx'

import store from "./store/store.js"
import { Provider } from "react-redux"


import {
  Dashboard,
  Projects,
  ViewProject,
  ViewProjectUnit,
  Units,
  Login,
  NotFoundPage,
  Documents,
  Progress,
} from './pages/index.js'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,  // This handles the root path /promoter/
        element:
        <AuthLayout authentication>
           <Dashboard />
         </AuthLayout>,
      },
      {
        path: "login",
        element: 
        <AuthLayout authentication={false}>
          <Login />
         </AuthLayout>,
      },
      {
        path: "projects",
        element: 
        <AuthLayout authentication>
          <Projects />
         </AuthLayout>, 
      },
      {
        path: "project/:id",
        element: 
        <AuthLayout authentication>
          <ViewProject />
         </AuthLayout>,
      },
      {
        path: "project/unit/:id",
        element: 
        <AuthLayout authentication>
          <ViewProjectUnit />
         </AuthLayout>,
      },
      {
        path: "units/:projectId",
        element: 
        <AuthLayout authentication>
          <Units />
         </AuthLayout>,
      },
      {
        path: "documents/:id",
        element: 
        <AuthLayout authentication>
          <Documents />
         </AuthLayout>,
      },
      {
        path: "progress/:id",
        element: 
        <AuthLayout authentication>
          <Progress />
         </AuthLayout>,
      },
    ],
    errorElement: <NotFoundPage />
  },
], {
  basename: "/promoter",
});

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);