import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaArrowLeft } from "react-icons/fa6";

import { ChannelPartnerForm } from "../../components/index.js";
import databaseService from "../../backend-services/database/database.js";
import UserProfile from "../../components/UserProfile.jsx";

// Constants
const INITIAL_FORM_DATA = {
  full_name: "",
  contact_number: "",
  alternate_contact_number: "",
  email_id: "",
  district: "",
  city: "",
  update_action: "",
  updated_By: "",
  updated_at: "",
};

const VALIDATION_PATTERNS = {
  CONTACT: /^\d{10}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

const TOAST_MESSAGES = {
  LOAD_SUCCESS: "✅ Channel Partner details loaded successfully!",
  LOAD_ERROR: "❌ Failed to load channel partner:",
  UPDATE_SUCCESS: "✅ Channel Partner updated successfully!",
  CREATE_SUCCESS: "✅ Channel Partner created successfully!",
  UPDATE_ERROR: "❌ Failed to update Channel Partner:",
  CREATE_ERROR: "❌ Failed to create Channel Partner:",
  NO_CHANGES: "ℹ️ No changes detected.",
  VALIDATION_ERRORS: {
    CONTACT: "📞 Contact number must be exactly 10 digits.",
    ALTERNATE_CONTACT: "📱 Alternate contact number must be exactly 10 digits.",
    EMAIL: "📧 Invalid email format.",
  },
};

/**
 * AddChannelPartner Component
 * Handles adding new channel partners and editing existing ones
 */
function AddChannelPartner({ viewOnly = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  // State management
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [originalData, setOriginalData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed values
  const isEditMode = Boolean(id);
  const pageTitle = isEditMode ? "Edit Channel Partner" : "Add Channel Partner";

  /**
   * Validates form data
   * @param {Object} data - Form data to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  const validateFormData = useCallback((data) => {
    const errors = [];

    // Validate contact number
    if (data.contact_number && !VALIDATION_PATTERNS.CONTACT.test(data.contact_number)) {
      errors.push(TOAST_MESSAGES.VALIDATION_ERRORS.CONTACT);
    }

    // Validate alternate contact number
    if (data.alternate_contact_number && !VALIDATION_PATTERNS.CONTACT.test(data.alternate_contact_number)) {
      errors.push(TOAST_MESSAGES.VALIDATION_ERRORS.ALTERNATE_CONTACT);
    }

    // Validate email
    if (data.email_id && !VALIDATION_PATTERNS.EMAIL.test(data.email_id)) {
      errors.push(TOAST_MESSAGES.VALIDATION_ERRORS.EMAIL);
    }

    // Display errors if any
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }

    return true;
  }, []);

  /**
   * Gets the fields that have been changed
   * @returns {string[]} - Array of changed field names
   */
  const getChangedFields = useCallback(() => {
    return Object.keys(formData).filter(key => 
      formData[key] !== originalData[key]
    );
  }, [formData, originalData]);

  /**
   * Fetches channel partner data by ID
   */
  const fetchChannelPartnerData = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const response = await databaseService.getChannelPartnerById(id);
      
      setOriginalData(response);
      setFormData(response);
      // toast.success(TOAST_MESSAGES.LOAD_SUCCESS);
    } catch (error) {
      console.error("Error fetching channel partner:", error);
      toast.error(`${TOAST_MESSAGES.LOAD_ERROR} ${error.message}`);
      
      // Navigate back on error
      navigate(-1);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  /**
   * Handles form submission
   */
  const handleSubmit = useCallback(async () => {
    // Validate form data
    if (!validateFormData(formData)) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode) {
        // Handle update
        const changedFields = getChangedFields();
        
        if (changedFields.length === 0) {
          toast.info(TOAST_MESSAGES.NO_CHANGES);
          return;
        }

        const updatePayload = {
          ...formData,
          userID: userData?.id,
          update_action: changedFields.join(", "),
        };
        
        await databaseService.updateChannelPartner(id, updatePayload);
        toast.success(TOAST_MESSAGES.UPDATE_SUCCESS);
      } else {
        // Handle create
        await databaseService.createChannelPartner(formData, userData?.id);
        toast.success(TOAST_MESSAGES.CREATE_SUCCESS);
      }
      
      // Navigate back to list
      navigate("/channel-partners");
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = isEditMode 
        ? `${TOAST_MESSAGES.UPDATE_ERROR} ${error.message}`
        : `${TOAST_MESSAGES.CREATE_ERROR} ${error.message}`;
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData,
    validateFormData,
    isEditMode,
    getChangedFields,
    userData?.id,
    id,
    navigate,
  ]);

  /**
   * Handles navigation back
   */
  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Effects
  useEffect(() => {
    fetchChannelPartnerData();
  }, [fetchChannelPartnerData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F4C92] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading channel partner details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pt-3">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 pl-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handleGoBack}
            className="text-[#2F4C92] text-3xl cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Go back"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-[24px] font-bold text-[#2F4C92]">
            {pageTitle}
          </h1>
        </div>

        <UserProfile/>
      </header>

      {/* Form */}
      <main>
        <ChannelPartnerForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          disabled={viewOnly}
          isSubmitting={isSubmitting}
          activeTab="Channel Partner Details"
        />
      </main>
    </div>
  );
}

export default AddChannelPartner;