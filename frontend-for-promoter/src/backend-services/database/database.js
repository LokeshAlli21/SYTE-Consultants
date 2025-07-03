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

async getChannelPartnerByPromoterId(promoterId) {
  // console.log("🔍 Fetching channel partner by promoter ID...");

  try {
    const response = await fetch(`${this.baseUrl}/api/for-promoter-frontend/get-cp-by-promoter/${promoterId}`, {
      method: "GET",
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Fetching channel partner failed.");
    }

    const data = await response.json();
    // toast.success("🔍 Channel partner fetched successfully!");
    console.log("Fetched channel partner:", data);
    return data.channelPartner;
  } catch (err) {
    console.error("❌ Error fetching channel partner:", err);
    // toast.error(`❌ ${err.message}`);
    throw err;
  }
}

}

const databaseService = new DatabaseService();
export default databaseService;