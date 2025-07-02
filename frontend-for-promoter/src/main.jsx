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
  ViewProfile,
  Login,
  NotFoundPage,
} from './pages/index.js'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/login",
        element: 
        <AuthLayout authentication={false}>
          <Login />
         </AuthLayout>,
      },
      {
        path: "/",
        element:
        <AuthLayout authentication>
           <Dashboard />
         </AuthLayout>,
      },
      {
        path: "/projects",
        element: 
        <AuthLayout authentication>
          {" "}
          <Projects />
         </AuthLayout>, 
      },
      {
        path: "/project/:id",
        element: 
        <AuthLayout authentication>
          <ViewProject />
         </AuthLayout>,
      },
      {
        path: "/project/unit/:id",
        element: 
        <AuthLayout authentication>
          <ViewProjectUnit />
         </AuthLayout>,
      },
      {
        path: "/profile",
        element: 
        <AuthLayout authentication>
          <ViewProfile />
         </AuthLayout>,
      },
    ],
    errorElement: <NotFoundPage />
  },
]);

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
);