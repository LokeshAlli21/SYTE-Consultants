import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa6';
import { FaFilePdf, FaTimes } from "react-icons/fa";
import {
    ProjectDetailsForm,
    ProjectProfessionalDetailsForm,
  } from '../components/index.js';
import databaseService from '../backend-services/database/database'
import { toast } from 'react-toastify';

const tabs = [
  "Project Details",
  "Professional Details",
  "Unit Details",
  "Documents",
  "Project Progress",
];

const AddProject = () => {
    const navigate = useNavigate();
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [projectDetails, setProjectDetails] = useState({
      channel_partner: "",
      promoter_id: 1,
      promoter_name: "",
      project_name: "",
      project_type: "",
      project_address: "",
      project_pincode: 0,
      login_id: "",
      password: "",
      district: "",
      city: "",
      rera_number: "",
      rera_certificate_uploaded_url: "",
      registration_date: "",
      expiry_date: "",
    });
    const [projectProfessionalDetails, setProjectProfessionalDetails] = useState({
      project_id: 6,
      engineer: {
        name: "",
        contact_number: "",
        email_id: "",
        office_address: "",
        licence_number: "",
        licence_uploaded_url: "",
        pan_number: "",
        pan_uploaded_url: "",
        letter_head_uploaded_url: "",
        sign_stamp_uploaded_url: ""
      },
      architect: {
        name: "",
        contact_number: "",
        email_id: "",
        office_address: "",
        licence_number: "",
        licence_uploaded_url: "",
        pan_number: "",
        pan_uploaded_url: "",
        letter_head_uploaded_url: "",
        sign_stamp_uploaded_url: ""
      },
      ca: {
        name: "",
        contact_number: "",
        email_id: "",
        office_address: "",
        licence_number: "",
        licence_uploaded_url: "",
        pan_number: "",
        pan_uploaded_url: "",
        letter_head_uploaded_url: "",
        sign_stamp_uploaded_url: ""
      }
    })
    
  
  
    const handleBack = () => {
      if (activeTabIndex > 0) {
        setActiveTabIndex((prev) => prev - 1);
      } else {
        navigate(-1);
      }
    };
  
    const handleSubmitProjectDetails = async () => {
      console.log("Form Data Submitted:", projectDetails);
      // setLoading(true);
      try {
        const response = await databaseService.uploadProjectDetails(projectDetails);
        console.log("✅ Project details uploaded:", response);
        toast.success("✅ Project details submitted successfully!");
        navigate("/projects"); // 👈 Navigate to projects page or wherever appropriate
      } catch (error) {
        console.error("❌ Error submitting project details:", error);
        toast.error(`❌ Failed to submit project details: ${error.message}`);
      } finally {
        // setLoading(false);
      }
    };
    const handleSubmitProjectProfessionalDetails = async () => {
      // console.log("Form Data Submitted:", projectProfessionalDetails);
      // setLoading(true);
      try {
        const response = await databaseService.uploadProjectProfessionalDetails(projectProfessionalDetails);
        console.log("✅ Project professional details uploaded:", response);
        toast.success("✅ Project professional details submitted successfully!");
        navigate("/projects"); // 👈 Update the route if needed
      } catch (error) {
        console.error("❌ Error submitting project professional details:", error);
        toast.error(`❌ Failed to submit professional details: ${error.message}`);
      } finally {
        // setLoading(false);
      }
    };    
    
  

  const commonInputStyles =
    "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5caaab]";

  const renderForm = () => {
    const activeTab = tabs[activeTabIndex];

    return (
      <>
      {activeTab === "Project Details" && (
          <ProjectDetailsForm
          formData={projectDetails}
          setFormData={setProjectDetails}
          activeTab={activeTab}
          handleSubmitProjectDetails={handleSubmitProjectDetails}
        />
          )}

          {activeTab === "Professional Details" && (
            <ProjectProfessionalDetailsForm
            formData={projectProfessionalDetails}
            setFormData={setProjectProfessionalDetails}
            activeTab={activeTab}
            handleSubmitProjectProfessionalDetails={handleSubmitProjectProfessionalDetails}
          />
          )}

          {activeTab === "Unit Details" && (
            <ProjectDetailsForm
            formData={projectDetails}
            setFormData={setProjectDetails}
            activeTab={activeTab}
            handleSubmitProjectDetails={handleSubmitProjectDetails}
          />
          )}

          {activeTab === "Documents" && (
             <ProjectDetailsForm
             formData={projectDetails}
             setFormData={setProjectDetails}
             activeTab={activeTab}
             handleSubmitProjectDetails={handleSubmitProjectDetails}
           />
          )}

          {activeTab === "Project Progress" && (
             <ProjectDetailsForm
             formData={projectDetails}
             setFormData={setProjectDetails}
             activeTab={activeTab}
             handleSubmitProjectDetails={handleSubmitProjectDetails}
           />
          )}</>
    );
  };

  return (
    <div className="min-h-screen p-8 pt-3">
      <div className="flex items-center justify-between mb-6 pl-6">
        <div className="flex items-center gap-2">
          <FaArrowLeft className="text-[#2F4C92] text-3xl cursor-pointer" onClick={handleBack} />
          <h1 className="text-[24px] font-bold text-[#2F4C92]">Add {tabs[activeTabIndex]}</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-medium">Admin Name</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <div className="w-10 h-10 bg-[#C2C2FF] rounded-full" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 bg-white rounded-md w-fit border-b-2 border-[#5caaab] mb-6">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTabIndex(index)}
            className={`py-2 px-5 rounded-t-md font-medium transition duration-200 ${
              activeTabIndex === index
                ? "text-white border-0 border-b-0  bg-[#5caaab] font-bold border-[#5caaab]"
                : "text-gray-500 hover:text-[#5caaab]"
            }`}
          >
            {tab} 
          </button>
        ))}
      </div>

      {/* Form */}
      {renderForm()}
    </div>
  );
};

export default AddProject;
