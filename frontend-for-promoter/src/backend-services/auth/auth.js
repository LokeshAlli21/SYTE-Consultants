import env from '../../env/env';
import { toast } from "react-toastify";

class AuthService {
  constructor() {
    this.baseUrl = env.backendUrl;
  }

   async promoterLogin({ username, password }) {
    if (!username) {
      toast.warn("📧 Username is required to login.");
      console.log("Username is not available for login");
      return;
    }
    if (!password) {
      toast.warn("🔒 Password is required to login.");
      console.log("Password is not available for login");
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/auth/promoter/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      console.log("data at promoterLogin service in auth.js :: data:",data);

      if (!response.ok) {
        toast.error("🚫 Invalid credentials. Please try again.");
        throw new Error("Invalid credentials");
      }

      localStorage.removeItem("authToken"); // Clear any previous auth token for consultant
      localStorage.setItem("authTokenForPromoter", data?.user?.token);
      toast.success(`Welcome back! Logged in successfully.`);
      return data;

    } catch (error) {
      console.error("AuthService promoterLogin Error:", error);
      throw error;
    }
  }

  // Get Current Promoter
  async getCurrentPromoter() {
    try {
      const token = localStorage.getItem("authTokenForPromoter");

      if (!token) {
        toast.info("You are not logged in. Please log in first.");
        return null;
      }

      const response = await fetch(`${this.baseUrl}/api/auth/promoter`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if(localStorage.getItem("authTokenForPromoter")) {
          toast("🚫 Session Expired. Please log in again.");
        }
        throw new Error("Unauthorized");
      }

      const data = await response.json();
      return data.promoter;

    } catch (error) {
      console.error("AuthService GetPromoter Error:", error);
      return null;
    }
  }

  // Logout User
  async logout() {
    try {
      localStorage.removeItem("authTokenForPromoter");
      toast.info("👋 Logged out successfully.");
      return { message: "Logged out successfully" };
    } catch (error) {
      console.error("AuthService Logout Error:", error);
      toast.error("🚫 Error while logging out. Try again.");
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;