import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa6';
import { FaFilePdf, FaTimes } from "react-icons/fa";
import {
    ProjectDetailsForm,
    ProjectProfessionalDetailsForm,
    UnitDetails,
    ProjectDocumentForm,
    ProjectProgresssForm,
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

  const [isUnitDetailsFormActive, setIsUnitDetailsFormActive] = useState(false)

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
      project_id: 7,
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

    const [projectUnit, setProjectUnit] = useState({
      id: 1,
      project_id: 7,
      
      // Unit Details
      unit_name: "",
      unit_type: "",
      carpet_area: 0,
      unit_status: "",
      
      // Customer Details
      customer_name: "",
      agreement_value: '',
      agreement_or_sale_deed_date: "",
      
      // Financial Year Received Amounts
      received_fy_2018_19: 0,
      received_fy_2019_20: 0,
      received_fy_2020_21: 0,
      received_fy_2021_22: 0,
      received_fy_2022_23: 0,
      received_fy_2023_24: 0,
      received_fy_2024_25: 0,
      received_fy_2025_26: 0,
      received_fy_2026_27: 0,
      received_fy_2027_28: 0,
      received_fy_2028_29: 0,
      received_fy_2029_30: 0,
      
      // Aggregated Financials
      total_received: 0,
      balance_amount: 0, // Example: agreement_value - total_received
      
      // Documents
      afs_uploaded_url: "",
      sale_deed_uploaded_url: "",
      
    })

    const [projectDocuments,setProjectDocuments] = useState({
      project_id: 7, // must match a valid project ID

      // Document URLs
      cc_uploaded_url: "",
      plan_uploaded_url: "",
      search_report_uploaded_url: "",
      da_uploaded_url: "",
      pa_uploaded_url: "",
      satbara_uploaded_url: "",
      promoter_letter_head_uploaded_url: "",
      promoter_sign_stamp_uploaded_url: "",
    })

    const [projectBuildingProgress,setProjectBuildingProgress] = useState({
      project_id: 7,
    
      excavation: 0,
      basement: 0,
      podium: 0,
      plinth: 0,
      stilt: 0,
      superstructure: 0,
      interior_finishing: 0,
      sanitary_fittings: 0,
      common_infrastructure: 0,
      external_works: 0,
      final_installations: 0,
    })

    const [projectCommonAreasProgress, setProjectCommonAreasProgress] = useState({
      project_id: 7,
      internal_roads_footpaths: {
        proposed: false,
        percentage_of_work: 0,
        details: '',
      },
      water_supply: {
        proposed: false,
        percentage_of_work: 0,
        details: '',
      },
      sewerage: {
        proposed: false,
        percentage_of_work: 0,
        details: '',
      },
      storm_water_drains: {
        proposed: false,
        percentage_of_work: 0,
        details: '',
      },
      landscaping_tree_planting: {
        proposed: false,
        percentage_of_work: 0,
        details: '',
      },
      street_lighting: {
        proposed: false,
        percentage_of_work: 0,
        details: '',
      },
      community_buildings: {
        proposed: false,
        percentage_of_work: 0,
        details: '',
      },
      sewage_treatment: {
        proposed: false,
        percentage_of_work: 0,
        details: '',
      },
      solid_waste_management: {
        proposed: false,
        percentage_of_work: 0,
        details: '',
      },
      rain_water_harvesting: {
        proposed: false,
        percentage_of_work: 0,
        details: '',
      },
      energy_management: {
        proposed: false,
        percentage_of_work: 0,
        details: '',
      },
      fire_safety: {
        proposed: false,
        percentage_of_work: 0,
        details: '',
      },
      electrical_metering: {
        proposed: false,
        percentage_of_work: 0,
        details: '',
      },
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
     
    const handleSubmitProjectUnit = async () => {
      console.log("Form Data Submitted:", projectUnit);
      // setLoading(true);
      // try {
      //   const response = await databaseService.uploadProjectProfessionalDetails(projectProfessionalDetails);
      //   console.log("✅ Project professional details uploaded:", response);
      //   toast.success("✅ Project professional details submitted successfully!");
      //   navigate("/projects"); // 👈 Update the route if needed
      // } catch (error) {
      //   console.error("❌ Error submitting project professional details:", error);
      //   toast.error(`❌ Failed to submit professional details: ${error.message}`);
      // } finally {
      //   // setLoading(false);
      // }
      setIsUnitDetailsFormActive(false)
    };   
    const handleSubmitProjectDocuments = async () => {
      console.log("Form Data Submitted:", projectDocuments);
      // setLoading(true);
      // try {
      //   const response = await databaseService.uploadProjectProfessionalDetails(projectProfessionalDetails);
      //   console.log("✅ Project professional details uploaded:", response);
      //   toast.success("✅ Project professional details submitted successfully!");
      //   navigate("/projects"); // 👈 Update the route if needed
      // } catch (error) {
      //   console.error("❌ Error submitting project professional details:", error);
      //   toast.error(`❌ Failed to submit professional details: ${error.message}`);
      // } finally {
      //   // setLoading(false);
      // }
    };   
    const handleSubmitProjectBuildingProgress = async () => {
      console.log("Form Data Submitted:", projectBuildingProgress);
      // setLoading(true);
      // try {
      //   const response = await databaseService.uploadProjectProfessionalDetails(projectProfessionalDetails);
      //   console.log("✅ Project professional details uploaded:", response);
      //   toast.success("✅ Project professional details submitted successfully!");
      //   navigate("/projects"); // 👈 Update the route if needed
      // } catch (error) {
      //   console.error("❌ Error submitting project professional details:", error);
      //   toast.error(`❌ Failed to submit professional details: ${error.message}`);
      // } finally {
      //   // setLoading(false);
      // }
    };   
    const handleSubmitProjectCommonAreasProgresss = async () => {
      console.log("Form Data Submitted:", projectCommonAreasProgress);
      // setLoading(true);
      // try {
      //   const response = await databaseService.uploadProjectProfessionalDetails(projectProfessionalDetails);
      //   console.log("✅ Project professional details uploaded:", response);
      //   toast.success("✅ Project professional details submitted successfully!");
      //   navigate("/projects"); // 👈 Update the route if needed
      // } catch (error) {
      //   console.error("❌ Error submitting project professional details:", error);
      //   toast.error(`❌ Failed to submit professional details: ${error.message}`);
      // } finally {
      //   // setLoading(false);
      // }
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
           <UnitDetails 
           isUnitDetailsFormActive={isUnitDetailsFormActive}
           setIsUnitDetailsFormActive={setIsUnitDetailsFormActive}
           formData={projectUnit}
            setFormData={setProjectUnit}
            activeTab={activeTab}
            handleSubmitProjectUnit={handleSubmitProjectUnit}
           />
          )}

          {activeTab === "Documents" && (
             <ProjectDocumentForm
             formData={projectDocuments}
             setFormData={setProjectDocuments}
             activeTab={activeTab}
             handleSubmitProjectDocuments={handleSubmitProjectDocuments}
           />
          )}

          {activeTab === "Project Progress" && (
             <ProjectProgresssForm
             projectBuildingProgress={projectBuildingProgress}
             projectCommonAreasProgress={projectCommonAreasProgress}
             setProjectBuildingProgress={setProjectBuildingProgress}
             setProjectCommonAreasProgress={setProjectCommonAreasProgress}
             activeTab={activeTab}
             handleSubmitProjectBuildingProgress={handleSubmitProjectBuildingProgress}
             handleSubmitProjectCommonAreasProgresss={handleSubmitProjectCommonAreasProgresss}
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
