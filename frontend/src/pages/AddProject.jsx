import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

const AddProject = ({forUpdate = false, viewOnly=false}) => {

  const {id} = useParams()

  const [isUnitDetailsFormActive, setIsUnitDetailsFormActive] = useState(false)

  const [projectId, setProjectId] = useState(id || null)

    const navigate = useNavigate();
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [projectDetails, setProjectDetails] = useState({
      channel_partner_id: null,
      promoter_id: '',
      promoter_name: "",
      project_name: "",
      project_type: "",
      project_address: "",
      project_pincode: '',
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
      project_id: projectId,
      engineer_id: '',
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
      architect_id: '',
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
      ca_id: '',
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
      project_id: projectId,
      
      // Unit Details
      unit_name: "",
      unit_type: "",
      carpet_area: '',
      unit_status: "",
      
      // Customer Details
      customer_name: "",
      agreement_value: '',
      agreement_or_sale_deed_date: "",
      
      // Financial Year Received Amounts
      received_fy_2018_19: '',
      received_fy_2019_20: '',
      received_fy_2020_21: '',
      received_fy_2021_22: '',
      received_fy_2022_23: '',
      received_fy_2023_24: '',
      received_fy_2024_25: '',
      received_fy_2025_26: '',
      received_fy_2026_27: '',
      received_fy_2027_28: '',
      received_fy_2028_29: '',
      received_fy_2029_30: '',
      
      // Aggregated Financials
      total_received: '',
      balance_amount: '', // Example: agreement_value - total_received
      
      // Documents
      afs_uploaded_url: "",
      sale_deed_uploaded_url: "",
      
    })

    const [projectDocuments,setProjectDocuments] = useState({
      project_id: projectId, // must match a valid project ID

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
      project_id: projectId,
    
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
      project_id: projectId,
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

    useEffect(() => {
      const fetchAllProjectData = async () => {
        if (!id) return;
    
        // 1. Project Details
        try {
          const project = await databaseService.getProjectById(id);
          console.log("✅ Project Response:", project);
          setProjectDetails(project);
          toast.success("✅ Project details loaded!");
        } catch (error) {
          console.error("❌ Error loading project details:", error);
          toast.error(`❌ Failed to load project details: ${error.message}`);
        }
    
        // 2. Project Professionals
        try {
          const professionals = await databaseService.getProjectProfessionalData(id);
          console.log("✅ Professional Data Response:", professionals);
          setProjectProfessionalDetails({
            project_id: professionals.project_id,
            engineer_id: professionals.engineer_id,
            engineer: {
              name: professionals.engineers.name,
              contact_number: professionals.engineers.contact_number,
              email_id: professionals.engineers.email_id,
              office_address: professionals.engineers.office_address,
              licence_number: professionals.engineers.licence_number,
              licence_uploaded_url: professionals.engineers.licence_uploaded_url,
              pan_number: professionals.engineers.pan_number,
              pan_uploaded_url: professionals.engineers.pan_uploaded_url,
              letter_head_uploaded_url: professionals.engineers.letter_head_uploaded_url,
              sign_stamp_uploaded_url: professionals.engineers.sign_stamp_uploaded_url
            },
            architect_id: professionals.architect_id,
            architect: {
              name: professionals.architects.name,
              contact_number: professionals.architects.contact_number,
              email_id: professionals.architects.email_id,
              office_address: professionals.architects.office_address,
              licence_number: professionals.architects.licence_number,
              licence_uploaded_url: professionals.architects.licence_uploaded_url,
              pan_number: professionals.architects.pan_number,
              pan_uploaded_url: professionals.architects.pan_uploaded_url,
              letter_head_uploaded_url: professionals.architects.letter_head_uploaded_url,
              sign_stamp_uploaded_url: professionals.architects.sign_stamp_uploaded_url
            },
            ca_id: professionals.ca_id,
            ca: {
              name: professionals.cas.name,
              contact_number: professionals.cas.contact_number,
              email_id: professionals.cas.email_id,
              office_address: professionals.cas.office_address,
              licence_number: professionals.cas.licence_number,
              licence_uploaded_url: professionals.cas.licence_uploaded_url,
              pan_number: professionals.cas.pan_number,
              pan_uploaded_url: professionals.cas.pan_uploaded_url,
              letter_head_uploaded_url: professionals.cas.letter_head_uploaded_url,
              sign_stamp_uploaded_url: professionals.cas.sign_stamp_uploaded_url
            }
          });
          toast.success("✅ Project professionals loaded!");
        } catch (error) {
          console.error("❌ Error loading project professionals:", error);
          toast.error(`❌ Failed to load project professionals: ${error.message}`);
        }
    
        // 3. Project Documents
        try {
          const documents = await databaseService.getProjectDocuments(id);
          console.log("✅ Documents Response:", documents);
          setProjectDocuments({
            project_id: documents.project_id, // Set project_id from the fetched data
            cc_uploaded_url: documents.cc_uploaded_url,
            plan_uploaded_url: documents.plan_uploaded_url,
            search_report_uploaded_url: documents.search_report_uploaded_url,
            da_uploaded_url: documents.da_uploaded_url,
            pa_uploaded_url: documents.pa_uploaded_url,
            satbara_uploaded_url: documents.satbara_uploaded_url,
            promoter_letter_head_uploaded_url: documents.promoter_letter_head_uploaded_url,
            promoter_sign_stamp_uploaded_url: documents.promoter_sign_stamp_uploaded_url,
          });
          toast.success("✅ Project documents loaded!");
        } catch (error) {
          console.error("❌ Error loading project documents:", error);
          toast.error(`❌ Failed to load project documents: ${error.message}`);
        }
    
        // 4. Site Progress
        try {
          const progress = await databaseService.getProjectSiteProgress(id);
          console.log("✅ Site Progress Response:", progress);
              // Set building progress
              setProjectBuildingProgress((prevState) => {
                const updatedProgress = Object.keys(prevState).reduce((acc, key) => {
                  if (key === 'project_id') {
                    acc[key] = prevState[key]; // retain the existing project_id
                  } else {
                    acc[key] = progress[key] ?? prevState[key];
                  }
                  return acc;
                }, {});
                return updatedProgress;
              });
              

          // Set common area progress
          setProjectCommonAreasProgress((prevState) => {
            const updatedProgress = { project_id: prevState.project_id };
          
            Object.keys(prevState).forEach((key) => {
              if (key !== 'project_id') {
                const obj = progress[key];
          
                updatedProgress[key] = {
                  proposed: obj?.proposed ?? false,
                  percentage_of_work: obj?.percentage_of_work ?? 0,
                  details: obj?.details ?? '',
                };
              }
            });
          
            return updatedProgress;
          });
                   
          toast.success("✅ Site progress loaded!");
        } catch (error) {
          console.error("❌ Error loading site progress:", error);
          toast.error(`❌ Failed to load site progress: ${error.message}`);
        }
      };
    
      fetchAllProjectData();
    }, [id]);
    
    
    const [engineerOptions, setEngineerOptions] = useState([]);
    const [architectOptions, setArchitectOptions] = useState([]);
    const [casOptions, setCAsOptions] = useState([]);
    
    useEffect(() => {
      if (!viewOnly) {
        const mapToOptions = (data) =>
          data.map((item) => ({
            label: item.name || `ID ${item.id}`,
            value: item.id,
          }));
    
        async function fetchOptions() {
          try {
            const engineers = await databaseService.getAllEngineers();
            setEngineerOptions(mapToOptions(engineers));
          } catch (error) {
            console.error("Error fetching engineers:", error);
          }
    
          try {
            const architects = await databaseService.getAllArchitects();
            setArchitectOptions(mapToOptions(architects));
          } catch (error) {
            console.error("Error fetching architects:", error);
          }
    
          try {
            const cas = await databaseService.getAllCAs();
            setCAsOptions(mapToOptions(cas));
          } catch (error) {
            console.error("Error fetching CAs:", error);
          }
        }
    
        fetchOptions();
      }
    }, [id]);
    
    
  
    const handleBack = () => {
      if(activeTabIndex < 1) {
        navigate(-1);
        return
      }
      setActiveTabIndex(p => p-1)
    };

    const handleSubmitProjectDetails = async () => {
      console.log("Form Data Submitted:", projectDetails);
      // setLoading(true);
    
      try {
        if (forUpdate && id) {
          const response = await databaseService.updateProjectDetails(id, projectDetails);
          console.log("✏️ Project details updated:", response);
    
          toast.success("✅ Project details updated successfully!");
        } else {
          const response = await databaseService.uploadProjectDetails(projectDetails);
          console.log("✅ Project details uploaded:", response);
    
          // Extract and set project ID
          const newProjectId = response?.data?.[0]?.id;
          if (newProjectId) {
            setProjectId(newProjectId);
            console.log("🆔 Project ID set to:", newProjectId);
          }
    
          toast.success("✅ Project details submitted successfully!");
        }
    
        // Common reset after submission
        setProjectDetails(prev => resetObjectData(prev));
        setActiveTabIndex(1);
      } catch (error) {
        console.error("❌ Error submitting/updating project details:", error);
        toast.error(`❌ Failed: ${error.message}`);
      } finally {
        // setLoading(false);
      }
    };    
    
    const handleSubmitProjectProfessionalDetails = async () => {
      // console.log("Form Data Submitted:", projectProfessionalDetails);
      // setLoading(true);
      try {
        const response = await databaseService.uploadProjectProfessionalDetails({...projectProfessionalDetails, project_id: projectId});
        console.log("✅ Project professional details uploaded:", response);
        toast.success("✅ Project professional details submitted successfully!");
        setProjectProfessionalDetails(prev => resetObjectData(prev));
        navigate("/projects"); // 👈 Update the route if needed
      } catch (error) {
        console.error("❌ Error submitting project professional details:", error);
        toast.error(`❌ Failed to submit professional details: ${error.message}`);
      } finally {
        // setLoading(false);
      }
    };   
     
    const handleSubmitProjectUnit = async () => {
      console.log(projectUnit);
      
      try {
        const response = await databaseService.uploadProjectUnitDetails(projectUnit);
        console.log("✅ Project unit details uploaded:", response);
        toast.success("✅ Unit details submitted successfully!");
        setProjectUnit(prev => resetObjectData(prev));
        setIsUnitDetailsFormActive(false); // Optional: disable unit form after submission
      } catch (error) {
        console.error("❌ Error submitting unit details:", error);
        toast.error(`❌ Failed to submit unit details: ${error.message}`);
      }
    };

    const handleUpdateProjectUnit = async (id) => {
      console.log("🔄 Updating unit with ID:", id);
      console.log(projectUnit);
    
      try {
        const response = await databaseService.updateProjectUnitDetails(id, projectUnit);
        console.log("✅ Project unit details updated:", response);
        toast.success("✅ Unit details updated successfully!");
        setProjectUnit(prev => resetObjectData(prev));
        setIsUnitDetailsFormActive(false); // Optional: hide the form after update

        return true
      } catch (error) {
        console.error("❌ Error updating unit details:", error);
        toast.error(`❌ Failed to update unit details: ${error.message}`);
        return false
      }
    };
    
    
    const handleSubmitProjectDocuments = async () => {
      try {
        const response = await databaseService.uploadProjectDocuments(projectDocuments);
        console.log("✅ Project documents uploaded:", response);
        toast.success("✅ Documents submitted successfully!");
        setProjectDocuments(prev => resetObjectData(prev));
      } catch (error) {
        console.error("❌ Error submitting documents:", error);
        toast.error(`❌ Failed to submit documents: ${error.message}`);
      }
    };
    
    const handleSubmitProjectBuildingProgress = async () => {
      try {
        const response = await databaseService.uploadProjectBuildingProgress(projectBuildingProgress);
        console.log("✅ Building progress uploaded:", response);
        toast.success("✅ Building progress submitted successfully!");
        setProjectBuildingProgress(prev => resetObjectData(prev));
      } catch (error) {
        console.error("❌ Error submitting building progress:", error);
        toast.error(`❌ Failed to submit building progress: ${error.message}`);
      }
    };
    
    const handleSubmitProjectCommonAreasProgresss = async () => {
      try {
        const response = await databaseService.uploadProjectCommonAreasProgress(projectCommonAreasProgress);
        console.log("✅ Common areas progress uploaded:", response);
        toast.success("✅ Common areas progress submitted successfully!");
        setProjectCommonAreasProgress(prev => resetObjectData(prev));
      } catch (error) {
        console.error("❌ Error submitting common areas progress:", error);
        toast.error(`❌ Failed to submit common areas progress: ${error.message}`);
      }
    };    

    function resetObjectData(obj) {
      if (Array.isArray(obj)) return [];
    
      const clearedObj = {};
    
      for (const key in obj) {
        const value = obj[key];
    
        // Skip resetting 'project_id'
        if (key === 'project_id') {
          clearedObj[key] = value;
          continue;
        }
    
        if (typeof value === "string") {
          clearedObj[key] = "";
        } else if (typeof value === "number") {
          clearedObj[key] = '';
        } else if (typeof value === "boolean") {
          clearedObj[key] = false;
        } else if (Array.isArray(value)) {
          clearedObj[key] = [];
        } else if (typeof value === "object" && value !== null) {
          clearedObj[key] = resetObjectData(value); // recursively clear nested objects
        } else {
          clearedObj[key] = value; // keep other types as-is (like null, undefined)
        }
      }
    
      return clearedObj;
    }
    
    
  

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
          projectId={projectId}
          disabled={viewOnly}
          handleSubmitProjectDetails={handleSubmitProjectDetails}
        />
          )}

          {activeTab === "Professional Details" && (
            <ProjectProfessionalDetailsForm
            formData={projectProfessionalDetails}
            setFormData={setProjectProfessionalDetails}
            activeTab={activeTab}
            projectId={projectId}
            disabled={viewOnly}
            handleSubmitProjectProfessionalDetails={handleSubmitProjectProfessionalDetails}

            engineerOptions={engineerOptions}
            architectOptions={architectOptions}
            casOptions={casOptions}
          />
          )}

          {activeTab === "Unit Details" && (
           <UnitDetails 
           isUnitDetailsFormActive={isUnitDetailsFormActive}
           setIsUnitDetailsFormActive={setIsUnitDetailsFormActive}
           formData={projectUnit}
            setFormData={setProjectUnit}
            activeTab={activeTab}
            projectId={projectId}
            disabled={viewOnly}
            handleSubmitProjectUnit={handleSubmitProjectUnit}
            handleUpdateProjectUnit={handleUpdateProjectUnit}
           />
          )}

          {activeTab === "Documents" && (
             <ProjectDocumentForm
             formData={projectDocuments}
             setFormData={setProjectDocuments}
             activeTab={activeTab}
             projectId={projectId}
             disabled={viewOnly}
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
             projectId={projectId}
             disabled={viewOnly}
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
