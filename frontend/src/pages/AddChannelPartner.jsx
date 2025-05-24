import React, { useEffect, useState } from "react";
import { ChannelPartnerForm } from "../components/index.js";
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import databaseService from "../backend-services/database/database.js";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const initialData = {
  full_name: "",
  contact_number: "",
  alternate_contact_number: "",
  email_id: "",
  district: "",
  city: "",
  update_action: '',
  updated_By: '',
  updated_at: '',
};

function AddChannelPartner({ viewOnly }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  
  const [prevData, setPrevData] = useState({});
  const [channelPartner, setChannelPartner] = useState(initialData);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        const response = await databaseService.getChannelPartnerById(id);
        setPrevData(response);
        setChannelPartner(response);
        toast.success("✅ Channel Partner details loaded successfully!");
      } catch (error) {
        toast.error(`❌ Failed to load channel partner: ${error.message}`);
      }
    };
    
    fetchData();
  }, [id]);

  const validateData = (data) => {
    const contactRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errors = [];

    if (data.contact_number && !contactRegex.test(data.contact_number)) {
      errors.push("📞 Contact number must be exactly 10 digits.");
    }
    if (data.alternate_contact_number && !contactRegex.test(data.alternate_contact_number)) {
      errors.push("📱 Alternate contact number must be exactly 10 digits.");
    }
    if (data.email_id && !emailRegex.test(data.email_id)) {
      errors.push("📧 Invalid email format.");
    }

    if (errors.length > 0) {
      errors.forEach(toast.error);
      return false;
    }
    return true;
  };

  const getChangedFields = () => {
    return Object.keys(channelPartner).filter(key => channelPartner[key] !== prevData[key]);
  };

  const handleSubmitChannelPartner = async () => {
    if (!validateData(channelPartner)) return;

    try {
      if (id) {
        const changedFields = getChangedFields();
        
        if (changedFields.length === 0) {
          toast.info("ℹ️ No changes detected.");
        }

        const updateData = {
          ...channelPartner,
          userID: userData?.id,
          update_action: changedFields.join(', ')
        };
        
        await databaseService.updateChannelPartner(id, updateData);
        toast.success("✅ ChannelPartner updated successfully!");
      } else {
        await databaseService.createChannelPartner(channelPartner, userData?.id);
        toast.success("✅ ChannelPartner created successfully!");
      }
      navigate("/channel-partners");
    } catch (error) {
      const action = id ? "update" : "create";
      toast.error(`❌ Failed to ${action} ChannelPartner: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen p-8 pt-3">
      <div className="flex items-center justify-between mb-6 pl-6">
        <div className="flex items-center gap-2">
          <FaArrowLeft
            className="text-[#2F4C92] text-3xl cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <h1 className="text-[24px] font-bold text-[#2F4C92]">
            {!id && "Add"} Channel Partner
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-sm font-medium">Admin Name</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
          <div className="w-10 h-10 bg-[#C2C2FF] rounded-full" />
        </div>
      </div>
      
      <ChannelPartnerForm
        formData={channelPartner}
        setFormData={setChannelPartner}
        handleSubmitChannelPartner={handleSubmitChannelPartner}
        disabled={viewOnly}
      />
    </div>
  );
}

export default AddChannelPartner;