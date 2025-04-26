import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { createBrowserRouter, RouterProvider } from "react-router-dom"

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
        element: <Login />,
      },
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/promoters",
        element: <Promoters />, 
      },
      {
        path: "/promoters/add",
        element: <AddPromoter />,
      },
      {
        path: "/projects",
        element: <Projects />,
      },
      {
        path: "/assignments",
        element: <Assignments />,
      },
      {
        path: "/channel-partners",
        element: <ChannelPartners />,
      },
      {
        path: "/qpr",
        element: <QPR />,
      },
      {
        path: "/aa",
        element: <AA />,
      },
      {
        path: "/reports",
        element: <Reports />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
