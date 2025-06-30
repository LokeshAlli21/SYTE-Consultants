import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PromoterApp from './PromoterApp.jsx'

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import { useSelector } from "react-redux"

import AuthLayout from './auth/AuthLayout.jsx'
import PromoterAuthLayout from './auth/PromoterAuthLayout.jsx'

import store from "./store/store.js"
import { Provider } from "react-redux"

// Import all components...
import {
  Dashboard,
  Projects,
  Assignments,
  ChannelPartners,
  QPR,
  AA,
  Reports,
  Login,
  AddPromoter,
  PromotersPage,
  AddProject,
  AddAssignment,
  AddChannelPartner,
  AssignmentTimeLine,
  AdminPanel,
  Accounts,
  SyteDocuments,
  NotFoundPage,
} from './pages/index.js'

import {
  PromoterDashboard,
  PromoterLogin,
  PromoterProfile,
  PromoterProjects,
} from './pages/promoter/index.js'

// Route Protection Component
const ProtectedRoute = ({ children, requiredRole, fallbackPath = "/login" }) => {
  const authStatus = useSelector(state => state.auth.status)
  const userRole = useSelector(state => state.auth.userRole)
  
  if (!authStatus) {
    return <Navigate to={fallbackPath} replace />
  }
  
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = userRole === 'promoter' ? '/promoter/dashboard' : '/consultant/dashboard'
    return <Navigate to={redirectPath} replace />
  }
  
  return children
}

// Role-based Layout Wrapper
const RoleBasedLayout = ({ children, role }) => {
  const userRole = useSelector(state => state.auth.userRole)
  
  if (role === 'promoter' && userRole === 'promoter') {
    return <PromoterApp>{children}</PromoterApp>
  }
  
  if (role === 'consultant' && (userRole === 'consultant' || userRole === 'superadmin')) {
    return <App>{children}</App>
  }
  
  return <Navigate to="/login" replace />
}

// Single Router Configuration
const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    element: (
      <AuthLayout authentication={false}>
        <Login />
      </AuthLayout>
    ),
  },
  {
    path: "/promoter-login",
    element: (
      <AuthLayout authentication={false}>
        <PromoterLogin />
      </AuthLayout>
    ),
  },
  
  // Consultant routes with /consultant prefix
  {
    path: "/consultant",
    element: (
      <ProtectedRoute requiredRole="consultant">
        <RoleBasedLayout role="consultant">
          <App />
        </RoleBasedLayout>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/consultant/dashboard" replace />
      },
      {
        path: "dashboard",
        element: (
          <AuthLayout authentication>
            <Dashboard />
          </AuthLayout>
        ),
      },
      {
        path: "promoters",
        element: (
          <AuthLayout authentication>
            <PromotersPage />
          </AuthLayout>
        ),
      },
      {
        path: "promoters/add",
        element: (
          <AuthLayout authentication>
            <AddPromoter />
          </AuthLayout>
        ),
      },
      {
        path: "promoters/view/:id",
        element: (
          <AuthLayout authentication>
            <AddPromoter viewOnly={true} />
          </AuthLayout>
        ),
      },
      {
        path: "promoters/edit/:id",
        element: (
          <AuthLayout authentication>
            <AddPromoter viewOnly={false} />
          </AuthLayout>
        ),
      },
      {
        path: "projects",
        element: (
          <AuthLayout authentication>
            <Projects />
          </AuthLayout>
        ),
      },
      {
        path: "projects/add",
        element: (
          <AuthLayout authentication>
            <AddProject forUpdate={false} />
          </AuthLayout>
        ),
      },
      {
        path: "projects/view/:id",
        element: (
          <AuthLayout authentication>
            <AddProject forUpdate={false} viewOnly={true} />
          </AuthLayout>
        ),
      },
      {
        path: "projects/edit/:id",
        element: (
          <AuthLayout authentication>
            <AddProject forUpdate={true} viewOnly={false} />
          </AuthLayout>
        ),
      },
      {
        path: "assignments",
        element: (
          <AuthLayout authentication>
            <Assignments />
          </AuthLayout>
        ),
      },
      {
        path: "assignments/add",
        element: (
          <AuthLayout authentication>
            <AddAssignment />
          </AuthLayout>
        ),
      },
      {
        path: "assignments/view/:id",
        element: (
          <AuthLayout authentication>
            <AddAssignment viewOnly={true} />
          </AuthLayout>
        ),
      },
      {
        path: "assignments/edit/:id",
        element: (
          <AuthLayout authentication>
            <AddAssignment viewOnly={false} />
          </AuthLayout>
        ),
      },
      {
        path: "assignments/timeline/:id",
        element: (
          <AuthLayout authentication>
            <AssignmentTimeLine />
          </AuthLayout>
        ),
      },
      {
        path: "channel-partners",
        element: (
          <AuthLayout authentication>
            <ChannelPartners />
          </AuthLayout>
        ),
      },
      {
        path: "channel-partners/add",
        element: (
          <AuthLayout authentication>
            <AddChannelPartner />
          </AuthLayout>
        ),
      },
      {
        path: "channel-partners/view/:id",
        element: (
          <AuthLayout authentication>
            <AddChannelPartner viewOnly={true} />
          </AuthLayout>
        ),
      },
      {
        path: "channel-partners/edit/:id",
        element: (
          <AuthLayout authentication>
            <AddChannelPartner viewOnly={false} />
          </AuthLayout>
        ),
      },
      {
        path: "qpr",
        element: (
          <AuthLayout authentication>
            <QPR />
          </AuthLayout>
        ),
      },
      {
        path: "aa",
        element: (
          <AuthLayout authentication>
            <AA />
          </AuthLayout>
        ),
      },
      {
        path: "reports",
        element: (
          <AuthLayout authentication>
            <Reports />
          </AuthLayout>
        ),
      },
      {
        path: "accounts",
        element: (
          <AuthLayout authentication>
            <Accounts />
          </AuthLayout>
        ),
      },
      {
        path: "admin-panel",
        element: (
          <AuthLayout authentication>
            <AdminPanel />
          </AuthLayout>
        ),
      },
      // {
      //   path: "syte-documents",
      //   element: (
      //     <AuthLayout authentication>
      //       <SyteDocuments />
      //     </AuthLayout>
      //   ),
      // },
    ],
  },
  
  // Promoter routes with /promoter prefix
  {
    path: "/promoter",
    element: (
      <ProtectedRoute requiredRole="promoter">
        <RoleBasedLayout role="promoter">
          <PromoterApp />
        </RoleBasedLayout>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/promoter/dashboard" replace />
      },
      {
        path: "dashboard",
        element: (
          <PromoterAuthLayout authentication>
            <PromoterDashboard />
          </PromoterAuthLayout>
        ),
      },
      {
        path: "profile",
        element: (
          <PromoterAuthLayout authentication>
            <PromoterProfile />
          </PromoterAuthLayout>
        ),
      },
      {
        path: "projects",
        element: (
          <PromoterAuthLayout authentication>
            <PromoterProjects />
          </PromoterAuthLayout>
        ),
      },
    ],
  },
  
  // Root redirect based on user role
  {
    path: "/",
    element: <RoleBasedRedirect />,
  },
  
  // Catch all - 404
  {
    path: "*",
    element: <NotFoundPage />,
  },
])

