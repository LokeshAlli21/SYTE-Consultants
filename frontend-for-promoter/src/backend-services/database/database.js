import env from '../../env/env';
import { toast } from "react-toastify";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import {authenticatedFetch} from '../fetchWrapper';

dayjs.extend(utc);
dayjs.extend(timezone);

class DatabaseService {
  constructor() {
    this.baseUrl = env.backendUrl;
  }

  // ✅ Utility to get token
  getAuthHeaders(skipContentType = false) {
    const token = localStorage.getItem('authTokenForPromoter');
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
    console.log('response status:', response.status);
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authTokenForPromoter');
      toast("Session expired. Please log in again.");
      const navigate = getNavigate();
      if (navigate) {
        navigate("/login");
      } else {
        window.location.href = "/login"; // fallback
      }
    }

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  }

async getChannelPartnerByPromoterId(promoterId) {
  // console.log("🔍 Fetching channel partner by promoter ID...");

  try {
    const response = await authenticatedFetch(`${this.baseUrl}/api/for-promoter-frontend/get-cp-by-promoter/${promoterId}`, {
      method: "GET",
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Fetching channel partner failed.");
    }

    const data = await this.handleResponse(response);
    // toast.success("🔍 Channel partner fetched successfully!");
    console.log("Fetched channel partner:", data);
    return data.channelPartner;
  } catch (err) {
    console.error("❌ Error fetching channel partner:", err);
    // toast.error(`❌ ${err.message}`);
    throw err;
  }
}

async getPromoterProjects(promoterId) {
  // console.log("🔍 Fetching projects for promoter ID:", promoterId);

  try {
    const response = await authenticatedFetch(`${this.baseUrl}/api/for-promoter-frontend/get-projects-by-promoter/${promoterId}`, {
      method: "GET",
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Fetching projects failed.");
    }

    const data = await this.handleResponse(response);
    // toast.success("🔍 Projects fetched successfully!");
    console.log("Fetched projects:", data);
    return data;
  } catch (err) {
    console.error("❌ Error fetching projects:", err);
    // toast.error(`❌ ${err.message}`);
    throw err;
  } 
}

async getProjectById(projectId) {
  try {
    const response = await authenticatedFetch(`${this.baseUrl}/api/for-promoter-frontend/get-project/${projectId}`, {
      method: "GET",
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Fetching project failed.");
    }

    const data = await this.handleResponse(response);
    // console.log("Fetched project:", data);
    return data.project;
  } catch (err) {
    console.error("❌ Error fetching project:", err);
    throw err;
  }
}

async getProjectDocuments(projectId) {
  try {
    const response = await authenticatedFetch(`${this.baseUrl}/api/for-promoter-frontend/get-project-documents/${projectId}`, {
      method: "GET",
      headers: this.getAuthHeaders()
    });

    if(response.status === 404) {
      console.warn("No documents found for project ID:", projectId);
      return { documents: [] }; // Return empty array if no documents found
    }

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Fetching project documents failed.");
    }

    const data = await this.handleResponse(response);
    // console.log("Fetched project documents:", data);
    return data.documents;
  } catch (err) {
    console.error("❌ Error fetching project documents:", err);
    throw err;
  }

}

async getProjectUnits(projectId) {
  try {
    const response = await authenticatedFetch(`${this.baseUrl}/api/for-promoter-frontend/get-project-units/${projectId}`, {
      method: "GET",
      headers: this.getAuthHeaders()
    });

    if (response.status === 404) {
      console.warn("No units found for project ID:", projectId);
      return { units: [] }; // Return empty array if no units found
    }

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Fetching project units failed.");
    }

    const data = await this.handleResponse(response);
    // console.log("Fetched project units:", data);
    return data.units;
  } catch (err) {
    console.error("❌ Error fetching project units:", err);
    throw err;
  }
}


}

const databaseService = new DatabaseService();
export default databaseService;