import React, { useState } from 'react'
import { ChannelPartnerForm } from '../components/index.js';
import { FaArrowLeft } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import databaseService from '../backend-services/database/database.js';
import { toast } from 'react-toastify';

function AddChannelPartner() {

      const navigate = useNavigate()

  const [channelPartner,setChannelPartner] = useState({
    full_name: " ",
    contact_number: "",
    alternate_contact_number: "",
    email_id: "",
    district: "",
    city: ""
  })
  

  const handleBack = () => {
      navigate(-1);
  };

  const handleSubmitChannelPartner = async () => {
    console.log("Form Data Submitted:", channelPartner);
    // setLoading(true);
    try {
      const response = await databaseService.createChannelPartner(channelPartner);
      console.log("✅ ChannelPartner uploaded:", response);
      toast.success("✅ ChannelPartner submitted successfully!");
      navigate("/channel-partners"); // 👈 Navigate to projects page or wherever appropriate
    } catch (error) {
      console.error("❌ Error submitting ChannelPartner details:", error);
      toast.error(`❌ Failed to submit ChannelPartner details: ${error.message}`);
    } finally {
      // setLoading(false);
    }
  };

  
  return (
    <>
    <div className="min-h-screen p-8 pt-3">
          <div className="flex items-center justify-between mb-6 pl-6">
            <div className="flex items-center gap-2">
              <FaArrowLeft className="text-[#2F4C92] text-3xl cursor-pointer" onClick={handleBack} />
              <h1 className="text-[24px] font-bold text-[#2F4C92]">Add New Assignment</h1>
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
    />
    </div>
    </>
  )
}

export default AddChannelPartner