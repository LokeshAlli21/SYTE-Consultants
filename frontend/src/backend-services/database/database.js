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
  
  async uploadPromoterData(formData) {
    try {
      console.log('Original formData:', formData);
  
      const fileFormData = new FormData();
      const fieldsToUpload = [];
  
      const promoterName = formData.promoter_name?.replace(/\s+/g, '_') || 'UnknownPromoter';
      const timestamp = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD_HH-mm-ss");
  
      for (const key in formData) {
        const file = formData[key];
        if (key.endsWith('_uploaded_url') && file instanceof File) {
          // Skip if file is null or undefined
          if (!file) continue;
  
          let identifier = "NoIdentifier";
  
          if (key === "pan_uploaded_url") {
            identifier = formData.pan_number || "NoPAN";
          } else if (key === "aadhar_uploaded_url") {
            identifier = formData.aadhar_number || "NoAadhar";
          } else if (key === "partnership_pan_uploaded_url") {
            identifier = formData.partnership_pan_number || "NoPartnershipPAN";
          } else if (key === "company_pan_uploaded_url") {
            identifier = formData.company_pan_number || "NoCompanyPAN";
          } else if (key === "company_incorporation_uploaded_url") {
            identifier = formData.company_incorporation_number || "NoIncorpNumber";
          } else if (key === "promoter_photo_uploaded_url") {
            identifier = "";
          }
  
          const extension = file.name?.split('.').pop() || 'pdf';
          const renamedFile = new File(
            [file],
            `${promoterName}_${identifier}_${timestamp}.${extension}`,
            { type: file.type }
          );
  
          fileFormData.append(key, renamedFile);
          fieldsToUpload.push(key);
        }
      }
  
      if (fieldsToUpload.length > 0) {
        const fileUploadRes = await fetch(`${this.baseUrl}/api/promoters/upload-files`, {
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
  
      console.log("Final formData to submit:", formData);
  
      const response = await fetch(`${this.baseUrl}/api/promoters/add-promoter`, {
        method: "POST",
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Promoter data submission failed.");
      }
  
      const data = await response.json();
      toast.success("✅ Promoter data uploaded successfully!");
      return data;
  
    } catch (error) {
      console.error("❌ Error uploading promoter data:", error);
      toast.error(`❌ ${error.message}`);
      throw error;
    }
  }

  async updatePromoter(id, formData) {
    try {
      console.log('Original formData for update:', formData);
  
      const fileFormData = new FormData();
      const fieldsToUpload = [];
  
      const promoterName = formData.promoter_name?.replace(/\s+/g, '_') || 'UnknownPromoter';
      const timestamp = dayjs().tz("Asia/Kolkata").format("YYYY-MM-DD_HH-mm-ss");
  
      for (const key in formData) {
        const file = formData[key];
        if (key.endsWith('_uploaded_url') && file instanceof File) {
          if (!file) continue;
  
          let identifier = "NoIdentifier";
  
          if (key === "pan_uploaded_url") {
            identifier = formData.pan_number || "NoPAN";
          } else if (key === "aadhar_uploaded_url") {
            identifier = formData.aadhar_number || "NoAadhar";
          } else if (key === "partnership_pan_uploaded_url") {
            identifier = formData.partnership_pan_number || "NoPartnershipPAN";
          } else if (key === "company_pan_uploaded_url") {
            identifier = formData.company_pan_number || "NoCompanyPAN";
          } else if (key === "company_incorporation_uploaded_url") {
            identifier = formData.company_incorporation_number || "NoIncorpNumber";
          } else if (key === "promoter_photo_uploaded_url") {
            identifier = "";
          }
  
          const extension = file.name?.split('.').pop() || 'pdf';
          const renamedFile = new File(
            [file],
            `${promoterName}_${identifier}_${timestamp}.${extension}`,
            { type: file.type }
          );
  
          fileFormData.append(key, renamedFile);
          fieldsToUpload.push(key);
        }
      }
  
      if (fieldsToUpload.length > 0) {
        const fileUploadRes = await fetch(`${this.baseUrl}/api/promoters/upload-files`, {
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
  
      console.log("Final formData for update:", formData);
  
      const response = await fetch(`${this.baseUrl}/api/promoters/update/${id}`, {
        method: "PUT",
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });
  
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Promoter update failed.");
      }
  
      const data = await response.json();
      toast.success("✅ Promoter updated successfully!");
      return data;
    } catch (err) {
      console.error("❌ Error updating Promoter:", err);
      toast.error(`❌ ${err.message}`);
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
      toast.success("✅ Promoter details fetched successfully!");
      return data.promoter;
  
    } catch (error) {
      console.error("❌ Error fetching promoter details:", error);
      toast.error(`❌ ${error.message}`);
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
      toast.success("✅ Promoters fetched successfully!");
      return data.promoters;
  
    } catch (error) {
      console.error("❌ Error fetching promoters:", error);
      toast.error(`❌ ${error.message}`);
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
      toast.success("✅ Promoters fetched successfully!");
  
      // Map to label/value format for react-select or dropdowns
      const dropdownOptions = data.promoters.map((promoter) => ({
        label: promoter.promoter_name,
        value: promoter.id,
      }));
  
      return dropdownOptions;
  
    } catch (error) {
      console.error("❌ Error fetching promoters:", error);
      toast.error(`❌ ${error.message}`);
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
  
      toast.success("✅ Promoter deleted successfully!");
      return true;
  
    } catch (error) {
      console.error("❌ Error deleting promoter:", error);
      toast.error(`❌ ${error.message}`);
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
      toast.success("✅ Project data uploaded successfully!");
      return data;
  
    } catch (error) {
      console.error("❌ Error uploading project data:", error);
      toast.error(`❌ ${error.message}`);
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
      toast.success("✅ Project details fetched successfully!");
      return data.project;
    } catch (error) {
      console.error("❌ Error fetching project details:", error);
      toast.error(`❌ ${error.message}`);
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
      toast.success("✅ Project data updated successfully!");
      return data;
  
    } catch (error) {
      console.error("❌ Error updating project data:", error);
      toast.error(`❌ ${error.message}`);
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
  
      toast.success("✅ Project deleted successfully!");
      return true;
  
    } catch (error) {
      console.error("❌ Error deleting project:", error);
      toast.error(`❌ ${error.message}`);
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
    toast.success("✅ Project professional details uploaded successfully!");
    return data;

  } catch (error) {
    console.error("❌ Error uploading professional details:", error);
    toast.error(`❌ ${error.message}`);
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
    toast.success("✅ Project professional data fetched successfully!");
    return data.professionalData;

  } catch (error) {
    console.error("❌ Error fetching project professional data:", error);
    toast.error(`❌ ${error.message}`);
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
    // toast.success("✅ Engineers fetched successfully!");
    return data.engineers;

  } catch (error) {
    console.error("❌ Error fetching engineers:", error);
    toast.error(`❌ ${error.message}`);
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
    // toast.success("✅ Architects fetched successfully!");
    return data.architects;

  } catch (error) {
    console.error("❌ Error fetching architects:", error);
    toast.error(`❌ ${error.message}`);
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
    // toast.success("✅ CAs fetched successfully!");
    return data.cas;

  } catch (error) {
    console.error("❌ Error fetching CAs:", error);
    toast.error(`❌ ${error.message}`);
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
    toast.success("✅ Project unit details uploaded successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error uploading unit details:", err);
    toast.error(`❌ ${err.message}`);
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
    toast.success("✅ Project unit details updated successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error updating unit details:", err);
    toast.error(`❌ ${err.message}`);
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
    toast.success("✅ Unit details fetched successfully!");
    return data.unit;
  } catch (error) {
    console.error("❌ Error fetching unit details:", error);
    toast.error(`❌ ${error.message}`);
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
    toast.success("✅ Units fetched successfully!");
    return data.units;

  } catch (error) {
    console.error("❌ Error fetching units:", error);
    toast.error(`❌ ${error.message}`);
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
  
    toast.success("✅ Unit deleted successfully!");
    return true;
  
  } catch (error) {
    console.error("❌ Error deleting unit:", error);
    toast.error(`❌ ${error.message}`);
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
    toast.success("✅ Project documents uploaded successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error uploading documents:", err);
    toast.error(`❌ ${err.message}`);
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
    // toast.success("✅ Project documents fetched successfully!");
    return data.documents;

  } catch (error) {
    // console.error("❌ Error fetching project documents:", error);

    // Show user-friendly error message
    if (error.message === "No documents found for this project.") {
      // toast.error("❌ No documents found for this project.");
    } else {
      // toast.error(`❌ ${error.message}`);
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

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Building progress submission failed.");
    }

    const data = await response.json();
    toast.success("✅ Project building progress uploaded successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error uploading building progress:", err);
    toast.error(`❌ ${err.message}`);
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
    toast.success("✅ Project common areas progress uploaded successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error uploading common areas progress:", err);
    toast.error(`❌ ${err.message}`);
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
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch site progress.");
    }

    const data = await response.json();
    toast.success("✅ Project site progress fetched successfully!");
    return data.siteProgress;
  } catch (error) {
    console.error("❌ Error fetching site progress:", error);
    toast.error(`❌ ${error.message}`);
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
    toast.success("✅ Projects fetched successfully!");
    return data.projects;

  } catch (error) {
    console.error("❌ Error fetching promoters:", error);
    toast.error(`❌ ${error.message}`);
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
    toast.success("✅ Projects fetched successfully!");

    // Map to label/value format for react-select
    const dropdownOptions = data.projects.map((project) => ({
      label: project.project_name,
      value: project.id,
    }));

    return dropdownOptions;

  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    toast.error(`❌ ${error.message}`);
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
    toast.success("✅ Channel Partner created successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error creating Channel Partner:", err);
    toast.error(`❌ ${err.message}`);
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
    toast.success("✅ Channel Partner updated successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error updating Channel Partner:", err);
    toast.error(`❌ ${err.message}`);
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
    toast.success("✅ Channel partners fetched successfully!");
    return data.channelPartners;

  } catch (error) {
    console.error("❌ Error fetching channel partners:", error);
    toast.error(`❌ ${error.message}`);
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
    toast.success("✅ Channel Partner details fetched successfully!");
    return data.channelPartner; // assuming your API returns { channel_partner: {...} }

  } catch (error) {
    console.error("❌ Error fetching channel partner details:", error);
    toast.error(`❌ ${error.message}`);
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
    toast.success("✅ Channel partners fetched successfully!");

    // Map to label/value format for react-select
    const dropdownOptions = data.channelPartners.map((partner) => ({
      label: partner.full_name,
      value: partner.id,
    }));

    return dropdownOptions;

  } catch (error) {
    console.error("❌ Error fetching channel partners:", error);
    toast.error(`❌ ${error.message}`);
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

    toast.success("✅ Channel Partner deleted successfully!");
    return true;

  } catch (error) {
    console.error("❌ Error deleting channel partner:", error);
    toast.error(`❌ ${error.message}`);
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
    toast.success("✅ Assignment created successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error creating assignment:", err);
    toast.error(`❌ ${err.message}`);
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
    
    toast.success("✅ Assignment details fetched successfully!");
    return data.assignment; // assuming your API returns { assignment: {...} }

  } catch (error) {
    console.error("❌ Error fetching assignment details:", error);
    toast.error(`❌ ${error.message}`);
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
    toast.success("✅ Assignments fetched successfully!");
    return data.assignments;

  } catch (error) {
    console.error("❌ Error fetching assignments:", error);
    toast.error(`❌ ${error.message}`);
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
    toast.success("✅ Assignment updated successfully!");
    return data;
  } catch (err) {
    console.error("❌ Error updating Assignment:", err);
    toast.error(`❌ ${err.message}`);
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

    toast.success("✅ Assignment deleted successfully!");
    return true;

  } catch (error) {
    console.error("❌ Error deleting assignment:", error);
    toast.error(`❌ ${error.message}`);
    throw error;
  }
}



 
// CitiesAndDistricts

async getAllCitiesAndDistricts ()  {
  const cityOptions = [
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Pune', label: 'Pune' },
    { value: 'Nagpur', label: 'Nagpur' },
    { value: 'Thane', label: 'Thane' },
    { value: 'Navi Mumbai', label: 'Navi Mumbai' },
    { value: 'Kalyan-Dombivli', label: 'Kalyan-Dombivli' },
    { value: 'Vasai-Virar', label: 'Vasai-Virar' },
    { value: 'Aurangabad', label: 'Aurangabad' },
    { value: 'Solapur', label: 'Solapur' },
    { value: 'Nashik', label: 'Nashik' },
    { value: 'Amravati', label: 'Amravati' },
    { value: 'Kolhapur', label: 'Kolhapur' },
    { value: 'Jalgaon', label: 'Jalgaon' },
    { value: 'Malegaon', label: 'Malegaon' },
    { value: 'Sangli', label: 'Sangli' },
    { value: 'Ulhasnagar', label: 'Ulhasnagar' },
    { value: 'Ichalkaranji', label: 'Ichalkaranji' },
    { value: 'Akola', label: 'Akola' },
    { value: 'Latur', label: 'Latur' },
    { value: 'Dhule', label: 'Dhule' },
    { value: 'Beed', label: 'Beed' },
    { value: 'Chandrapur', label: 'Chandrapur' },
    { value: 'Parbhani', label: 'Parbhani' },
    { value: 'Jalna', label: 'Jalna' },
    { value: 'Ambarnath', label: 'Ambarnath' },
    { value: 'Bhiwandi', label: 'Bhiwandi' },
    { value: 'Mira-Bhayandar', label: 'Mira-Bhayandar' },
    { value: 'Badlapur', label: 'Badlapur' },
    { value: 'Barshi', label: 'Barshi' },
    { value: 'Yavatmal', label: 'Yavatmal' },
    { value: 'Achalpur', label: 'Achalpur' },
    { value: 'Osmanabad', label: 'Osmanabad' },
    { value: 'Nandurbar', label: 'Nandurbar' },
    { value: 'Wardha', label: 'Wardha' },
    { value: 'Udgir', label: 'Udgir' },
    { value: 'Hinganghat', label: 'Hinganghat' }
  ];

  const districtOptions = [
    { value: 'Ahmednagar', label: 'Ahmednagar' },
    { value: 'Akola', label: 'Akola' },
    { value: 'Amravati', label: 'Amravati' },
    { value: 'Aurangabad', label: 'Aurangabad' },
    { value: 'Beed', label: 'Beed' },
    { value: 'Bhandara', label: 'Bhandara' },
    { value: 'Buldhana', label: 'Buldhana' },
    { value: 'Chandrapur', label: 'Chandrapur' },
    { value: 'Dhule', label: 'Dhule' },
    { value: 'Gadchiroli', label: 'Gadchiroli' },
    { value: 'Gondia', label: 'Gondia' },
    { value: 'Hingoli', label: 'Hingoli' },
    { value: 'Jalgaon', label: 'Jalgaon' },
    { value: 'Jalna', label: 'Jalna' },
    { value: 'Kolhapur', label: 'Kolhapur' },
    { value: 'Latur', label: 'Latur' },
    { value: 'Mumbai City', label: 'Mumbai City' },
    { value: 'Mumbai Suburban', label: 'Mumbai Suburban' },
    { value: 'Nandurbar', label: 'Nandurbar' },
    { value: 'Nanded', label: 'Nanded' },
    { value: 'Nashik', label: 'Nashik' },
    { value: 'Osmanabad', label: 'Osmanabad' },
    { value: 'Palghar', label: 'Palghar' },
    { value: 'Parbhani', label: 'Parbhani' },
    { value: 'Pune', label: 'Pune' },
    { value: 'Raigad', label: 'Raigad' },
    { value: 'Ratnagiri', label: 'Ratnagiri' },
    { value: 'Sangli', label: 'Sangli' },
    { value: 'Satara', label: 'Satara' },
    { value: 'Sindhudurg', label: 'Sindhudurg' },
    { value: 'Solapur', label: 'Solapur' },
    { value: 'Thane', label: 'Thane' },
    { value: 'Wardha', label: 'Wardha' },
    { value: 'Washim', label: 'Washim' },
    { value: 'Yavatmal', label: 'Yavatmal' },
    { value: 'Nagpur', label: 'Nagpur' }
  ];

  return { cityOptions, districtOptions };
};

  
  
}

const databaseService = new DatabaseService();
export default databaseService;