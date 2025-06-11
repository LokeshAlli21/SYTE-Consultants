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
          <PromotersPage />
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
        path: "/promoters/view/:id",
        element: 
        <AuthLayout authentication>
          <AddPromoter  viewOnly={true}  />
         </AuthLayout>,
      },
      {
        path: "/promoters/edit/:id",
        element: 
        <AuthLayout authentication>
          <AddPromoter  viewOnly={false}  />
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
        path: "/projects/add",
        element: 
        <AuthLayout authentication>
          <AddProject forUpdate={false} />
         </AuthLayout>,
      },
      {
        path: "/projects/view/:id",
        element: 
        <AuthLayout authentication>
          <AddProject  forUpdate={false} viewOnly={true}  />
         </AuthLayout>,
      },
      {
        path: "/projects/edit/:id",
        element: 
        <AuthLayout authentication>
          <AddProject forUpdate={true}  viewOnly={false}  />
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
        path: "/assignments/add",
        element: 
        <AuthLayout authentication>
          <AddAssignment />
         </AuthLayout>,
      },
      {
        path: "/assignments/view/:id",
        element: 
        <AuthLayout authentication>
          <AddAssignment  viewOnly={true}  />
         </AuthLayout>,
      },
      {
        path: "/assignments/edit/:id",
        element: 
        <AuthLayout authentication>
          <AddAssignment  viewOnly={false}  />
         </AuthLayout>,
      },
      {
        path: "/assignments/timeline/:id",
        element: 
        <AuthLayout authentication>
          <AssignmentTimeLine/>
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
        path: "/channel-partners/add",
        element: 
        <AuthLayout authentication>
          <AddChannelPartner />
         </AuthLayout>,
      },
      {
        path: "/channel-partners/view/:id",
        element: 
        <AuthLayout authentication>
          <AddChannelPartner viewOnly={true} />
         </AuthLayout>,
      },
      {
        path: "/channel-partners/edit/:id",
        element: 
        <AuthLayout authentication>
          <AddChannelPartner viewOnly={false} />
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
      {
        path: "/accounts",
        element: 
        <AuthLayout authentication>
          {" "}
          <Accounts />
         </AuthLayout>,
      },
      {
        path: "/admin-panel",
        element: 
        <AuthLayout authentication>
          {" "}
          <AdminPanel />
         </AuthLayout>,
      },
      {
        path: "/syte-documents",
        element: 
        <AuthLayout authentication>
          {" "}
          {/* <SyteDocuments /> TODO: update this component as per BUCKET METHODS (RERA-DEV) in databaseService */}
         </AuthLayout>,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  // </StrictMode>, 
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
