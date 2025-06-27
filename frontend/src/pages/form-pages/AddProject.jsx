
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaFilePdf, FaTimes, FaSpinner } from "react-icons/fa";
import {
  ProjectDetailsForm,
  ProjectProfessionalDetailsForm,
  UnitDetails,
  ProjectDocumentForm,
  ProjectProgresssForm,
  UserProfile,
} from "../../components/index.js";
import databaseService from "../../backend-services/database/database";
import { toast } from "react-toastify";
import { validateFormDataForProject } from "../../components/forms/validateFormDataForProject.jsx";
import { useSelector } from "react-redux";
import { User } from "lucide-react";

const tabs = [
  "Project Details",
  "Professional Details",
  "Unit Details",
  "Documents",
  "Project Progress",
];

const AddProject = ({ forUpdate = false, viewOnly = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const userData = useSelector((state) => state.auth.userData);
  
  const [loading, setLoading] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isUnitDetailsFormActive, setIsUnitDetailsFormActive] = useState(false);
  const [projectId, setProjectId] = useState(id || null);
  
  // Form states
  const [prevProjectDetails, setPrevProjectDetails] = useState({})
  const [projectDetails, setProjectDetails] = useState({
    channel_partner_id: null,
    promoter_id: "",
    promoter_name: "",
    project_name: "",
    project_type: "",
    project_address: "",
    project_pincode: "",
    login_id: "",
    password: "",
    district: "",
    city: "",
    rera_number: "",
    rera_certificate_uploaded_url: "",
    registration_date: "",
    expiry_date: "",
  });
  
  const [prevProjectProfessionalDetails, setPrevProjectProfessionalDetails] = useState({})
  const [projectProfessionalDetails, setProjectProfessionalDetails] = useState({
    project_id: projectId,
    engineer_id: "",
    architect_id: "",
    ca_id: "",
  });

  const [engineerData, setEngineerData] = useState({
    name: "",
    contact_number: "",
    email_id: "",
    office_address: "",
    licence_number: "",
    licence_uploaded_url: "",
    pan_number: "",
    pan_uploaded_url: "",
    letter_head_uploaded_url: "",
    sign_stamp_uploaded_url: "",
  });

  const [architectData, setArchitectData] = useState({
    name: "",
    contact_number: "",
    email_id: "",
    office_address: "",
    licence_number: "",
    licence_uploaded_url: "",
    pan_number: "",
    pan_uploaded_url: "",
    letter_head_uploaded_url: "",
    sign_stamp_uploaded_url: "",
  });

  const [caData, setCAData] = useState({
    name: "",
    contact_number: "",
    email_id: "",
    office_address: "",
    licence_number: "",
    licence_uploaded_url: "",
    pan_number: "",
    pan_uploaded_url: "",
    letter_head_uploaded_url: "",
    sign_stamp_uploaded_url: "",
  });

  const [prevProjectUnitDetails, setPrevProjectUnitDetails] = useState({})
  const [projectUnit, setProjectUnit] = useState({
    id: 1,
    project_id: projectId,
    // Unit Details
    unit_name: "",
    unit_type: "",
    carpet_area: "",
    unit_status: "",
    // Customer Details
    customer_name: "",
    agreement_value: "",
    agreement_for_sale_date: "",
    sale_deed_date: "",
    // Financial Year Received Amounts
    received_fy_2018_19: "",
    received_fy_2019_20: "",
    received_fy_2020_21: "",
    received_fy_2021_22: "",
    received_fy_2022_23: "",
    received_fy_2023_24: "",
    received_fy_2024_25: "",
    received_fy_2025_26: "",
    received_fy_2026_27: "",
    received_fy_2027_28: "",
    received_fy_2028_29: "",
    received_fy_2029_30: "",
    // Aggregated Financials
    total_received: "",
    balance_amount: "",
    // Documents
    afs_uploaded_url: "",
    sale_deed_uploaded_url: "",
  });

  const [prevProjectDocuments, setPrevProjectDocuments] = useState({})
  const [projectDocuments, setProjectDocuments] = useState({
    project_id: projectId,
    cc_uploaded_url: "",
    plan_uploaded_url: "",
    search_report_uploaded_url: "",
    da_uploaded_url: "",
    pa_uploaded_url: "",
    satbara_uploaded_url: "",
    promoter_letter_head_uploaded_url: "",
    promoter_sign_stamp_uploaded_url: "",
  });

  const [prevProjectBuildingProgress, setPrevProjectBuildingProgress] = useState({})
  const [projectBuildingProgress, setProjectBuildingProgress] = useState({
    project_id: projectId,
    excavation: "",
    basement: "",
    podium: "",
    plinth: "",
    stilt: "",
    superstructure: "",
    interior_finishing: "",
    sanitary_fittings: "",
    common_infrastructure: "",
    external_works: "",
    final_installations: "",
  });

  const initialCommonAreaItem = {
    proposed: false,
    percentage_of_work: "",
    details: "",
  };

  const [prevProjectCommonAreasProgress, setPrevProjectCommonAreasProgress] = useState({
    project_id: projectId,
    internal_roads_footpaths: {...initialCommonAreaItem},
    water_supply: {...initialCommonAreaItem},
    sewerage: {...initialCommonAreaItem},
    storm_water_drains: {...initialCommonAreaItem},
    landscaping_tree_planting: {...initialCommonAreaItem},
    street_lighting: {...initialCommonAreaItem},
    community_buildings: {...initialCommonAreaItem},
    sewage_treatment: {...initialCommonAreaItem},
    solid_waste_management: {...initialCommonAreaItem},
    rain_water_harvesting: {...initialCommonAreaItem},
    energy_management: {...initialCommonAreaItem},
    fire_safety: {...initialCommonAreaItem},
    electrical_metering: {...initialCommonAreaItem},
  })
  const [projectCommonAreasProgress, setProjectCommonAreasProgress] = useState({
    project_id: projectId,
    internal_roads_footpaths: {...initialCommonAreaItem},
    water_supply: {...initialCommonAreaItem},
    sewerage: {...initialCommonAreaItem},
    storm_water_drains: {...initialCommonAreaItem},
    landscaping_tree_planting: {...initialCommonAreaItem},
    street_lighting: {...initialCommonAreaItem},
    community_buildings: {...initialCommonAreaItem},
    sewage_treatment: {...initialCommonAreaItem},
    solid_waste_management: {...initialCommonAreaItem},
    rain_water_harvesting: {...initialCommonAreaItem},
    energy_management: {...initialCommonAreaItem},
    fire_safety: {...initialCommonAreaItem},
    electrical_metering: {...initialCommonAreaItem},
  });

  const [engineerOptions, setEngineerOptions] = useState([]);
  const [architectOptions, setArchitectOptions] = useState([]);
  const [casOptions, setCAsOptions] = useState([]);

  // Helper function to reset object data
  const resetObjectData = useCallback((obj) => {
    if (Array.isArray(obj)) return [];

    const clearedObj = {};
    for (const key in obj) {
      const value = obj[key];

      // Skip resetting 'project_id'
      if (key === "project_id") {
        clearedObj[key] = value;
        continue;
      }

      if (typeof value === "string") {
        clearedObj[key] = "";
      } else if (typeof value === "number") {
        clearedObj[key] = "";
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
  }, []);

  // Helper to get current timestamp in IST
  const getCurrentISTTimestamp = () => {
    const date = new Date();
    return new Date(date.getTime() + 5.5 * 60 * 60 * 1000)
      .toISOString()
      .replace("Z", "+05:30");
  };

  // Update project IDs when projectId changes
  useEffect(() => {
    if (projectId) {
      const updateProjectId = (setter) => {
        setter(prev => ({...prev, project_id: projectId}));
      };
      
      updateProjectId(setProjectCommonAreasProgress);
      updateProjectId(setProjectBuildingProgress);
      updateProjectId(setProjectDocuments);
      updateProjectId(setProjectUnit);
      updateProjectId(setProjectProfessionalDetails);
    }
  }, [projectId]);

  // Fetch project data when id changes
  useEffect(() => {
    if (!id) return;

    const fetchAllProjectData = async () => {
      // 1. Project Details
      try {
        const project = await databaseService.getProjectById(id);
        setPrevProjectDetails(project)
        setProjectDetails(project);
        // console.log("Project Details:", project);
        
      } catch (error) {
        console.error("❌ Error loading project details:", error);
        // toast.error(`❌ Failed to load project details: ${error.message}`);
      }

      // 2. Project Professionals
      try {
        const professionals = await databaseService.getProjectProfessionalData(id);
        // console.log(professionals);
        
        setProjectProfessionalDetails({
          project_id: professionals.project_id,
          engineer_id: professionals.engineer_id,
          architect_id: professionals.architect_id,
          ca_id: professionals.ca_id,
          updated_at: professionals.updated_at,
          updated_by: professionals.updated_by,
          updated_user: professionals.updated_user,
          update_action:professionals.update_action,
        });
        setPrevProjectProfessionalDetails({
          project_id: professionals.project_id,
          engineer_id: professionals.engineer_id,
          architect_id: professionals.architect_id,
          ca_id: professionals.ca_id,
          updated_at: professionals.updated_at,
          updated_by: professionals.updated_by,
          updated_user: professionals.updated_user,
          update_action:professionals.update_action,
        });

        if (viewOnly && professionals) {
          if (professionals.engineers) {
            setEngineerData(professionals.engineers);
          }
          if (professionals.architects) {
            setArchitectData(professionals.architects);
          }
          if (professionals.cas) {
            setCAData(professionals.cas);
          }
        }
      } catch (error) {
        console.error("❌ Error loading project professionals:", error);
        // toast.error(`❌ Failed to load project professionals: ${error.message}`);
      }

      // 3. Project Documents
      try {
        const documents = await databaseService.getProjectDocuments(id);
        // console.log(documents);
        
        setPrevProjectDocuments({
          project_id: documents.project_id,
          cc_uploaded_url: documents.cc_uploaded_url,
          plan_uploaded_url: documents.plan_uploaded_url,
          search_report_uploaded_url: documents.search_report_uploaded_url,
          da_uploaded_url: documents.da_uploaded_url,
          pa_uploaded_url: documents.pa_uploaded_url,
          satbara_uploaded_url: documents.satbara_uploaded_url,
          promoter_letter_head_uploaded_url: documents.promoter_letter_head_uploaded_url,
          promoter_sign_stamp_uploaded_url: documents.promoter_sign_stamp_uploaded_url,
          updated_at: documents.updated_at,
          updated_by: documents.updated_by,
          updated_user: documents.updated_user,
          update_action:documents.update_action,
        });
        setProjectDocuments({
          project_id: documents.project_id,
          cc_uploaded_url: documents.cc_uploaded_url,
          plan_uploaded_url: documents.plan_uploaded_url,
          search_report_uploaded_url: documents.search_report_uploaded_url,
          da_uploaded_url: documents.da_uploaded_url,
          pa_uploaded_url: documents.pa_uploaded_url,
          satbara_uploaded_url: documents.satbara_uploaded_url,
          promoter_letter_head_uploaded_url: documents.promoter_letter_head_uploaded_url,
          promoter_sign_stamp_uploaded_url: documents.promoter_sign_stamp_uploaded_url,
          updated_at: documents.updated_at,
          updated_by: documents.updated_by,
          updated_user: documents.updated_user,
          update_action:documents.update_action,
        });
      } catch (error) {
        console.error("❌ Error loading project documents:", error);
      }

      // 4. Site Progress
      try {
        const progress = await databaseService.getProjectSiteProgress(id);

        // console.log(progress);
        
        
        // Set Building Progress (if available)
        if (progress.buildingProgress) {
          setProjectBuildingProgress(prev => ({...prev, ...progress.buildingProgress}));
          setPrevProjectBuildingProgress(prev => ({...prev, ...progress.buildingProgress}));
        }

        // Set Common Area Progress (if available)
        if (progress.commonAreasProgress) {
          setPrevProjectCommonAreasProgress(prev => {
            const updatedProgress = {
              project_id: prev.project_id,
              updated_at: progress.commonAreasProgress.updated_at || "",
              updated_by: progress.commonAreasProgress.updated_by,
              updated_user: progress.commonAreasProgress.updated_user,
              update_action: progress.commonAreasProgress.update_action,
            };

            Object.keys(prev).forEach(key => {
              if (key !== "project_id" && key !== "updated_at" && key !== "updated_by" && key !== "updated_user" && key !== "update_action") {
                const areaData = progress.commonAreasProgress[key];
                updatedProgress[key] = {
                  proposed: areaData?.proposed ?? false,
                  percentage_of_work: areaData?.percentage_of_work ?? "",
                  details: areaData?.details ?? "",
                };
              }
            });

            return updatedProgress;
          });
          setProjectCommonAreasProgress(prev => {
            const updatedProgress = {
              project_id: prev.project_id,
              updated_at: progress.commonAreasProgress.updated_at || "",
              updated_by: progress.commonAreasProgress.updated_by,
              updated_user: progress.commonAreasProgress.updated_user,
              update_action: progress.commonAreasProgress.update_action,
            };

            Object.keys(prev).forEach(key => {
              if (key !== "project_id" && key !== "updated_at" && key !== "updated_by" && key !== "updated_user" && key !== "update_action") {
                const areaData = progress.commonAreasProgress[key];
                updatedProgress[key] = {
                  proposed: areaData?.proposed ?? false,
                  percentage_of_work: areaData?.percentage_of_work ?? "",
                  details: areaData?.details ?? "",
                };
              }
            });

            return updatedProgress;
          });
        }
      } catch (error) {
        console.error("❌ Error loading site progress:", error);
      }
    };

    fetchAllProjectData();
  }, [id, viewOnly]);

  // Fetch professional options
  useEffect(() => {
    if (viewOnly) return;

    const mapToOptions = data => data.map(item => ({
      label: item.name || `ID ${item.id}`,
      value: item.id,
    }));

    const fetchOptions = async () => {
      try {
        setEngineerOptions(mapToOptions(await databaseService.getAllEngineers()));
        setArchitectOptions(mapToOptions(await databaseService.getAllArchitects()));
        setCAsOptions(mapToOptions(await databaseService.getAllCAs()));
      } catch (error) {
        console.error("Error fetching professional options:", error);
      }
    };

    fetchOptions();
  }, [viewOnly]);

  // Form submission handlers
  const handleBack = () => {
    if (activeTabIndex < 1) {
      navigate(-1);
      return;
    }
    setActiveTabIndex(prev => prev - 1);
  };

  const handleSubmitWithValidation = async (data, submitFn, successMsg, resetFn = null) => {
    setLoading(true);

    try {
      const isValid = validateFormDataForProject(data);
      if (!isValid) {
        setLoading(false);
        return false;
      }

      const response = await submitFn();
      
      // Only show toast if response indicates success or if it's not a "no changes" scenario
      if (response && (!response.message || response.message !== "No changes to update")) {
        toast.success(successMsg);
      }
      
      // Execute reset/callback function if provided
      if (resetFn && typeof resetFn === 'function') {
        resetFn();
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Error: ${error}`);
      toast.error(`❌ Failed: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProjectDetails = async () => {
    return handleSubmitWithValidation(
      projectDetails,
      async () => {
        if (forUpdate && id) {
          // UPDATE MODE - Project already exists
          let update_action = null;
          const changedFields = [];

          for (const key in projectDetails) {
            if (projectDetails[key] !== prevProjectDetails[key]) {
              changedFields.push(key);
            }
          }  

          if (changedFields.length === 0) {
            toast.info("ℹ️ No changes detected.");
            // Still move to next tab even if no changes
            setActiveTabIndex(1);
            return { success: true, message: "No changes to update" };
          } else {
            update_action = changedFields.join(', ');
            const response = await databaseService.updateProjectDetails(
              id, 
              { ...projectDetails, userId: userData?.id, update_action }
            );
            // Move to next tab after successful update
            setActiveTabIndex(1);
            return response;
          }
        } else {
          // CREATE MODE - New project
          const response = await databaseService.uploadProjectDetails(projectDetails, userData?.id);
          console.log("Response from uploadProjectDetails:", response);
          const newProjectId = response?.data?.id;
          
          if (newProjectId) {
            setProjectId(newProjectId);
            // Update URL to include the new project ID for future navigation
            window.history.replaceState({}, '', `/projects/${newProjectId}/edit`);
          }
          
          // Move to next tab after successful creation
          setActiveTabIndex(1);
          return response;
        }
      },
      forUpdate ? "✅ Project details updated successfully!" : "✅ Project details submitted successfully!"
    );
  };

  const handleSubmitProjectProfessionalDetails = async () => {
    return handleSubmitWithValidation(
      projectProfessionalDetails,
      async () => {
          let update_action = null;

          const changedFields = [];

          for (const key in projectProfessionalDetails) {
            if (projectProfessionalDetails[key] !== prevProjectProfessionalDetails[key]) {
              changedFields.push(key);
            }
          }  
          if (changedFields.length === 0) {
            toast.info("ℹ️ No changes detected.");
          } else{
            update_action = changedFields.join(', ');
            const response = await databaseService.uploadProjectProfessionalDetails({
            ...projectProfessionalDetails,
            project_id: projectId,
            userId: userData?.id,update_action
            });
            return response;
          }
      },
      "✅ Project professional details submitted successfully!",
      () => {
        setActiveTabIndex(prev => prev + 1);
      }
    );
  };

  const handleSubmitEngineer = async () => {
    return handleSubmitWithValidation(
      engineerData,
      async () => await databaseService.addEngineer(engineerData),
      "✅ Engineer details submitted successfully!",
      () => setEngineerData(prev => resetObjectData(prev))
    );
  };

  const handleSubmitArchitect = async () => {
    return handleSubmitWithValidation(
      architectData,
      async () => await databaseService.addArchitect(architectData),
      "✅ Architect details submitted successfully!",
      () => setArchitectData(prev => resetObjectData(prev))
    );
  };

  const handleSubmitCA = async () => {
    return handleSubmitWithValidation(
      caData,
      async () => await databaseService.addCA(caData),
      "✅ CA details submitted successfully!",
      () => setCAData(prev => resetObjectData(prev))
    );
  };

  const handleSubmitProjectUnit = async () => {
    console.log(userData);
    
    const unit = {...projectUnit,created_by: userData.id}
    return handleSubmitWithValidation(
      unit,
      async () => await databaseService.uploadProjectUnitDetails(unit),
      "✅ Unit details submitted successfully!",
      () => {
        setProjectUnit(prev => resetObjectData(prev));
        setIsUnitDetailsFormActive(false);
      }
    );
  };

const handleUpdateProjectUnit = async (id) => {
  try {
    // Get only the changed fields for efficient comparison
    const changedFields = getChangedFields(projectUnit, prevProjectUnitDetails);
    
    // Early return if no changes detected
    if (changedFields.length === 0) {
      toast.info("ℹ️ No changes detected.");
      setIsUnitDetailsFormActive(false);
      return;
    }
    
    // Create update payload with only necessary data
    const updatePayload = {
      ...projectUnit,
      updated_by: userData?.id,
      update_action: changedFields.join(', ')
    };
    
    // console.log("changedFields: ",changedFields.join(', '));
    
    // console.log('Update payload:', projectUnit);
    
    // Execute update with validation
    return await handleSubmitWithValidation(
      updatePayload,
      () => databaseService.updateProjectUnitDetails(id, updatePayload),
      "✅ Unit details updated successfully!",
      handleSuccessfulUpdate
    );
    
  } catch (error) {
    console.error('Error updating project unit:', error);
    toast.error("❌ Failed to update unit details.");
    throw error;
  }
};

// Helper function to identify changed fields
const getChangedFields = (current, previous) => {
  const changedFields = [];
  
  for (const [key, value] of Object.entries(current)) {
    if (value !== previous[key]) {
      changedFields.push(key);
    }
  }
  
  return changedFields;
};

// Success callback extracted for better readability
const handleSuccessfulUpdate = () => {
  setProjectUnit(prev => resetObjectData(prev));
  setIsUnitDetailsFormActive(false);
};

  const handleSubmitProjectDocuments = async () => {
          let update_action = null;

          const changedFields = [];

          for (const key in projectDocuments) {
            if (projectDocuments[key] !== prevProjectDocuments[key]) {
              changedFields.push(key);
            }
          }  
          if (changedFields.length === 0) {
            toast.info("ℹ️ No changes detected.");
            return setActiveTabIndex(prev => prev + 1)
          } else{
            const { updated_user, ...rest } = projectDocuments
            update_action = changedFields.join(', ');
                return handleSubmitWithValidation(
      rest,
      async () => await databaseService.uploadProjectDocuments({...rest,userId: userData?.id,update_action}),
      "✅ Documents submitted successfully!",
      () => setActiveTabIndex(prev => prev + 1)
    );
          }
  };

  const handleSubmitProjectBuildingProgress = async () => {

              let update_action = null;

          const changedFields = [];

          for (const key in projectBuildingProgress) {
            if ( key !== 'project_id' && projectBuildingProgress[key] !== prevProjectBuildingProgress[key]) {
              changedFields.push(key);
            }
          }  
          if (changedFields.length === 0) {
            toast.info("ℹ️ No changes detected.");
            return true
          } else{
            const { updated_user, ...rest } = projectBuildingProgress
            update_action = changedFields.join(', ');
    
    return handleSubmitWithValidation(
      projectBuildingProgress,
      async () => await databaseService.uploadProjectBuildingProgress({...rest,updated_by: userData?.id,update_action}),
      "✅ Building progress submitted successfully!"
    );
  }
  };

const handleSubmitProjectCommonAreasProgresss = async () => {
  try {
    // console.log("🔍 Debug: Starting handleSubmitProjectCommonAreasProgresss");

    let update_action = null;
    const changedFields = [];

    // Log current and previous data for comparison
    // console.log("🟦 Current data:", projectCommonAreasProgress);
    // console.log("⬜ Previous data:", prevProjectCommonAreasProgress);

    for (const key in projectCommonAreasProgress) {
      if (key === 'project_id') continue;

      const currentValue = projectCommonAreasProgress[key];
      const previousValue = prevProjectCommonAreasProgress[key];

      const currentStr = JSON.stringify(currentValue ?? null);
      const previousStr = JSON.stringify(previousValue ?? null);

      if (currentStr !== previousStr) {
        changedFields.push(key);
        // console.log(`🟡 Field changed: ${key} | Prev: ${previousStr}, New: ${currentStr}`);
      }
    }

    if (changedFields.length === 0) {
      toast.info("ℹ️ No changes detected.");
      console.log("✅ No fields changed. Skipping submission.");
      return true;
    } else {
      const { updated_user, ...rest } = projectCommonAreasProgress;
      update_action = changedFields.join(', ');

      // console.log("📝 Changed fields:", update_action);
      // console.log("📤 Data to upload:", { ...rest, updated_by: userData?.id, update_action });

      return handleSubmitWithValidation(
        projectCommonAreasProgress,
        async () =>
          await databaseService.uploadProjectCommonAreasProgress({
            ...rest,
            updated_by: userData?.id,
            update_action,
          }),
        "✅ Common areas progress submitted successfully!"
      );
    }
  } catch (error) {
    console.error("❌ Error in handleSubmitProjectCommonAreasProgresss:", error);
    toast.error("An error occurred while submitting progress. Please try again.");
  }
};


  // Render active form
  const renderForm = () => {
    const activeTab = tabs[activeTabIndex];

    switch (activeTab) {
      case "Project Details":
        return (
          <ProjectDetailsForm
            formData={projectDetails}
            setFormData={setProjectDetails}
            activeTab={activeTab}
            projectId={projectId}
            disabled={viewOnly}
            handleSubmitProjectDetails={handleSubmitProjectDetails}
          />
        );
      case "Professional Details":
        return (
          <ProjectProfessionalDetailsForm
            formData={projectProfessionalDetails}
            setFormData={setProjectProfessionalDetails}
            activeTab={activeTab}
            projectId={projectId}
            disabled={viewOnly}
            handleSubmitProjectProfessionalDetails={handleSubmitProjectProfessionalDetails}
            engineerData={engineerData}
            setEngineerData={setEngineerData}
            handleSubmitEngineer={handleSubmitEngineer}
            architectData={architectData}
            setArchitectData={setArchitectData}
            handleSubmitArchitect={handleSubmitArchitect}
            caData={caData}
            setCAData={setCAData}
            handleSubmitCA={handleSubmitCA}
            engineerOptions={engineerOptions}
            setEngineerOptions={setEngineerOptions}
            architectOptions={architectOptions}
            setArchitectOptions={setArchitectOptions}
            casOptions={casOptions}
            setCAsOptions={setCAsOptions}
          />
        );
      case "Unit Details":
        return (
          <UnitDetails
            isUnitDetailsFormActive={isUnitDetailsFormActive}
            setIsUnitDetailsFormActive={setIsUnitDetailsFormActive}
            formData={projectUnit}
            setFormData={setProjectUnit}
            setPrevProjectUnitDetails={setPrevProjectUnitDetails}
            activeTab={activeTab}
            projectId={projectId}
            disabled={viewOnly}
            handleSubmitProjectUnit={handleSubmitProjectUnit}
            handleUpdateProjectUnit={handleUpdateProjectUnit}
          />
        );
      case "Documents":
        return (
          <ProjectDocumentForm
            formData={projectDocuments}
            setFormData={setProjectDocuments}
            activeTab={activeTab}
            projectId={projectId}
            disabled={viewOnly}
            handleSubmitProjectDocuments={handleSubmitProjectDocuments}
          />
        );
      case "Project Progress":
        return (
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
        );
      default:
        return null;
    }
  };

if (loading) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-teal-200 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-[#5caaab] rounded-full animate-spin"></div>
            </div>
          </div>
          <span className="text-lg font-medium text-gray-700 animate-pulse">Loading...</span>
        </div>
      </div>
    </div>
  );
}

return (
  <div className="min-h-screen ">
    <div className="container mx-auto px-6 py-8 pt-4" >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="group flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <FaArrowLeft className="text-[#5caaab] text-xl group-hover:text-[#4a9499] transition-colors" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5caaab] to-[#4a9499] bg-clip-text text-transparent">
              Add {tabs[activeTabIndex]}
            </h1>
            {/* <p className="text-gray-500 text-sm mt-1">Create new entry</p> */}
          </div>
        </div>

<UserProfile />
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex gap-2 p-2 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 w-fit">
          {tabs.map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTabIndex(index)}
              className={`relative px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTabIndex === index
                  ? "bg-gradient-to-r from-[#5caaab] to-[#4a9499] text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-[#5caaab] hover:bg-white/80"
              }`}
            >
              {tab}
              {activeTabIndex === index && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#5caaab] to-[#4a9499] opacity-20 blur-xl"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <div className=" rounded-3xl  p-0">
        {renderForm()}
      </div>
    </div>
  </div>
);
};

export default AddProject;