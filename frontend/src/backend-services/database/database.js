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
  
  
}

const databaseService = new DatabaseService();
export default databaseService;