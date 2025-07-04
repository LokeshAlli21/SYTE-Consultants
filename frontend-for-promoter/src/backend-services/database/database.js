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

}

const databaseService = new DatabaseService();
export default databaseService;