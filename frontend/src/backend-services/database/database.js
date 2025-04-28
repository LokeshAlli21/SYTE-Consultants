import env from '../../env/env';
import { toast } from "react-toastify";

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

  // ✅ Get all profiles // withot login ///////////////////////////////////////////////////////////////////////////////////////
  // ✅ Get all profiles (No Auth) with optional filters
  async getAllProfiles(filters = {}) {
    try {
      const query = new URLSearchParams();

      // Build query string only for non-empty values
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query.append(key, value);
      });

      const response = await fetch(
        `${this.baseUrl}/api/no-auth/profiles?${query.toString()}`
      );

      const data = await this.handleResponse(response);
      toast.success("✅ Profiles loaded successfully!");
      return data;

    } catch (error) {
      toast.error(`🚨 Failed to load profiles: ${error.message}`);
      throw error;
    }
  }
  async getAllProfilesWithAuth(id) {
    try {

      const response = await fetch(
        `${this.baseUrl}/api/profiles/get-profiles?id=${id}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      const data = await this.handleResponse(response);
      toast.success("✅ Profiles loaded successfully!");
      return data;

    } catch (error) {
      toast.error(`🚨 Failed to load profiles: ${error.message}`);
      throw error;
    }
  }

  async getProfilesForSuperAdmin(id) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/super-admin/get-profiles?id=${id}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (response.status === 403) {
        throw new Error("Access denied. Only Super Admins can view profiles.");
      }
  
      const data = await this.handleResponse(response);
      toast.success("✅ Profiles loaded successfully (Super Admin)!");
      return data;
  
    } catch (error) {
      toast.error(`🚨 Failed to load super admin profiles: ${error.message}`);
      throw error;
    }
  }
  
  async getUserRole(id) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/super-admin/get-user-role?id=${id}`,
        {
          headers: this.getAuthHeaders(),
        }
      );
  
      const data = await this.handleResponse(response);
      return data.role; // returns role, e.g., 'super_admin', 'admin', 'user'
  
    } catch (error) {
      toast.error(`🚨 ${error.message}`);
      throw error;
    }
  }

  async blockUserByAdmin ({adminId,userId }) {
    console.log('block called .........');
    try {
      const response = await fetch(`${this.baseUrl}/api/super-admin/block-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({
          adminId: adminId,
          userId: userId,
        }),
      });
  
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
  
      toast.success(result.message);
    } catch (error) {
      toast.error(`🚨 Admin block failed: ${error.message}`);
    }
  };


  async unBlockUserByAdmin({ adminId, userId }) {
    console.log('Unblock called ........');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/super-admin/un-block-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({
          adminId: adminId,
          userId: userId,
        }),
      });
  
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
  
      toast.success(result.message);
    } catch (error) {
      toast.error(`🚨 Admin unblock failed: ${error.message}`);
    }
  }
  
  async getBlockedUsersByAdmin () {
    console.log('Fetching blocked users list...');
  
    try {
      const response = await fetch(`${this.baseUrl}/api/super-admin/get-blocked-users-list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
      });
  
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to fetch blocked users');
  
      toast.success("✅ Blocked users list fetched successfully");
      return result.blockedUsers; // or result.data if your backend sends it like that
    } catch (error) {
      toast.error(`🚨 Failed to fetch blocked users: ${error.message}`);
      return [];
    }
  };
  

  async checkIfUserBlocked(userId) {
    console.log('Checking if user is blocked...');
  
    try {
      const response = await fetch(`${this.baseUrl}/api/super-admin/check-is-user-id-blocked-by-admin?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),  // Assuming this function handles authorization headers
        },
      });
  
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to check if user is blocked');
  
      if (result.isBlocked) {
        toast.success(`✅ User is blocked by an admin.`);
      } else {
        toast.info(`ℹ️ User is not blocked.`);
      }
  
      return result.isBlocked; // You can return whether the user is blocked or not
    } catch (error) {
      toast.error(`🚨 Failed to check if user is blocked: ${error.message}`);
      return false; // Return false if there's an error
    }
  }
  
  

  async getProfilePhotoById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles/profile/photo/${id}`, {
        headers: this.getAuthHeaders(),
      });
      const data = await this.handleResponse(response);
      // toast.success("✅ Profile photo loaded successfully!");
      return data;
    } catch (error) {
      toast.error(`❌ Failed to load profile photo: ${error.message}`);
      throw error;
    }
  }


  async getChatReceiverNameAndPhotoById(id){
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles/profile/name-and-photo/${id}`, {
        headers: this.getAuthHeaders(),
      });
      const data = await this.handleResponse(response);
      // toast.success("✅ Profile name and photo loaded successfully!");
      return data;
    } catch (error) {
      toast.error(`❌ Failed to load profile name and photo: ${error.message}`);
      throw error;
    }
  }

  async uploadImageToSupabase(userId, imageFile) {
    try {
      // Check if the image file is valid
      if (!imageFile || !(imageFile instanceof File)) {
        throw new Error("No valid image file selected.");
      }
  
      console.log("userid from database service: ", userId);
      
      // Create a FormData object and append the image file
      const formData = new FormData();
      formData.append('image', imageFile); // 'image' is the field name used in API
  
      // Log the contents of FormData (only for debugging)
      formData.forEach((value, key) => {
        console.log(`${key}:`, value); // Log key-value pairs in the FormData object
      });
  
      // Perform the image upload via fetch API
      const response = await fetch(`${this.baseUrl}/api/profiles/upload-image/${userId}`, {
        method: "POST",
        headers: this.getAuthHeaders(true), // skip Content-Type for FormData
        body: formData,
      });      
  
      // Check if the response is ok
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to upload image.");
      }
  
      // Parse the response data
      const data = await response.json();
      toast.success("✅ Image uploaded successfully!");
      return data;
  
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      toast.error(`❌ Failed to upload image: ${error.message}`);
      throw error;
    }
  }
  
// Block user
async blockUser({ blocker_id, blocked_id }) {
  try {
    const response = await fetch(`${this.baseUrl}/api/block/block-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ blocker_id, blocked_id }),
    });

    // Debug: check if it's returning HTML
    const text = await response.text();
    console.log("Raw response text:", text);

    // Try parsing manually
    const data = JSON.parse(text); // You can skip this if you still use `this.handleResponse(response)`
    toast.success("🚫 User blocked successfully!");
    return data;
  } catch (error) {
    toast.error(`❌ Failed to block user: ${error.message}`);
    console.error("Block user error:", error);
    throw error;
  }
}


  // Unblock user
  async unblockUser({ blocker_id, blocked_id }) {
    try {
      const response = await fetch(`${this.baseUrl}/api/block/unblock-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify({ blocker_id, blocked_id }),
      });

      const data = await this.handleResponse(response);
      toast.success("✅ User unblocked successfully!");
      return data;
    } catch (error) {
      toast.error(`❌ Failed to unblock user: ${error.message}`);
      throw error;
    }
  }

// Check if blocker_id has blocked blocked_id or vice versa
async checkUserIsBlockedById({ blocker_id, blocked_id }) {
  try {
    const response = await fetch(
      `${this.baseUrl}/api/block/isBlocked?blocker_id=${blocker_id}&blocked_id=${blocked_id}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    const data = await this.handleResponse(response);
    // toast.success("✅ Block status checked!");
    return data;
  } catch (error) {
    toast.error(`❌ Failed to check block status: ${error.message}`);
    throw error;
  }
}



// ✅ Get full profile by email (POST request)
async getCurrentUserProfileByEmail(email) {
  try {
    const response = await fetch(`${this.baseUrl}/api/profiles/get-full-profile`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }), // Send email in request body
    });

    const data = await this.handleResponse(response);
    // toast.success("✅ Your profile is loaded successfully!");
    // console.log("data:", data);
    
    return data;
  } catch (error) {
    console.error('Error loading your profile:', error);
    toast.error(`❌ Failed to load your profile: ${error.message}`);
    throw error;
  }
}

  async getProfileById(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles/profile/${userId}`, {
        headers: this.getAuthHeaders(),
      });
      const data = await this.handleResponse(response);
      toast.success("✅ Profile loaded successfully!");
      return data;
    } catch (error) {
      toast.error(`❌ Failed to load profile: ${error.message}`);
      throw error;
    }
  }

  // ✅ Create profile for specific user (Relationship route)
  // async createProfileForUser(userId, profileData) {
  //   try {
  //     const response = await fetch(`${this.baseUrl}/api/users/${userId}/profile`, {
  //       method: "POST",
  //       headers: this.getAuthHeaders(),
  //       body: JSON.stringify(profileData),
  //     });
  //     const data = await this.handleResponse(response);
  //     toast.success("✅ Profile created successfully!");
  //     return data;
  //   } catch (error) {
  //     toast.error(`❌ Failed to create profile: ${error.message}`);
  //     throw error;
  //   }
  // }

  // ✅ Create new profile
  async createProfile(profileData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      const data = await this.handleResponse(response);
      toast.success("✅ New profile created!");
      return data;
    } catch (error) {
      toast.error(`❌ Failed to create profile: ${error.message}`);
      throw error;
    }
  }

  // ✅ Update profile by profile ID
  async updateProfile(profileId, profileData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles/update-profile/${profileId}`, {
        method: "PUT",
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });
  
      const data = await this.handleResponse(response);
      toast.success("✅ Profile updated successfully!");
      return data;
    } catch (error) {
      toast.error(`❌ Failed to update profile: ${error.message}`);
      throw error;
    }
  }

  async addToWishlist(userId, likedProfileId) {
    console.log("see : ", userId, likedProfileId);
  
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles/add-user-wishlist`, {
        method: "POST",
        headers: {
          ...this.getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, likedProfileId }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        if (data?.error === 'Profile already in wishlist') {
          toast.info("ℹ️ Profile already in wishlist.");
        } else if (data?.error) {
          toast.error(`❌ ${data.error}`);
        } else {
          toast.error("❌ Something went wrong.");
        }
        throw new Error(data.error || "Request failed");
      }
  
      toast.success("✅ Profile added to wishlist!");
      return data;
  
    } catch (error) {
      console.error("Add to wishlist error:", error);
      if (!error.message.includes("already")) {
        toast.error(`❌ Failed to add to wishlist: ${error.message}`);
      }
      throw error;
    }
  }  
  
  async getUserWishlist(userId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles/user-wishlist/${userId}`, {
        method: "GET",
        headers: {
          ...this.getAuthHeaders(),
        },
      });
  
      const data = await this.handleResponse(response);
      // console.log(data);
      
      toast.success("✅ Wishlist fetched successfully!");
      return data.wishlist;
    } catch (error) {
      toast.error(`❌ Failed to fetch wishlist: ${error.message}`);
      throw error;
    }
  }
  

  // ✅ Delete profile by profile ID
  async deleteProfile(profileId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/profiles/${profileId}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });
      const data = await this.handleResponse(response);
      toast.success("🗑️ Profile deleted successfully!");
      return data;
    } catch (error) {
      toast.error(`❌ Failed to delete profile: ${error.message}`);
      throw error;
    }
  }
}

const databaseService = new DatabaseService();
export default databaseService;