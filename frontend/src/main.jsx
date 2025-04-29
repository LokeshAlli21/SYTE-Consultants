import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { createBrowserRouter, RouterProvider } from "react-router-dom"

import AuthLayout from './auth/AuthLayout.jsx'

import store from "./store/store.js"
import { Provider } from "react-redux"

import {
  Dashboard,
  Promoters,
  Projects,
  Assignments,
  ChannelPartners,
  QPR,
  AA,
  Reports,
  Login,
  AddPromoter,
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
        path: "/promoters",
        element: 
        <AuthLayout authentication>
          {" "}
          <Promoters />
         </AuthLayout>, 
      },
      {
        path: "/promoters/add",
        element: 
        <AuthLayout authentication>
          <AddPromoter />
         </AuthLayout>,
      },
      {
        path: "/promoters/edit/:id",
        element: 
        <AuthLayout authentication>
          <AddPromoter />
         </AuthLayout>,
      },
      {
        path: "/projects",
        element: 
        <AuthLayout authentication>
          <Projects />
         </AuthLayout>,
      },
      {
        path: "/assignments",
        element: 
        <AuthLayout authentication>
          <Assignments />
         </AuthLayout>,
      },
      {
        path: "/channel-partners",
        element: 
        <AuthLayout authentication>
          <ChannelPartners />
         </AuthLayout>,
      },
      {
        path: "/qpr",
        element: 
        <AuthLayout authentication>
          <QPR />
         </AuthLayout>,
      },
      {
        path: "/aa",
        element: 
        <AuthLayout authentication>
          <AA />
         </AuthLayout>,
      },
      {
        path: "/reports",
        element: 
        <AuthLayout authentication>
          {" "}
          <Reports />
         </AuthLayout>,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
