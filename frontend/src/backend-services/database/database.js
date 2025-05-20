import env from '../../env/env';
import { toast } from "react-toastify";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

class DatabaseService {
  constructor() {
    this.baseUrl = env.backendUrl;
  }

  // ✅ Utility to get token
  getAuthHeaders(skipContentType = false) {
    const token = localStorage.getItem('authToken');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    if (!skipContentType) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }
  
  

  // ✅ Utility to handle responses globally
  async handleResponse(response) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  }


  // Promoter
  async uploadPromoterData({ commonData, formData, promoterType }) {
  try {
    console.log("📦 Original formData:", formData);

    const fileFormData = new FormData();
    const fieldsToUpload = [];

    const promoterName = commonData.promoter_name?.replace(/\s+/g, "_") || "UnknownPromoter";
    const timestamp = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD_HH-mm-ss");

    // 🗂 Upload file fields in formData
const identifierMap = {
  aadhar_uploaded_url: "aadhar_number",
  pan_uploaded_url:  (promoterType === 'proprietor') ?"proprietor_pan_number" : "pan_number",
  karta_pan_uploaded_url: "karta_pan_card",
  huf_pan_pan_uploaded_url: "huf_pan_card",
  company_pan_uploaded_url: "company_pan_number",
  company_incorporation_uploaded_url: "company_incorporation_number",
  partnership_pan_uploaded_url: "partnership_pan_number",
  llp_pan_uploaded_url: "llp_pan_number",
  trust_pan_uploaded_url: "trust_pan_number",
  society_pan_uploaded_url: "society_pan_number",
  public_authority_pan_uploaded_url: "public_authority_pan_number",
  aop_boi_pan_uploaded_url: "aop_boi_pan_number",
  aop_boi_deed_of_formation_uploaded_url: "",
  joint_venture_pan_uploaded_url: "joint_venture_pan_number",
  joint_venture_deed_of_formation_uploaded_url: ""
};

for (const key in formData) {
  const file = formData[key];

  if (key.endsWith("_uploaded_url") && file instanceof File) {
    if (!file) continue;

    const ext = file.name?.split(".").pop() || "pdf";
    const identifierField = identifierMap[key];

    let identifier =''

    if(promoterType === 'proprietor' && key.includes("pan")){
      identifier = `proprietor_${(identifierField && formData[identifierField]) || key.replace("_uploaded_url", "")}`
    } else {
      identifier = (identifierField && formData[identifierField]) || key.replace("_uploaded_url", "")
    }

    const renamedFile = new File(
      [file],
      `${promoterName}_${identifier}_${timestamp}.${ext}`,
      { type: file.type }
    );

    fileFormData.append(key, renamedFile);
    fieldsToUpload.push(key);
  }
}

    // 📸 Handle promoter_photo_uploaded_url from commonData separately
    if (
      commonData?.promoter_photo_uploaded_url &&
      commonData.promoter_photo_uploaded_url instanceof File
    ) {
      const file = commonData.promoter_photo_uploaded_url;
      const ext = file.name?.split(".").pop() || "pdf";

      const renamedFile = new File(
        [file],
        `${promoterName}_Photo_${timestamp}.${ext}`,
        { type: file.type }
      );

      fileFormData.append("promoter_photo_uploaded_url", renamedFile);
      fieldsToUpload.push("promoter_photo_uploaded_url");
    }

    // ⬆️ Upload all files
    if (fieldsToUpload.length > 0) {
      const uploadRes = await fetch(`${this.baseUrl}/api/promoters/upload-files`, {
        method: "POST",
        headers: this.getAuthHeaders(true),
        body: fileFormData,
      });

      if (!uploadRes.ok) {
        const errorRes = await uploadRes.json();
        throw new Error(errorRes.message || "File upload failed.");
      }

      const uploadedUrls = await uploadRes.json();
      console.log("🧾 Uploaded file URLs:", uploadedUrls);

      // 🔁 Assign uploaded URLs back to formData or commonData
      for (const field of fieldsToUpload) {
        if (!uploadedUrls[field]) {
          throw new Error(`Missing uploaded URL for field: ${field}`);
        }

        if (field === "promoter_photo_uploaded_url") {
          commonData.promoter_photo_uploaded_url = uploadedUrls[field];
        } else {
          commonData.promoter_photo_uploaded_url = ''
          formData[field] = uploadedUrls[field];
        }
      }
    }

    console.log("📤 Final Payload:", {
      ...commonData,
      promoter_type: promoterType,
      promoter_details: formData,
    });

    // 📨 Submit final data
    const response = await fetch(`${this.baseUrl}/api/promoters/add-promoter`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...commonData,
        promoter_type: promoterType,
        promoter_details: formData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Promoter data submission failed.");
    }

    const result = await response.json();
    // toast.success("✅ Promoter data uploaded successfully!");
    return result;
  } catch (error) {
    console.error("❌ Error uploading promoter data:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}

  async updatePromoter(id, { commonData, formData, promoterType }) {
    try {
      console.log("📝 Original formData for update:", formData);

      const fileFormData = new FormData();
      const fieldsToUpload = [];

      const promoterName = commonData.promoter_name?.replace(/\s+/g, "_") || "UnknownPromoter";
      const timestamp = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD_HH-mm-ss");

      // 🗂 Identifier map for different promoter types
      const identifierMap = {
        aadhar_uploaded_url: "aadhar_number",
        pan_uploaded_url: (promoterType === 'proprietor') ? "proprietor_pan_number" : "pan_number",
        karta_pan_uploaded_url: "karta_pan_card",
        huf_pan_pan_uploaded_url: "huf_pan_card",
        company_pan_uploaded_url: "company_pan_number",
        company_incorporation_uploaded_url: "company_incorporation_number",
        partnership_pan_uploaded_url: "partnership_pan_number",
        llp_pan_uploaded_url: "llp_pan_number",
        trust_pan_uploaded_url: "trust_pan_number",
        society_pan_uploaded_url: "society_pan_number",
        public_authority_pan_uploaded_url: "public_authority_pan_number",
        aop_boi_pan_uploaded_url: "aop_boi_pan_number",
        aop_boi_deed_of_formation_uploaded_url: "",
        joint_venture_pan_uploaded_url: "joint_venture_pan_number",
        joint_venture_deed_of_formation_uploaded_url: ""
      };

      // 🔍 Process file fields in formData
      for (const key in formData) {
        const file = formData[key];

        if (key.endsWith("_uploaded_url") && file instanceof File) {
          if (!file) continue;

          const ext = file.name?.split(".").pop() || "pdf";
          const identifierField = identifierMap[key];

          let identifier = "";

          if (promoterType === "proprietor" && key.includes("pan")) {
            identifier = `proprietor_${(identifierField && formData[identifierField]) || key.replace("_uploaded_url", "")}`;
          } else {
            identifier = (identifierField && formData[identifierField]) || key.replace("_uploaded_url", "");
          }

          const renamedFile = new File(
            [file],
            `${promoterName}_${identifier}_${timestamp}.${ext}`,
            { type: file.type }
          );

          fileFormData.append(key, renamedFile);
          fieldsToUpload.push(key);
        }
      }

      // 📸 Handle promoter photo from commonData
      if (
        commonData?.promoter_photo_uploaded_url &&
        commonData.promoter_photo_uploaded_url instanceof File
      ) {
        const file = commonData.promoter_photo_uploaded_url;
        const ext = file.name?.split(".").pop() || "pdf";

        const renamedFile = new File(
          [file],
          `${promoterName}_Photo_${timestamp}.${ext}`,
          { type: file.type }
        );

        fileFormData.append("promoter_photo_uploaded_url", renamedFile);
        fieldsToUpload.push("promoter_photo_uploaded_url");
      }

      // ⬆️ Upload files if any
      if (fieldsToUpload.length > 0) {
        const uploadRes = await fetch(`${this.baseUrl}/api/promoters/upload-files`, {
          method: "POST",
          headers: this.getAuthHeaders(true),
          body: fileFormData,
        });

        if (!uploadRes.ok) {
          const errorRes = await uploadRes.json();
          throw new Error(errorRes.message || "File upload failed.");
        }

        const uploadedUrls = await uploadRes.json();
        console.log("📥 Uploaded URLs:", uploadedUrls);

        // 🔁 Merge uploaded URLs back to formData or commonData
        for (const field of fieldsToUpload) {
          if (!uploadedUrls[field]) {
            throw new Error(`Missing uploaded URL for field: ${field}`);
          }

          if (field === "promoter_photo_uploaded_url") {
            commonData.promoter_photo_uploaded_url = uploadedUrls[field];
          } else {
            formData[field] = uploadedUrls[field];
          }
        }
      }

      // 📦 Final payload
      const payload = {
        ...commonData,
        promoter_type: promoterType,
        promoter_details: formData,
      };

      console.log("📤 Final Payload for update:", payload);

      // 🔄 Make update API call
      const response = await fetch(`${this.baseUrl}/api/promoters/update/${id}`, {
        method: "PUT",
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Promoter update failed.");
      }

      const data = await response.json();
      // toast.success("✅ Promoter updated successfully!");
      return data;
    } catch (err) {
      console.error("❌ Error updating Promoter:", err);
      // toast.error(`❌ ${err.message}`);
      throw err;
    }
  }
  
  async getPromoterDetailsById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/api/promoters/get/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch promoter details.");
      }
  
      const data = await response.json();
      console.log(data);
      
      // toast.success("✅ Promoter details fetched successfully!");
      return data.promoter;
  
    } catch (error) {
      console.error("❌ Error fetching promoter details:", error);
      // toast.error(`❌ ${error.message}`);
      throw error;
    }
  }
    
  async getAllPromoters() {
    try {
      const response = await fetch(`${this.baseUrl}/api/promoters/get-all`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch promoters.");
      }
  
      const data = await response.json();
      // toast.success("✅ Promoters fetched successfully!");
      return data.promoters;
  
    } catch (error) {
      console.error("❌ Error fetching promoters:", error);
      // toast.error(`❌ ${error.message}`);
      throw error;
    }
  }
  
  async getAllPromotersForDropdown() {
    try {
      const response = await fetch(`${this.baseUrl}/api/promoters/get-all`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch promoters.");
      }
  
      const data = await response.json();
      // toast.success("✅ Promoters fetched successfully!");
  
      // Map to label/value format for react-select or dropdowns
      const dropdownOptions = data.promoters.map((promoter) => ({
        label: promoter.promoter_name,
        value: promoter.id,
      }));
  
      return dropdownOptions;
  
    } catch (error) {
      console.error("❌ Error fetching promoters:", error);
      // toast.error(`❌ ${error.message}`);
      throw error;
    }
  }

  async deletePromoterById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/api/promoters/delete/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete promoter.");
      }
  
      // toast.success("✅ Promoter deleted successfully!");
      return true;
  
    } catch (error) {
      console.error("❌ Error deleting promoter:", error);
      // toast.error(`❌ ${error.message}`);
      throw error;
    }
  }




  // Project
  
  async uploadProjectDetails(formData) {
    try {
      console.log('Original project formData:', formData);
  
      const fileFormData = new FormData();
      const fieldsToUpload = [];
  
      const project_name = formData.project_name?.replace(/\s+/g, '_') || 'UnknownPromoter';
      const timestamp = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD_HH-mm-ss");
  
      for (const key in formData) {
        const file = formData[key];
  
        if (key.endsWith('_uploaded_url') && file instanceof File) {
          // Skip if file is null or undefined
          if (!file) continue;
  
          let identifier = "NoIdentifier";
  
          if (key === "rera_certificate_uploaded_url") {
            identifier = formData.rera_number || "NoRERA";
          }
  
          const extension = file.name?.split('.').pop() || 'pdf';
          const renamedFile = new File(
            [file],
            `${project_name}_${identifier}_${timestamp}.${extension}`,
            { type: file.type }
          );
  
          fileFormData.append(key, renamedFile);
          fieldsToUpload.push(key);
        }
      }
  
      if (fieldsToUpload.length > 0) {
        const fileUploadRes = await fetch(`${this.baseUrl}/api/projects/upload-files`, {
          method: "POST",
          headers: this.getAuthHeaders(true),
          body: fileFormData
        });
  
        if (!fileUploadRes.ok) {
          const errorData = await fileUploadRes.json();
          throw new Error(errorData.message || "File upload failed.");
        }
  
        const uploadedUrls = await fileUploadRes.json();
  
        for (const fieldName of fieldsToUpload) {
          if (uploadedUrls[fieldName]) {
            formData[fieldName] = uploadedUrls[fieldName];
          } else {
            throw new Error(`Missing URL for ${fieldName} in upload response`);
          }
        }
      }
  
      console.log("Final project formData to submit:", formData);
  
      const response = await fetch(`${this.baseUrl}/api/projects/add-project`, {
        method: "POST",
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Project data submission failed.");
      }
  
      const data = await response.json();
      // toast.success("✅ Project data uploaded successfully!");
      return data;
  
    } catch (error) {
      console.error("❌ Error uploading project data:", error);
      // toast.error(`❌ ${error.message}`);
      throw error;
    }
  }

  async getProjectById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/api/projects/get-project/${id}`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch project details.");
      }
  
      const data = await response.json();
      // toast.success("✅ Project details fetched successfully!");
      return data.project;
    } catch (error) {
      console.error("❌ Error fetching project details:", error);
      // toast.error(`❌ ${error.message}`);
      throw error;
    }
  }

  async updateProjectDetails(projectId, formData) {
    try {
      console.log('Original project formData for update:', formData);
  
      const fileFormData = new FormData();
      const fieldsToUpload = [];
  
      const project_name = formData.project_name?.replace(/\s+/g, '_') || 'UnknownPromoter';
      const timestamp = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD_HH-mm-ss");
  
      for (const key in formData) {
        const file = formData[key];
  
        if (key.endsWith('_uploaded_url') && file instanceof File) {
          if (!file) continue;
  
          let identifier = "NoIdentifier";
  
          if (key === "rera_certificate_uploaded_url") {
            identifier = formData.rera_number || "NoRERA";
          }
  
          const extension = file.name?.split('.').pop() || 'pdf';
          const renamedFile = new File(
            [file],
            `${project_name}_${identifier}_${timestamp}.${extension}`,
            { type: file.type }
          );
  
          fileFormData.append(key, renamedFile);
          fieldsToUpload.push(key);
        }
      }
  
      if (fieldsToUpload.length > 0) {
        const fileUploadRes = await fetch(`${this.baseUrl}/api/projects/upload-files`, {
          method: "POST",
          headers: this.getAuthHeaders(true),
          body: fileFormData,
        });
  
        if (!fileUploadRes.ok) {
          const errorData = await fileUploadRes.json();
          throw new Error(errorData.message || "File upload failed.");
        }
  
        const uploadedUrls = await fileUploadRes.json();
  
        for (const fieldName of fieldsToUpload) {
          if (uploadedUrls[fieldName]) {
            formData[fieldName] = uploadedUrls[fieldName];
          } else {
            throw new Error(`Missing URL for ${fieldName} in upload response`);
          }
        }
      }
  
      console.log("Final project formData to update:", formData);
  
      const response = await fetch(`${this.baseUrl}/api/projects/update/${projectId}`, {
        method: "PUT",
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Project update failed.");
      }
  
      const data = await response.json();
      // toast.success("✅ Project data updated successfully!");
      return data;
  
    } catch (error) {
      console.error("❌ Error updating project data:", error);
      // toast.error(`❌ ${error.message}`);
      throw error;
    }
  }

  async deleteProjectById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/api/projects/delete/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete project.");
      }
  
      // toast.success("✅ Project deleted successfully!");
      return true;
  
    } catch (error) {
      console.error("❌ Error deleting project:", error);
      // toast.error(`❌ ${error.message}`);
      throw error;
    }
  }
  



  // ProjectProfessional

  async uploadProjectProfessionalDetails(formData) {
  try {
    console.log("Final professional details formData to submit:", formData);

    const response = await fetch(`${this.baseUrl}/api/projects/add-project-professionals`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Professional details submission failed.");
    }

    const data = await response.json();
    // toast.success("✅ Project professional details uploaded successfully!");
    return data;

  } catch (error) {
    console.error("❌ Error uploading professional details:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}

// ✅ Public method
async addEngineer(data) {
  return await this.#uploadProfessionalWithFiles(data, 'engineer');
}

// ✅ Public method
async addArchitect(data) {
  return await this.#uploadProfessionalWithFiles(data, 'architect');
}

// ✅ Public method
async addCA(data) {
  return await this.#uploadProfessionalWithFiles(data, 'ca');
}

// 🔒 Private method to upload files + submit form
async #uploadProfessionalWithFiles(data, role) {
  console.log(`Uploading ${role} data`, data);

  const formData = { [role]: data }; // Mimic your structure
  const fileFormData = new FormData();
  const fieldsToUpload = [];

  const timestamp = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD_HH-mm-ss");

  const section = formData[role];
  const roleName = section.name?.replace(/\s+/g, '') || "Unknown";

  for (const key in section) {
    const value = section[key];

    if (key.endsWith('_uploaded_url') && value instanceof File) {
      const fileType = key.replace('_uploaded_url', '');
      let identifier = '';

      switch (fileType) {
        case 'pan':
          identifier = section.pan_number || 'unknown';
          break;
        case 'licence':
          identifier = section.licence_number || 'unknown';
          break;
        default:
          identifier = fileType;
      }

      const extension = value.name?.split('.').pop() || 'pdf';
      const newFileName = `${role}_${roleName}_${fileType}_${identifier}_${timestamp}.${extension}`;
      const renamedFile = new File([value], newFileName, { type: value.type });

      const fullFieldName = `${role}.${key}`;
      fileFormData.append(fullFieldName, renamedFile);
      fieldsToUpload.push({ role, fileType, identifier, fullFieldName });
    }
  }

  // 🔄 Upload files if any
  if (fieldsToUpload.length > 0) {
    const fileUploadRes = await fetch(`${this.baseUrl}/api/projects/professional-details/upload-files`, {
      method: "POST",
      headers: this.getAuthHeaders(true), // skipContentType = true for multipart/form-data
      body: fileFormData
    });

    if (!fileUploadRes.ok) {
      const errorData = await fileUploadRes.json();
      throw new Error(errorData.message || "File upload failed.");
    }

    const uploadedUrls = await fileUploadRes.json();
    console.log("✅ Uploaded URLs:", uploadedUrls);

    // 📝 Replace file fields with URLs
    for (const { fullFieldName } of fieldsToUpload) {
      if (uploadedUrls[fullFieldName]) {
        const [_, rawKey] = fullFieldName.split('.');
        formData[role][rawKey] = uploadedUrls[fullFieldName];
      } else {
        throw new Error(`Missing URL for ${fullFieldName}`);
      }
    }
  }

  // 📤 Submit final data
  const finalPayload = {
    ...formData[role],
    project_id: data.project_id,
  };

  const res = await fetch(`${this.baseUrl}/api/projects/professional-details/add/${role}`, {
    method: "POST",
    headers: this.getAuthHeaders(),
    body: JSON.stringify(finalPayload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || `Failed to upload ${role} details`);
  }

  const savedData = await res.json();
  console.log(`✅ ${role} details saved successfully`, savedData);
  return savedData;
}



async getProjectProfessionalData(projectId) {
  try {
    const response = await fetch(`${this.baseUrl}/api/projects/get-project-professionals/${projectId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch project professional data.");
    }

    const data = await response.json();
    // toast.success("✅ Project professional data fetched successfully!");
    return data.professionalData;

  } catch (error) {
    console.error("❌ Error fetching project professional data:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}
    
async getAllEngineers() {
  try {
    const response = await fetch(`${this.baseUrl}/api/projects/engineers/get-all`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch engineers.");
    }

    const data = await response.json();
    // // toast.success("✅ Engineers fetched successfully!");
    return data.engineers;

  } catch (error) {
    console.error("❌ Error fetching engineers:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}

async getAllArchitects() {
  try {
    const response = await fetch(`${this.baseUrl}/api/projects/architects/get-all`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch architects.");
    }

    const data = await response.json();
    // // toast.success("✅ Architects fetched successfully!");
    return data.architects;

  } catch (error) {
    console.error("❌ Error fetching architects:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}

async getAllCAs() {
  try {
    const response = await fetch(`${this.baseUrl}/api/projects/cas/get-all`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch CAs.");
    }

    const data = await response.json();
    // // toast.success("✅ CAs fetched successfully!");
    return data.cas;

  } catch (error) {
    console.error("❌ Error fetching CAs:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}




  // ProjectUnit

async uploadProjectUnitDetails(formData) {
  try {
    const fileFormData = new FormData();
    const timestamp = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD_HH-mm-ss");
    const fileFields = ['afs_uploaded_url', 'sale_deed_uploaded_url'];
    const uploadedFiles = [];

    for (const key of fileFields) {
      const file = formData[key];
      if (file instanceof File) {
        const extension = file.name?.split('.').pop() || 'pdf';
        const newFileName = `unit_${key}_${formData.unit_name}_${timestamp}.${extension}`;
        const renamedFile = new File([file], newFileName, { type: file.type });
        fileFormData.append(key, renamedFile);
        uploadedFiles.push(key);
      }
    }

    // Upload files
    if (uploadedFiles.length > 0) {
      const res = await fetch(`${this.baseUrl}/api/projects/unit-details/upload-files`, {
        method: "POST",
        headers: this.getAuthHeaders(true),
        body: fileFormData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "File upload failed.");
      }

      const urls = await res.json();
      uploadedFiles.forEach((key) => {
        if (urls[key]) {
          formData[key] = urls[key];
        } else {
          throw new Error(`Missing uploaded URL for ${key}`);
        }
      });
    }

    // Submit final form
    const response = await fetch(`${this.baseUrl}/api/projects/add-project-units`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Unit details submission failed.");
    }

    const data = await response.json();
    // toast.success("✅ Project unit details uploaded successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error uploading unit details:", err);
    // toast.error(`❌ ${err.message}`);
    throw err;
  }
}

async updateProjectUnitDetails(id, formData) {
  try {
    const fileFormData = new FormData();
    const timestamp = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD_HH-mm-ss");
    const fileFields = ['afs_uploaded_url', 'sale_deed_uploaded_url'];
    const uploadedFiles = [];

    for (const key of fileFields) {
      const file = formData[key];
      if (file instanceof File) {
        const extension = file.name?.split('.').pop() || 'pdf';
        const newFileName = `unit_${key}_${formData.unit_name}_${timestamp}.${extension}`;
        const renamedFile = new File([file], newFileName, { type: file.type });
        fileFormData.append(key, renamedFile);
        uploadedFiles.push(key);
      }
    }

    // Upload new files if any
    if (uploadedFiles.length > 0) {
      const res = await fetch(`${this.baseUrl}/api/projects/unit-details/upload-files`, {
        method: "POST",
        headers: this.getAuthHeaders(true),
        body: fileFormData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "File upload failed.");
      }

      const urls = await res.json();
      uploadedFiles.forEach((key) => {
        if (urls[key]) {
          formData[key] = urls[key];
        } else {
          throw new Error(`Missing uploaded URL for ${key}`);
        }
      });
    }

    // Submit updated unit details
    const response = await fetch(`${this.baseUrl}/api/projects/update-project-units/${id}`, {
      method: "PUT",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Unit update failed.");
    }

    const data = await response.json();
    // toast.success("✅ Project unit details updated successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error updating unit details:", err);
    // toast.error(`❌ ${err.message}`);
    throw err;
  }
}

async getUnitById(id) {
  try {
    const response = await fetch(`${this.baseUrl}/api/projects/units/get-unit/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch unit details.");
    }

    const data = await response.json();
    // toast.success("✅ Unit details fetched successfully!");
    return data.unit;
  } catch (error) {
    console.error("❌ Error fetching unit details:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}

async getAllUnitsForProject(projectId) {
  try {
    const response = await fetch(`${this.baseUrl}/api/projects/units/get-all/?project-id=${projectId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch units.");
    }

    const data = await response.json();
    // toast.success("✅ Units fetched successfully!");
    return data.units;

  } catch (error) {
    console.error("❌ Error fetching units:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}

async deleteProjectUnitById(id) {
  try {
    const response = await fetch(`${this.baseUrl}/api/projects/units/delete/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete unit.");
    }
  
    // toast.success("✅ Unit deleted successfully!");
    return true;
  
  } catch (error) {
    console.error("❌ Error deleting unit:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
  }




  // ProjectDocument

async uploadProjectDocuments(formData) {
  try {
    const fileFormData = new FormData();
    const timestamp = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD_HH-mm-ss");
    const uploadedFiles = [];

    for (const key in formData) {
      const value = formData[key];
      if (key.endsWith('_uploaded_url') && value instanceof File) {
        const extension = value.name?.split('.').pop() || 'pdf';
        const newFileName = `doc_${key}_${timestamp}.${extension}`;
        const renamedFile = new File([value], newFileName, { type: value.type });
        fileFormData.append(key, renamedFile);
        uploadedFiles.push(key);
      }
    }

    // Upload files
    if (uploadedFiles.length > 0) {
      const res = await fetch(`${this.baseUrl}/api/projects/documents/upload-files`, {
        method: "POST",
        headers: this.getAuthHeaders(true),
        body: fileFormData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "File upload failed.");
      }

      const urls = await res.json();
      console.log(uploadedFiles);
      
      uploadedFiles.forEach((key) => {
        if (urls[key]) {
          formData[key] = urls[key];
        } else {
          throw new Error(`Missing uploaded URL for ${key}`);
        }
      });
    }

    const response = await fetch(`${this.baseUrl}/api/projects/add-project-documents`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Documents submission failed.");
    }

    const data = await response.json();
    // toast.success("✅ Project documents uploaded successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error uploading documents:", err);
    // toast.error(`❌ ${err.message}`);
    throw err;
  }
}

async getProjectDocuments(projectId) {
  try {
    const response = await fetch(`${this.baseUrl}/api/projects/get-documents/${projectId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle specific error messages returned from the backend
      if (errorData.error === "No documents found for this project.") {
        throw new Error("No documents found for this project.");
      }
      
      throw new Error(errorData.message || "Failed to fetch project documents.");
    }

    const data = await response.json();
    // // toast.success("✅ Project documents fetched successfully!");
    return data.documents;

  } catch (error) {
    // console.error("❌ Error fetching project documents:", error);

    // Show user-friendly error message
    if (error.message === "No documents found for this project.") {
      // // toast.error("❌ No documents found for this project.");
    } else {
      // // toast.error(`❌ ${error.message}`);
    }

    // throw error; // Re-throw error for further handling
  }
}




// ProjectSiteProgress


async uploadProjectBuildingProgress(formData) {
  try {
    const response = await fetch(`${this.baseUrl}/api/projects/add-building-progress`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    console.log(response);
    

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Building progress submission failed.");
    }

    const data = await response.json();
    // toast.success("✅ Project building progress uploaded successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error uploading building progress:", err);
    // toast.error(`❌ ${err.message}`);
    throw err;
  }
}

async uploadProjectCommonAreasProgress(formData) {
  try {
    const response = await fetch(`${this.baseUrl}/api/projects/add-common-areas-progress`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Common areas progress submission failed.");
    }

    const data = await response.json();
    // toast.success("✅ Project common areas progress uploaded successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error uploading common areas progress:", err);
    // toast.error(`❌ ${err.message}`);
    throw err;
  }
}

async getProjectSiteProgress(projectId) {
  try {
    const response = await fetch(`${this.baseUrl}/api/projects/get-site-progress/${projectId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      console.log(response);
      if(response.status === 404) {
        toast('Site Progress Data is not availible!')
        return
      }
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch site progress.");
    }

    const data = await response.json();

    // toast.success("✅ Project site progress fetched successfully!");

    // Return the full structure with all components
    return {
      siteProgress: data.siteProgress,
      buildingProgress: data.buildingProgress,
      commonAreasProgress: data.commonAreasProgress,
    };
  } catch (error) {
    console.error("❌ Error fetching site progress:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}

async getAllProjects() {
  try {
    const response = await fetch(`${this.baseUrl}/api/projects/get-all`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch promoters.");
    }

    const data = await response.json();
    // toast.success("✅ Projects fetched successfully!");
    return data.projects;

  } catch (error) {
    console.error("❌ Error fetching promoters:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}

async getAllProjectsForDropdown() {
  try {
    const response = await fetch(`${this.baseUrl}/api/projects/get-all`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch projects.");
    }

    const data = await response.json();
    // toast.success("✅ Projects fetched successfully!");

    // Map to label/value format for react-select
    const dropdownOptions = data.projects.map((project) => ({
      label: project.project_name,
      value: project.id,
    }));

    return dropdownOptions;

  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}

async getAllProjectsForAssignmentDropdown() {
  try {
    const response = await fetch(`${this.baseUrl}/api/projects/get-all`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch projects for assignment.");
    }

    const data = await response.json();
    // console.log(data);
    

    // Format for dropdown: label = project name, value = full project object
    const dropdownOptions = data.projects.map((project) => ({
      label: {
        name:project?.project_name,
        id: project?.id,
        promtoer_name: project?.promoter_name,
      },
      value: project, // full project object
    }));

    return dropdownOptions;

  } catch (error) {
    console.error("❌ Error fetching projects for assignment:", error);
    throw error;
  }
}



// ChannelPartner

async createChannelPartner(formData) {
  try {
    const response = await fetch(`${this.baseUrl}/api/channel-partners/add`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Channel Partner creation failed.");
    }

    const data = await response.json();
    // toast.success("✅ Channel Partner created successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error creating Channel Partner:", err);
    // toast.error(`❌ ${err.message}`);
    throw err;
  }
}
async updateChannelPartner( id, formData) {
  try {
    const response = await fetch(`${this.baseUrl}/api/channel-partners/update/${id}`, {
      method: "PUT",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Channel Partner update failed.");
    }

    const data = await response.json();
    // toast.success("✅ Channel Partner updated successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error updating Channel Partner:", err);
    // toast.error(`❌ ${err.message}`);
    throw err;
  }
}

async getAllChannelPartners() {
  try {
    const response = await fetch(`${this.baseUrl}/api/channel-partners/get-all`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch channel partners.");
    }

    // console.log(response);
    
    const data = await response.json();
    // toast.success("✅ Channel partners fetched successfully!");
    return data.channelPartners;

  } catch (error) {
    console.error("❌ Error fetching channel partners:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}

async getChannelPartnerById(id) {
  try {
    const response = await fetch(`${this.baseUrl}/api/channel-partners/get/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch channel partner details.");
    }
    
    
    const data = await response.json();
    // console.log(data);
    // toast.success("✅ Channel Partner details fetched successfully!");
    return data.channelPartner; // assuming your API returns { channel_partner: {...} }

  } catch (error) {
    console.error("❌ Error fetching channel partner details:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}


async getAllChannelPartnersForDropdown() {
  try {
    const response = await fetch(`${this.baseUrl}/api/channel-partners/get-all`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch channel partners.");
    }

    const data = await response.json();
    // toast.success("✅ Channel partners fetched successfully!");

    // Map to label/value format for react-select
    const dropdownOptions = data.channelPartners.map((partner) => ({
      label: partner.full_name,
      value: partner.id,
    }));

    return dropdownOptions;

  } catch (error) {
    console.error("❌ Error fetching channel partners:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}

async deleteChannelPartnerById(id) {
  try {
    const response = await fetch(`${this.baseUrl}/api/channel-partners/delete/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete channel partner.");
    }

    // toast.success("✅ Channel Partner deleted successfully!");
    return true;

  } catch (error) {
    console.error("❌ Error deleting channel partner:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}




// Assignment

async createNewAssignment(formData) {
  try {
    const response = await fetch(`${this.baseUrl}/api/assignments/add`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Assignment creation failed.");
    }

    const data = await response.json();
    // toast.success("✅ Assignment created successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error creating assignment:", err);
    // toast.error(`❌ ${err.message}`);
    throw err;
  }
}
  
async getAssignmentById(id) {
  try {
    const response = await fetch(`${this.baseUrl}/api/assignments/get/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch assignment details.");
    }

    const data = await response.json();
    // console.log(data);
    
    // toast.success("✅ Assignment details fetched successfully!");
    return data.assignment; // assuming your API returns { assignment: {...} }

  } catch (error) {
    console.error("❌ Error fetching assignment details:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}
async getAllAssignments() {
  try {
    const response = await fetch(`${this.baseUrl}/api/assignments/get-all`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch assignments.");
    }

    
    const data = await response.json();
    // console.log(data);
    // toast.success("✅ Assignments fetched successfully!");
    return data.assignments;

  } catch (error) {
    console.error("❌ Error fetching assignments:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}

async updateAssignment(id, formData) {
  try {
    const response = await fetch(`${this.baseUrl}/api/assignments/update/${id}`, {
      method: "PUT",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Assignment update failed.");
    }

    const data = await response.json();
    // toast.success("✅ Assignment updated successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error updating Assignment:", err);
    // toast.error(`❌ ${err.message}`);
    throw err;
  }
}

async updateAssignmentStatus(assignmentId, newStatus) {
  try {
    const response = await fetch(`${this.baseUrl}/api/assignments/update-status/${assignmentId}`, {
      method: "PUT",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ assignment_status: newStatus })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Assignment status update failed.");
    }

    const data = await response.json();
    // toast.success("✅ Assignment status updated successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error updating assignment status:", err);
    // toast.error(`❌ ${err.message}`);
    throw err;
  }
}

async addAssignmentNote(assignmentId, notePayload) {
      console.log("assignmentId:", assignmentId, "notePayload:", notePayload);
  try {
    const response = await fetch(`${this.baseUrl}/api/assignments/add-note/${assignmentId}`, {
      method: "PUT",
      headers: {
        ...this.getAuthHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(notePayload)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Adding note failed.");
    }

    const data = await response.json();
    // toast.success("✅ Note added successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error adding assignment note:", err);
    // toast.error(`❌ ${err.message}`);
    throw err;
  }
}

async deleteAssignmentById(id) {
  try {
    const response = await fetch(`${this.baseUrl}/api/assignments/delete/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete assignment.");
    }

    // toast.success("✅ Assignment deleted successfully!");
    return true;

  } catch (error) {
    console.error("❌ Error deleting assignment:", error);
    // toast.error(`❌ ${error.message}`);
    throw error;
  }
}



 
// CitiesAndDistricts

async getAllCitiesAndDistricts ()  {

const districtCityMap = {
  Ahmednagar: [
    { label: "Akole", value: "Akole" },
    { label: "Jamkhed", value: "Jamkhed" },
    { label: "Karjat", value: "Karjat" },
    { label: "Kopargaon", value: "Kopargaon" },
    { label: "Nagar", value: "Nagar" },
    { label: "Nevasa", value: "Nevasa" },
    { label: "Parner", value: "Parner" },
    { label: "Pathardi", value: "Pathardi" },
    { label: "Rahta", value: "Rahta" },
    { label: "Rahuri", value: "Rahuri" },
    { label: "Sangamner", value: "Sangamner" },
    { label: "Shevgaon", value: "Shevgaon" },
    { label: "Shrigonda", value: "Shrigonda" },
    { label: "Shrirampur", value: "Shrirampur" },
  ],
  Akola: [
    { label: "Akola", value: "Akola" },
    { label: "Akot", value: "Akot" },
    { label: "Balapur", value: "Balapur" },
    { label: "Barshitakli", value: "Barshitakli" },
    { label: "Murtijapur", value: "Murtijapur" },
    { label: "Patur", value: "Patur" },
    { label: "Telhara", value: "Telhara" },
  ],
  Amravati: [
    { label: "Achalpur", value: "Achalpur" },
    { label: "Amravati", value: "Amravati" },
    { label: "Anjangaon Surji", value: "Anjangaon Surji" },
    { label: "Bhatkuli", value: "Bhatkuli" },
    { label: "Chandur Railway", value: "Chandur Railway" },
    { label: "Chandurbazar", value: "Chandurbazar" },
    { label: "Chikhaldara", value: "Chikhaldara" },
    { label: "Daryapur", value: "Daryapur" },
    { label: "Dhamangaon Railway", value: "Dhamangaon Railway" },
    { label: "Dharni", value: "Dharni" },
    { label: "Morshi", value: "Morshi" },
    { label: "Nandgaon-Khandeshwar", value: "Nandgaon-Khandeshwar" },
    { label: "Tiosa", value: "Tiosa" },
    { label: "Warud", value: "Warud" },
  ],
  Aurangabad: [
    {
      label: "Chhatrapati Sambhajinagar",
      value: "Chhatrapati Sambhajinagar",
    },
    { label: "Gangapur", value: "Gangapur" },
    { label: "Kannad", value: "Kannad" },
    { label: "Khuldabad", value: "Khuldabad" },
    { label: "Paithan", value: "Paithan" },
    { label: "Phulambri", value: "Phulambri" },
    { label: "Sillod", value: "Sillod" },
    { label: "Soegaon", value: "Soegaon" },
    { label: "Vaijapur", value: "Vaijapur" },
  ],
  Beed: [
    { label: "Ambejogai", value: "Ambejogai" },
    { label: "Ashti", value: "Ashti" },
    { label: "Beed", value: "Beed" },
    { label: "Dharur", value: "Dharur" },
    { label: "Georai", value: "Georai" },
    { label: "Kaij", value: "Kaij" },
    { label: "Majalgaon", value: "Majalgaon" },
    { label: "Parli", value: "Parli" },
    { label: "Patoda", value: "Patoda" },
    { label: "Shirur (Kasar)", value: "Shirur (Kasar)" },
    { label: "Wadwani", value: "Wadwani" },
  ],
  Bhandara: [
    { label: "Bhandara", value: "Bhandara" },
    { label: "Lakhandur", value: "Lakhandur" },
    { label: "Lakhani", value: "Lakhani" },
    { label: "Mohadi", value: "Mohadi" },
    { label: "Pauni", value: "Pauni" },
    { label: "Sakoli", value: "Sakoli" },
    { label: "Tumsar", value: "Tumsar" },
  ],
  Buldhana: [
    { label: "Buldana", value: "Buldana" },
    { label: "Chikhli", value: "Chikhli" },
    { label: "Deolgaon Raja", value: "Deolgaon Raja" },
    { label: "Jalgaon (Jamod)", value: "Jalgaon (Jamod)" },
    { label: "Khamgaon", value: "Khamgaon" },
    { label: "Lonar", value: "Lonar" },
    { label: "Malkapur", value: "Malkapur" },
    { label: "Mehkar", value: "Mehkar" },
    { label: "Motala", value: "Motala" },
    { label: "Nandura", value: "Nandura" },
    { label: "Sangrampur", value: "Sangrampur" },
    { label: "Shegaon", value: "Shegaon" },
    { label: "Sindkhed Raja", value: "Sindkhed Raja" },
  ],
  Chandrapur: [
    { label: "Ballarpur", value: "Ballarpur" },
    { label: "Bhadravati", value: "Bhadravati" },
    { label: "Brahmapuri", value: "Brahmapuri" },
    { label: "Chandrapur", value: "Chandrapur" },
    { label: "Chimur", value: "Chimur" },
    { label: "Gondpipri", value: "Gondpipri" },
    { label: "Jiwati", value: "Jiwati" },
    { label: "Korpana", value: "Korpana" },
    { label: "Mul", value: "Mul" },
    { label: "Nagbhid", value: "Nagbhid" },
    { label: "Pombhurna", value: "Pombhurna" },
    { label: "Rajura", value: "Rajura" },
    { label: "Sawali", value: "Sawali" },
    { label: "Sindewahi", value: "Sindewahi" },
    { label: "Warora", value: "Warora" },
  ],
  Dhule: [
    { label: "Dhule", value: "Dhule" },
    { label: "Sakri", value: "Sakri" },
    { label: "Shirpur", value: "Shirpur" },
    { label: "Sindkhede", value: "Sindkhede" },
  ],
  Gadchiroli: [
    { label: "Aheri", value: "Aheri" },
    { label: "Armori", value: "Armori" },
    { label: "Bhamragad", value: "Bhamragad" },
    { label: "Chamorshi", value: "Chamorshi" },
    { label: "Desaiganj (Vadasa)", value: "Desaiganj (Vadasa)" },
    { label: "Dhanora", value: "Dhanora" },
    { label: "Etapalli", value: "Etapalli" },
    { label: "Gadchiroli", value: "Gadchiroli" },
    { label: "Korchi", value: "Korchi" },
    { label: "Kurkheda", value: "Kurkheda" },
    { label: "Mulchera", value: "Mulchera" },
    { label: "Sironcha", value: "Sironcha" },
  ],
  Gondia: [
    { label: "Amgaon", value: "Amgaon" },
    { label: "Arjuni Morgaon", value: "Arjuni Morgaon" },
    { label: "Deori", value: "Deori" },
    { label: "Gondiya", value: "Gondiya" },
    { label: "Goregaon", value: "Goregaon" },
    { label: "Sadak-Arjuni", value: "Sadak-Arjuni" },
    { label: "Salekasa", value: "Salekasa" },
    { label: "Tirora", value: "Tirora" },
  ],
  Hingoli: [
    { label: "Aundha (Nagnath)", value: "Aundha (Nagnath)" },
    { label: "Hingoli", value: "Hingoli" },
    { label: "Kalamnuri", value: "Kalamnuri" },
    { label: "Sengaon", value: "Sengaon" },
    { label: "Vasmath", value: "Vasmath" },
  ],
  Jalgaon: [
    { label: "Amalner", value: "Amalner" },
    { label: "Bhadgaon", value: "Bhadgaon" },
    { label: "Bhusawal", value: "Bhusawal" },
    { label: "Bodvad", value: "Bodvad" },
    { label: "Chalisgaon", value: "Chalisgaon" },
    { label: "Chopda", value: "Chopda" },
    { label: "Dharangaon", value: "Dharangaon" },
    { label: "Erandol", value: "Erandol" },
    { label: "Jalgaon", value: "Jalgaon" },
    { label: "Jamner", value: "Jamner" },
    { label: "Muktainagar (Edlabad)", value: "Muktainagar (Edlabad)" },
    { label: "Pachora", value: "Pachora" },
    { label: "Parola", value: "Parola" },
    { label: "Raver", value: "Raver" },
    { label: "Yawal", value: "Yawal" },
  ],
  Jalna: [
    { label: "Ambad", value: "Ambad" },
    { label: "Badnapur", value: "Badnapur" },
    { label: "Bhokardan", value: "Bhokardan" },
    { label: "Ghansawangi", value: "Ghansawangi" },
    { label: "Jafrabad", value: "Jafrabad" },
    { label: "Jalna", value: "Jalna" },
    { label: "Mantha", value: "Mantha" },
    { label: "Partur", value: "Partur" },
  ],
  Kolhapur: [
    { label: "Ajra", value: "Ajra" },
    { label: "Bhudargad", value: "Bhudargad" },
    { label: "Chandgad", value: "Chandgad" },
    { label: "Gadhinglaj", value: "Gadhinglaj" },
    { label: "Gaganbawada", value: "Gaganbawada" },
    { label: "Hatkanangle", value: "Hatkanangle" },
    { label: "Kagal", value: "Kagal" },
    { label: "Karvir", value: "Karvir" },
    { label: "Panhala", value: "Panhala" },
    { label: "Radhanagari", value: "Radhanagari" },
    { label: "Shahuwadi", value: "Shahuwadi" },
    { label: "Shirol", value: "Shirol" },
  ],
  Latur: [
    { label: "Ahmadpur", value: "Ahmadpur" },
    { label: "Ausa", value: "Ausa" },
    { label: "Chakur", value: "Chakur" },
    { label: "Deoni", value: "Deoni" },
    { label: "Jalkot", value: "Jalkot" },
    { label: "Latur", value: "Latur" },
    { label: "Nilanga", value: "Nilanga" },
    { label: "Renapur", value: "Renapur" },
    { label: "Shirur Anantpal", value: "Shirur Anantpal" },
    { label: "Udgir", value: "Udgir" },
  ],
  Mumbai: [{ value: "Mumbai City", label: "Mumbai City" }],
  Nandurbar: [
    { label: "Akkalkuwa", value: "Akkalkuwa" },
    { label: "Akrani", value: "Akrani" },
    { label: "Nandurbar", value: "Nandurbar" },
    { label: "Nawapur", value: "Nawapur" },
    { label: "Shahade", value: "Shahade" },
    { label: "Talode", value: "Talode" },
  ],
  Nanded: [
    { label: "Ardhapur", value: "Ardhapur" },
    { label: "Bhokar", value: "Bhokar" },
    { label: "Biloli", value: "Biloli" },
    { label: "Deglur", value: "Deglur" },
    { label: "Dharmabad", value: "Dharmabad" },
    { label: "Hadgaon", value: "Hadgaon" },
    { label: "Himayatnagar", value: "Himayatnagar" },
    { label: "Kandhar", value: "Kandhar" },
    { label: "Kinwat", value: "Kinwat" },
    { label: "Loha", value: "Loha" },
    { label: "Mahur", value: "Mahur" },
    { label: "Mudkhed", value: "Mudkhed" },
    { label: "Mukhed", value: "Mukhed" },
    { label: "Naigaon (Khairgaon)", value: "Naigaon (Khairgaon)" },
    { label: "Nanded", value: "Nanded" },
    { label: "Umri", value: "Umri" },
  ],
  Nashik: [
    { label: "Baglan", value: "Baglan" },
    { label: "Chandvad", value: "Chandvad" },
    { label: "Deola", value: "Deola" },
    { label: "Dindori", value: "Dindori" },
    { label: "Igatpuri", value: "Igatpuri" },
    { label: "Kalwan", value: "Kalwan" },
    { label: "Malegaon", value: "Malegaon" },
    { label: "Nandgaon", value: "Nandgaon" },
    { label: "Nashik", value: "Nashik" },
    { label: "Niphad", value: "Niphad" },
    { label: "Peth", value: "Peth" },
    { label: "Sinnar", value: "Sinnar" },
    { label: "Surgana", value: "Surgana" },
    { label: "Trimbakeshwar", value: "Trimbakeshwar" },
    { label: "Yevla", value: "Yevla" },
  ],
  Osmanabad: [
    { label: "Bhum", value: "Bhum" },
    { label: "Dharashiv", value: "Dharashiv" },
    { label: "Kalamb", value: "Kalamb" },
    { label: "Lohara", value: "Lohara" },
    { label: "Omarga", value: "Omarga" },
    { label: "Paranda", value: "Paranda" },
    { label: "Tuljapur", value: "Tuljapur" },
    { label: "Washi", value: "Washi" },
  ],
  Palghar: [
    { label: "Dahanu", value: "Dahanu" },
    { label: "Jawhar", value: "Jawhar" },
    { label: "Mokhada", value: "Mokhada" },
    { label: "Palghar", value: "Palghar" },
    { label: "Talasari", value: "Talasari" },
    { label: "Vasai", value: "Vasai" },
    { label: "Vikramgad", value: "Vikramgad" },
    { label: "Wada", value: "Wada" },
  ],
  Parbhani: [
    { label: "Gangakhed", value: "Gangakhed" },
    { label: "Jintur", value: "Jintur" },
    { label: "Manwath", value: "Manwath" },
    { label: "Palam", value: "Palam" },
    { label: "Parbhani", value: "Parbhani" },
    { label: "Pathri", value: "Pathri" },
    { label: "Purna", value: "Purna" },
    { label: "Selu", value: "Selu" },
    { label: "Sonpeth", value: "Sonpeth" },
  ],
  Pune: [
    { label: "Ambegaon", value: "Ambegaon" },
    { label: "Baramati", value: "Baramati" },
    { label: "Bhor", value: "Bhor" },
    { label: "Daund", value: "Daund" },
    { label: "Haveli", value: "Haveli" },
    { label: "Indapur", value: "Indapur" },
    { label: "Junnar", value: "Junnar" },
    { label: "Khed", value: "Khed" },
    { label: "Mawal", value: "Mawal" },
    { label: "Mulshi", value: "Mulshi" },
    { label: "Pune City", value: "Pune City" },
    { label: "Purandhar", value: "Purandhar" },
    { label: "Shirur", value: "Shirur" },
    { label: "Velhe", value: "Velhe" },
  ],
  Raigad: [
    { label: "Alibag", value: "Alibag" },
    { label: "Karjat", value: "Karjat" },
    { label: "Khalapur", value: "Khalapur" },
    { label: "Mahad", value: "Mahad" },
    { label: "Mangaon", value: "Mangaon" },
    { label: "Mhasla", value: "Mhasla" },
    { label: "Murud", value: "Murud" },
    { label: "Panvel", value: "Panvel" },
    { label: "Pen", value: "Pen" },
    { label: "Poladpur", value: "Poladpur" },
    { label: "Roha", value: "Roha" },
    { label: "Shrivardhan", value: "Shrivardhan" },
    { label: "Sudhagad", value: "Sudhagad" },
    { label: "Tala", value: "Tala" },
    { label: "Uran", value: "Uran" },
  ],
  Ratnagiri: [
    { label: "Ratnagiri", value: "Ratnagiri" },
    { label: "Lanja", value: "Lanja" },
    { label: "Chiplun", value: "Chiplun" },
    { label: "Dapoli", value: "Dapoli" },
    { label: "Guhagar", value: "Guhagar" },
    { label: "Rajapur", value: "Rajapur" },
    { label: "Sangameshwar", value: "Sangameshwar" },
    { label: "Mandangad", value: "Mandangad" },
    { label: "Khed", value: "Khed" },
  ],
  Sangli: [
    { label: "Shirala", value: "Shirala" },
    { label: "Kadegaon", value: "Kadegaon" },
    { label: "Kavathemahankal", value: "Kavathemahankal" },
    { label: "Jat", value: "Jat" },
    { label: "Palus", value: "Palus" },
    { label: "Tasgaon", value: "Tasgaon" },
    { label: "Walwa", value: "Walwa" },
    { label: "Atpadi", value: "Atpadi" },
    { label: "Khanapur", value: "Khanapur" },
    { label: "Miraj", value: "Miraj" },
  ],
  Satara: [
    { label: "Patan", value: "Patan" },
    { label: "Phaltan", value: "Phaltan" },
    { label: "Koregaon", value: "Koregaon" },
    { label: "Karad", value: "Karad" },
    { label: "Mahabaleshwar", value: "Mahabaleshwar" },
    { label: "Khandala", value: "Khandala" },
    { label: "Wai", value: "Wai" },
    { label: "Satara", value: "Satara" },
    { label: "Jaoli", value: "Jaoli" },
    { label: "Man", value: "Man" },
    { label: "Khatav", value: "Khatav" },
  ],
  Sindhudurg: [
    { label: "Kudal", value: "Kudal" },
    { label: "Kankavli", value: "Kankavli" },
    { label: "Devgad", value: "Devgad" },
    { label: "Malwan", value: "Malwan" },
    { label: "Sawantwadi", value: "Sawantwadi" },
    { label: "Dodamarg", value: "Dodamarg" },
    { label: "Vaibhavvadi", value: "Vaibhavvadi" },
    { label: "Vengurla", value: "Vengurla" },
  ],
  Solapur: [
    { label: "Akkalkot", value: "Akkalkot" },
    { label: "Barshi", value: "Barshi" },
    { label: "Karmala", value: "Karmala" },
    { label: "Madha", value: "Madha" },
    { label: "Malshiras", value: "Malshiras" },
    { label: "Mangalvedhe", value: "Mangalvedhe" },
    { label: "Mohol", value: "Mohol" },
    { label: "Pandharpur", value: "Pandharpur" },
    { label: "Sangole", value: "Sangole" },
    { label: "Solapur North", value: "Solapur North" },
    { label: "Solapur South", value: "Solapur South" },
  ],
  Thane: [
    { label: "Ambarnath", value: "Ambarnath" },
    { label: "Bhiwandi", value: "Bhiwandi" },
    { label: "Kalyan", value: "Kalyan" },
    { label: "Murbad", value: "Murbad" },
    { label: "Shahapur", value: "Shahapur" },
    { label: "Thane", value: "Thane" },
    { label: "Ulhasnagar", value: "Ulhasnagar" },
  ],
  Wardha: [
    { label: "Arvi", value: "Arvi" },
    { label: "Ashti", value: "Ashti" },
    { label: "Deoli", value: "Deoli" },
    { label: "Hinganghat", value: "Hinganghat" },
    { label: "Karanja", value: "Karanja" },
    { label: "Samudrapur", value: "Samudrapur" },
    { label: "Seloo", value: "Seloo" },
    { label: "Wardha", value: "Wardha" },
  ],
  Washim: [
    { label: "Karanja", value: "Karanja" },
    { label: "Malegaon", value: "Malegaon" },
    { label: "Mangrulpir", value: "Mangrulpir" },
    { label: "Manora", value: "Manora" },
    { label: "Risod", value: "Risod" },
    { label: "Washim", value: "Washim" },
  ],
  Yavatmal: [
    { label: "Arni", value: "Arni" },
    { label: "Babulgaon", value: "Babulgaon" },
    { label: "Darwha", value: "Darwha" },
    { label: "Digras", value: "Digras" },
    { label: "Ghatanji", value: "Ghatanji" },
    { label: "Kalamb", value: "Kalamb" },
    { label: "Kelapur", value: "Kelapur" },
    { label: "Mahagaon", value: "Mahagaon" },
    { label: "Maregaon", value: "Maregaon" },
    { label: "Ner", value: "Ner" },
    { label: "Pusad", value: "Pusad" },
    { label: "Ralegaon", value: "Ralegaon" },
    { label: "Umarkhed", value: "Umarkhed" },
    { label: "Wani", value: "Wani" },
    { label: "Yavatmal", value: "Yavatmal" },
    { label: "Zari-Jamani", value: "Zari-Jamani" },
  ],
  Nagpur: [
    { label: "Bhiwapur", value: "Bhiwapur" },
    { label: "Hingna", value: "Hingna" },
    { label: "Kalameshwar", value: "Kalameshwar" },
    { label: "Kamptee", value: "Kamptee" },
    { label: "Katol", value: "Katol" },
    { label: "Kuhi", value: "Kuhi" },
    { label: "Mauda", value: "Mauda" },
    { label: "Nagpur (Rural)", value: "Nagpur (Rural)" },
    { label: "Nagpur (Urban)", value: "Nagpur (Urban)" },
    { label: "Narkhed", value: "Narkhed" },
    { label: "Parseoni", value: "Parseoni" },
    { label: "Ramtek", value: "Ramtek" },
    { label: "Savner", value: "Savner" },
    { label: "Umred", value: "Umred" },
  ],
};

const districtOptions = [
  {
    value: "Ahmednagar",
    label: "Ahmednagar",
    city: [
      { label: "Akole", value: "Akole" },
      { label: "Jamkhed", value: "Jamkhed" },
      { label: "Karjat", value: "Karjat" },
      { label: "Kopargaon", value: "Kopargaon" },
      { label: "Nagar", value: "Nagar" },
      { label: "Nevasa", value: "Nevasa" },
      { label: "Parner", value: "Parner" },
      { label: "Pathardi", value: "Pathardi" },
      { label: "Rahta", value: "Rahta" },
      { label: "Rahuri", value: "Rahuri" },
      { label: "Sangamner", value: "Sangamner" },
      { label: "Shevgaon", value: "Shevgaon" },
      { label: "Shrigonda", value: "Shrigonda" },
      { label: "Shrirampur", value: "Shrirampur" },
    ],
  },
  {
    value: "Akola",
    label: "Akola",
    city: [
      { label: "Akola", value: "Akola" },
      { label: "Akot", value: "Akot" },
      { label: "Balapur", value: "Balapur" },
      { label: "Barshitakli", value: "Barshitakli" },
      { label: "Murtijapur", value: "Murtijapur" },
      { label: "Patur", value: "Patur" },
      { label: "Telhara", value: "Telhara" },
    ],
  },
  {
    value: "Amravati",
    label: "Amravati",
    city: [
      { label: "Achalpur", value: "Achalpur" },
      { label: "Amravati", value: "Amravati" },
      { label: "Anjangaon Surji", value: "Anjangaon Surji" },
      { label: "Bhatkuli", value: "Bhatkuli" },
      { label: "Chandur Railway", value: "Chandur Railway" },
      { label: "Chandurbazar", value: "Chandurbazar" },
      { label: "Chikhaldara", value: "Chikhaldara" },
      { label: "Daryapur", value: "Daryapur" },
      { label: "Dhamangaon Railway", value: "Dhamangaon Railway" },
      { label: "Dharni", value: "Dharni" },
      { label: "Morshi", value: "Morshi" },
      { label: "Nandgaon-Khandeshwar", value: "Nandgaon-Khandeshwar" },
      { label: "Tiosa", value: "Tiosa" },
      { label: "Warud", value: "Warud" },
    ],
  },
  {
    value: "Aurangabad",
    label: "Aurangabad",
    city: [
      {
        label: "Chhatrapati Sambhajinagar",
        value: "Chhatrapati Sambhajinagar",
      },
      { label: "Gangapur", value: "Gangapur" },
      { label: "Kannad", value: "Kannad" },
      { label: "Khuldabad", value: "Khuldabad" },
      { label: "Paithan", value: "Paithan" },
      { label: "Phulambri", value: "Phulambri" },
      { label: "Sillod", value: "Sillod" },
      { label: "Soegaon", value: "Soegaon" },
      { label: "Vaijapur", value: "Vaijapur" },
    ],
  },
  {
    value: "Beed",
    label: "Beed",
    city: [
      { label: "Ambejogai", value: "Ambejogai" },
      { label: "Ashti", value: "Ashti" },
      { label: "Beed", value: "Beed" },
      { label: "Dharur", value: "Dharur" },
      { label: "Georai", value: "Georai" },
      { label: "Kaij", value: "Kaij" },
      { label: "Majalgaon", value: "Majalgaon" },
      { label: "Parli", value: "Parli" },
      { label: "Patoda", value: "Patoda" },
      { label: "Shirur (Kasar)", value: "Shirur (Kasar)" },
      { label: "Wadwani", value: "Wadwani" },
    ],
  },
  {
    value: "Bhandara",
    label: "Bhandara",
    city: [
      { label: "Bhandara", value: "Bhandara" },
      { label: "Lakhandur", value: "Lakhandur" },
      { label: "Lakhani", value: "Lakhani" },
      { label: "Mohadi", value: "Mohadi" },
      { label: "Pauni", value: "Pauni" },
      { label: "Sakoli", value: "Sakoli" },
      { label: "Tumsar", value: "Tumsar" },
    ],
  },
  {
    value: "Buldhana",
    label: "Buldhana",
    city: [
      { label: "Buldana", value: "Buldana" },
      { label: "Chikhli", value: "Chikhli" },
      { label: "Deolgaon Raja", value: "Deolgaon Raja" },
      { label: "Jalgaon (Jamod)", value: "Jalgaon (Jamod)" },
      { label: "Khamgaon", value: "Khamgaon" },
      { label: "Lonar", value: "Lonar" },
      { label: "Malkapur", value: "Malkapur" },
      { label: "Mehkar", value: "Mehkar" },
      { label: "Motala", value: "Motala" },
      { label: "Nandura", value: "Nandura" },
      { label: "Sangrampur", value: "Sangrampur" },
      { label: "Shegaon", value: "Shegaon" },
      { label: "Sindkhed Raja", value: "Sindkhed Raja" },
    ],
  },
  {
    value: "Chandrapur",
    label: "Chandrapur",
    city: [
      { label: "Ballarpur", value: "Ballarpur" },
      { label: "Bhadravati", value: "Bhadravati" },
      { label: "Brahmapuri", value: "Brahmapuri" },
      { label: "Chandrapur", value: "Chandrapur" },
      { label: "Chimur", value: "Chimur" },
      { label: "Gondpipri", value: "Gondpipri" },
      { label: "Jiwati", value: "Jiwati" },
      { label: "Korpana", value: "Korpana" },
      { label: "Mul", value: "Mul" },
      { label: "Nagbhid", value: "Nagbhid" },
      { label: "Pombhurna", value: "Pombhurna" },
      { label: "Rajura", value: "Rajura" },
      { label: "Sawali", value: "Sawali" },
      { label: "Sindewahi", value: "Sindewahi" },
      { label: "Warora", value: "Warora" },
    ],
  },
  {
    value: "Dhule",
    label: "Dhule",
    city: [
      { label: "Dhule", value: "Dhule" },
      { label: "Sakri", value: "Sakri" },
      { label: "Shirpur", value: "Shirpur" },
      { label: "Sindkhede", value: "Sindkhede" },
    ],
  },
  {
    value: "Gadchiroli",
    label: "Gadchiroli",
    city: [
      { label: "Aheri", value: "Aheri" },
      { label: "Armori", value: "Armori" },
      { label: "Bhamragad", value: "Bhamragad" },
      { label: "Chamorshi", value: "Chamorshi" },
      { label: "Desaiganj (Vadasa)", value: "Desaiganj (Vadasa)" },
      { label: "Dhanora", value: "Dhanora" },
      { label: "Etapalli", value: "Etapalli" },
      { label: "Gadchiroli", value: "Gadchiroli" },
      { label: "Korchi", value: "Korchi" },
      { label: "Kurkheda", value: "Kurkheda" },
      { label: "Mulchera", value: "Mulchera" },
      { label: "Sironcha", value: "Sironcha" },
    ],
  },
  {
    value: "Gondia",
    label: "Gondia",
    city: [
      { label: "Amgaon", value: "Amgaon" },
      { label: "Arjuni Morgaon", value: "Arjuni Morgaon" },
      { label: "Deori", value: "Deori" },
      { label: "Gondiya", value: "Gondiya" },
      { label: "Goregaon", value: "Goregaon" },
      { label: "Sadak-Arjuni", value: "Sadak-Arjuni" },
      { label: "Salekasa", value: "Salekasa" },
      { label: "Tirora", value: "Tirora" },
    ],
  },
  {
    value: "Hingoli",
    label: "Hingoli",
    city: [
      { label: "Aundha (Nagnath)", value: "Aundha (Nagnath)" },
      { label: "Hingoli", value: "Hingoli" },
      { label: "Kalamnuri", value: "Kalamnuri" },
      { label: "Sengaon", value: "Sengaon" },
      { label: "Vasmath", value: "Vasmath" },
    ],
  },
  {
    value: "Jalgaon",
    label: "Jalgaon",
    city: [
      { label: "Amalner", value: "Amalner" },
      { label: "Bhadgaon", value: "Bhadgaon" },
      { label: "Bhusawal", value: "Bhusawal" },
      { label: "Bodvad", value: "Bodvad" },
      { label: "Chalisgaon", value: "Chalisgaon" },
      { label: "Chopda", value: "Chopda" },
      { label: "Dharangaon", value: "Dharangaon" },
      { label: "Erandol", value: "Erandol" },
      { label: "Jalgaon", value: "Jalgaon" },
      { label: "Jamner", value: "Jamner" },
      { label: "Muktainagar (Edlabad)", value: "Muktainagar (Edlabad)" },
      { label: "Pachora", value: "Pachora" },
      { label: "Parola", value: "Parola" },
      { label: "Raver", value: "Raver" },
      { label: "Yawal", value: "Yawal" },
    ],
  },
  {
    value: "Jalna",
    label: "Jalna",
    city: [
      { label: "Ambad", value: "Ambad" },
      { label: "Badnapur", value: "Badnapur" },
      { label: "Bhokardan", value: "Bhokardan" },
      { label: "Ghansawangi", value: "Ghansawangi" },
      { label: "Jafrabad", value: "Jafrabad" },
      { label: "Jalna", value: "Jalna" },
      { label: "Mantha", value: "Mantha" },
      { label: "Partur", value: "Partur" },
    ],
  },
  {
    value: "Kolhapur",
    label: "Kolhapur",
    city: [
      { label: "Ajra", value: "Ajra" },
      { label: "Bhudargad", value: "Bhudargad" },
      { label: "Chandgad", value: "Chandgad" },
      { label: "Gadhinglaj", value: "Gadhinglaj" },
      { label: "Gaganbawada", value: "Gaganbawada" },
      { label: "Hatkanangle", value: "Hatkanangle" },
      { label: "Kagal", value: "Kagal" },
      { label: "Karvir", value: "Karvir" },
      { label: "Panhala", value: "Panhala" },
      { label: "Radhanagari", value: "Radhanagari" },
      { label: "Shahuwadi", value: "Shahuwadi" },
      { label: "Shirol", value: "Shirol" },
    ],
  },
  {
    value: "Latur",
    label: "Latur",
    city: [
      { label: "Ahmadpur", value: "Ahmadpur" },
      { label: "Ausa", value: "Ausa" },
      { label: "Chakur", value: "Chakur" },
      { label: "Deoni", value: "Deoni" },
      { label: "Jalkot", value: "Jalkot" },
      { label: "Latur", value: "Latur" },
      { label: "Nilanga", value: "Nilanga" },
      { label: "Renapur", value: "Renapur" },
      { label: "Shirur Anantpal", value: "Shirur Anantpal" },
      { label: "Udgir", value: "Udgir" },
    ],
  },
  {
    value: "Mumbai",
    label: "Mumbai",
    city: [{ value: "Mumbai City", label: "Mumbai City" }],
  },
  {
    value: "Mumbai Suburban",
    label: "Mumbai Suburban",
    city: [
      { label: "Andheri", value: "Andheri" },
      { label: "Borivali", value: "Borivali" },
      { label: "Kurla", value: "Kurla" },
    ],
  },
  {
    value: "Nandurbar",
    label: "Nandurbar",
    city: [
      { label: "Akkalkuwa", value: "Akkalkuwa" },
      { label: "Akrani", value: "Akrani" },
      { label: "Nandurbar", value: "Nandurbar" },
      { label: "Nawapur", value: "Nawapur" },
      { label: "Shahade", value: "Shahade" },
      { label: "Talode", value: "Talode" },
    ],
  },
  {
    value: "Nanded",
    label: "Nanded",
    city: [
      { label: "Ardhapur", value: "Ardhapur" },
      { label: "Bhokar", value: "Bhokar" },
      { label: "Biloli", value: "Biloli" },
      { label: "Deglur", value: "Deglur" },
      { label: "Dharmabad", value: "Dharmabad" },
      { label: "Hadgaon", value: "Hadgaon" },
      { label: "Himayatnagar", value: "Himayatnagar" },
      { label: "Kandhar", value: "Kandhar" },
      { label: "Kinwat", value: "Kinwat" },
      { label: "Loha", value: "Loha" },
      { label: "Mahur", value: "Mahur" },
      { label: "Mudkhed", value: "Mudkhed" },
      { label: "Mukhed", value: "Mukhed" },
      { label: "Naigaon (Khairgaon)", value: "Naigaon (Khairgaon)" },
      { label: "Nanded", value: "Nanded" },
      { label: "Umri", value: "Umri" },
    ],
  },
  {
    value: "Nashik",
    label: "Nashik",
    city: [
      { label: "Baglan", value: "Baglan" },
      { label: "Chandvad", value: "Chandvad" },
      { label: "Deola", value: "Deola" },
      { label: "Dindori", value: "Dindori" },
      { label: "Igatpuri", value: "Igatpuri" },
      { label: "Kalwan", value: "Kalwan" },
      { label: "Malegaon", value: "Malegaon" },
      { label: "Nandgaon", value: "Nandgaon" },
      { label: "Nashik", value: "Nashik" },
      { label: "Niphad", value: "Niphad" },
      { label: "Peth", value: "Peth" },
      { label: "Sinnar", value: "Sinnar" },
      { label: "Surgana", value: "Surgana" },
      { label: "Trimbakeshwar", value: "Trimbakeshwar" },
      { label: "Yevla", value: "Yevla" },
    ],
  },
  {
    value: "Osmanabad",
    label: "Osmanabad",
    city: [
      { label: "Bhum", value: "Bhum" },
      { label: "Dharashiv", value: "Dharashiv" },
      { label: "Kalamb", value: "Kalamb" },
      { label: "Lohara", value: "Lohara" },
      { label: "Omarga", value: "Omarga" },
      { label: "Paranda", value: "Paranda" },
      { label: "Tuljapur", value: "Tuljapur" },
      { label: "Washi", value: "Washi" },
    ],
  },
  {
    value: "Palghar",
    label: "Palghar",
    city: [
      { label: "Dahanu", value: "Dahanu" },
      { label: "Jawhar", value: "Jawhar" },
      { label: "Mokhada", value: "Mokhada" },
      { label: "Palghar", value: "Palghar" },
      { label: "Talasari", value: "Talasari" },
      { label: "Vasai", value: "Vasai" },
      { label: "Vikramgad", value: "Vikramgad" },
      { label: "Wada", value: "Wada" },
    ],
  },
  {
    value: "Parbhani",
    label: "Parbhani",
    city: [
      { label: "Gangakhed", value: "Gangakhed" },
      { label: "Jintur", value: "Jintur" },
      { label: "Manwath", value: "Manwath" },
      { label: "Palam", value: "Palam" },
      { label: "Parbhani", value: "Parbhani" },
      { label: "Pathri", value: "Pathri" },
      { label: "Purna", value: "Purna" },
      { label: "Selu", value: "Selu" },
      { label: "Sonpeth", value: "Sonpeth" },
    ],
  },
  {
    value: "Pune",
    label: "Pune",
    city: [
      { label: "Ambegaon", value: "Ambegaon" },
      { label: "Baramati", value: "Baramati" },
      { label: "Bhor", value: "Bhor" },
      { label: "Daund", value: "Daund" },
      { label: "Haveli", value: "Haveli" },
      { label: "Indapur", value: "Indapur" },
      { label: "Junnar", value: "Junnar" },
      { label: "Khed", value: "Khed" },
      { label: "Mawal", value: "Mawal" },
      { label: "Mulshi", value: "Mulshi" },
      { label: "Pune City", value: "Pune City" },
      { label: "Purandhar", value: "Purandhar" },
      { label: "Shirur", value: "Shirur" },
      { label: "Velhe", value: "Velhe" },
    ],
  },
  {
    value: "Raigad",
    label: "Raigad",
    city: [
      { label: "Alibag", value: "Alibag" },
      { label: "Karjat", value: "Karjat" },
      { label: "Khalapur", value: "Khalapur" },
      { label: "Mahad", value: "Mahad" },
      { label: "Mangaon", value: "Mangaon" },
      { label: "Mhasla", value: "Mhasla" },
      { label: "Murud", value: "Murud" },
      { label: "Panvel", value: "Panvel" },
      { label: "Pen", value: "Pen" },
      { label: "Poladpur", value: "Poladpur" },
      { label: "Roha", value: "Roha" },
      { label: "Shrivardhan", value: "Shrivardhan" },
      { label: "Sudhagad", value: "Sudhagad" },
      { label: "Tala", value: "Tala" },
      { label: "Uran", value: "Uran" },
    ],
  },
  {
    value: "Ratnagiri",
    label: "Ratnagiri",
    city: [
      { label: "Ratnagiri", value: "Ratnagiri" },
      { label: "Lanja", value: "Lanja" },
      { label: "Chiplun", value: "Chiplun" },
      { label: "Dapoli", value: "Dapoli" },
      { label: "Guhagar", value: "Guhagar" },
      { label: "Rajapur", value: "Rajapur" },
      { label: "Sangameshwar", value: "Sangameshwar" },
      { label: "Mandangad", value: "Mandangad" },
      { label: "Khed", value: "Khed" },
    ],
  },
  {
    value: "Sangli",
    label: "Sangli",
    city: [
      { label: "Shirala", value: "Shirala" },
      { label: "Kadegaon", value: "Kadegaon" },
      { label: "Kavathemahankal", value: "Kavathemahankal" },
      { label: "Jat", value: "Jat" },
      { label: "Palus", value: "Palus" },
      { label: "Tasgaon", value: "Tasgaon" },
      { label: "Walwa", value: "Walwa" },
      { label: "Atpadi", value: "Atpadi" },
      { label: "Khanapur", value: "Khanapur" },
      { label: "Miraj", value: "Miraj" },
    ],
  },
  {
    value: "Satara",
    label: "Satara",
    city: [
      { label: "Patan", value: "Patan" },
      { label: "Phaltan", value: "Phaltan" },
      { label: "Koregaon", value: "Koregaon" },
      { label: "Karad", value: "Karad" },
      { label: "Mahabaleshwar", value: "Mahabaleshwar" },
      { label: "Khandala", value: "Khandala" },
      { label: "Wai", value: "Wai" },
      { label: "Satara", value: "Satara" },
      { label: "Jaoli", value: "Jaoli" },
      { label: "Man", value: "Man" },
      { label: "Khatav", value: "Khatav" },
    ],
  },
  {
    value: "Sindhudurg",
    label: "Sindhudurg",
    city: [
      { label: "Kudal", value: "Kudal" },
      { label: "Kankavli", value: "Kankavli" },
      { label: "Devgad", value: "Devgad" },
      { label: "Malwan", value: "Malwan" },
      { label: "Sawantwadi", value: "Sawantwadi" },
      { label: "Dodamarg", value: "Dodamarg" },
      { label: "Vaibhavvadi", value: "Vaibhavvadi" },
      { label: "Vengurla", value: "Vengurla" },
    ],
  },
  {
    value: "Solapur",
    label: "Solapur",
    city: [
      { label: "Akkalkot", value: "Akkalkot" },
      { label: "Barshi", value: "Barshi" },
      { label: "Karmala", value: "Karmala" },
      { label: "Madha", value: "Madha" },
      { label: "Malshiras", value: "Malshiras" },
      { label: "Mangalvedhe", value: "Mangalvedhe" },
      { label: "Mohol", value: "Mohol" },
      { label: "Pandharpur", value: "Pandharpur" },
      { label: "Sangole", value: "Sangole" },
      { label: "Solapur North", value: "Solapur North" },
      { label: "Solapur South", value: "Solapur South" },
    ],
  },
  {
    value: "Thane",
    label: "Thane",
    city: [
      { label: "Ambarnath", value: "Ambarnath" },
      { label: "Bhiwandi", value: "Bhiwandi" },
      { label: "Kalyan", value: "Kalyan" },
      { label: "Murbad", value: "Murbad" },
      { label: "Shahapur", value: "Shahapur" },
      { label: "Thane", value: "Thane" },
      { label: "Ulhasnagar", value: "Ulhasnagar" },
    ],
  },
  {
    value: "Wardha",
    label: "Wardha",
    city: [
      { label: "Arvi", value: "Arvi" },
      { label: "Ashti", value: "Ashti" },
      { label: "Deoli", value: "Deoli" },
      { label: "Hinganghat", value: "Hinganghat" },
      { label: "Karanja", value: "Karanja" },
      { label: "Samudrapur", value: "Samudrapur" },
      { label: "Seloo", value: "Seloo" },
      { label: "Wardha", value: "Wardha" },
    ],
  },
  {
    value: "Washim",
    label: "Washim",
    city: [
      { label: "Karanja", value: "Karanja" },
      { label: "Malegaon", value: "Malegaon" },
      { label: "Mangrulpir", value: "Mangrulpir" },
      { label: "Manora", value: "Manora" },
      { label: "Risod", value: "Risod" },
      { label: "Washim", value: "Washim" },
    ],
  },
  {
    value: "Yavatmal",
    label: "Yavatmal",
    city: [
      { label: "Arni", value: "Arni" },
      { label: "Babulgaon", value: "Babulgaon" },
      { label: "Darwha", value: "Darwha" },
      { label: "Digras", value: "Digras" },
      { label: "Ghatanji", value: "Ghatanji" },
      { label: "Kalamb", value: "Kalamb" },
      { label: "Kelapur", value: "Kelapur" },
      { label: "Mahagaon", value: "Mahagaon" },
      { label: "Maregaon", value: "Maregaon" },
      { label: "Ner", value: "Ner" },
      { label: "Pusad", value: "Pusad" },
      { label: "Ralegaon", value: "Ralegaon" },
      { label: "Umarkhed", value: "Umarkhed" },
      { label: "Wani", value: "Wani" },
      { label: "Yavatmal", value: "Yavatmal" },
      { label: "Zari-Jamani", value: "Zari-Jamani" },
    ],
  },
  {
    value: "Nagpur",
    label: "Nagpur",
    city: [
      { label: "Bhiwapur", value: "Bhiwapur" },
      { label: "Hingna", value: "Hingna" },
      { label: "Kalameshwar", value: "Kalameshwar" },
      { label: "Kamptee", value: "Kamptee" },
      { label: "Katol", value: "Katol" },
      { label: "Kuhi", value: "Kuhi" },
      { label: "Mauda", value: "Mauda" },
      { label: "Nagpur (Rural)", value: "Nagpur (Rural)" },
      { label: "Nagpur (Urban)", value: "Nagpur (Urban)" },
      { label: "Narkhed", value: "Narkhed" },
      { label: "Parseoni", value: "Parseoni" },
      { label: "Ramtek", value: "Ramtek" },
      { label: "Savner", value: "Savner" },
      { label: "Umred", value: "Umred" },
    ],
  },
];

  return { districtCityMap, districtOptions };
};

  
  
}

const databaseService = new DatabaseService();
export default databaseService;