// Component to handle root redirects
const RoleBasedRedirect = () => {
  const authStatus = useSelector(state => state.auth.status)
  const userRole = useSelector(state => state.auth.userRole)
  
  if (!authStatus) {
    return <Navigate to="/login" replace />
  }
  
  if (userRole === 'promoter') {
    return <Navigate to="/promoter/dashboard" replace />
  }
  
  return <Navigate to="/consultant/dashboard" replace />
}

// Main App Component
const MainApp = () => {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainApp />
  </StrictMode>
)

// code to generate docx file 
// import React, { useState } from 'react';
// import { Document, Packer, Paragraph, TextRun } from 'docx';
// import { saveAs } from 'file-saver';

// function Projects() {
//   const [projectName, setProjectName] = useState('');
//   const [description, setDescription] = useState('');
//   const [techStack, setTechStack] = useState('');

//   const generateDoc = async () => {
//     const doc = new Document({
//       sections: [
//         {
//           children: [
//             new Paragraph({
//               children: [
//                 new TextRun({ text: "Project Details", bold: true, size: 28 }),
//                 new TextRun("\n"),
//                 new TextRun(`Project Name: ${projectName}`),
//                 new TextRun("\n"),
//                 new TextRun(`Description: ${description}`),
//                 new TextRun("\n"),
//                 new TextRun(`Tech Stack: ${techStack}`),
//               ],
//             }),
//           ],
//         },
//       ],
//     });

//     const blob = await Packer.toBlob(doc);
//     saveAs(blob, "ProjectDetails.docx");
//   };

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <h2 className="text-xl font-bold mb-4">Enter Project Details</h2>
//       <input
//         type="text"
//         placeholder="Project Name"
//         value={projectName}
//         onChange={(e) => setProjectName(e.target.value)}
//         className="border w-full p-2 mb-2"
//       />
//       <textarea
//         placeholder="Description"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         className="border w-full p-2 mb-2"
//       />
//       <input
//         type="text"
//         placeholder="Tech Stack"
//         value={techStack}
//         onChange={(e) => setTechStack(e.target.value)}
//         className="border w-full p-2 mb-2"
//       />
//       <button
//         onClick={generateDoc}
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//       >
//         Generate DOCX
//       </button>
//     </div>
//   );
// }

// export default Projects;
