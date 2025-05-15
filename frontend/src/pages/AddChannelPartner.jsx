import React, { useEffect, useState } from "react";
import { ChannelPartnerForm } from "../components/index.js";
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import databaseService from "../backend-services/database/database.js";
import { toast } from "react-toastify";

function AddChannelPartner({ viewOnly }) {
  const { id } = useParams();
  // console.log(id);

  const navigate = useNavigate();

  const [channelPartner, setChannelPartner] = useState({
    full_name: "",
    contact_number: "",
    alternate_contact_number: "",
    email_id: "",
    district: "",
    city: "",
  });

  useEffect(() => {
    const fetchChannelPartner = async () => {
      if (id) {
        try {
          const response = await databaseService.getChannelPartnerById(id);
          console.log("✅ Channel Partner Response:", response);
          setChannelPartner(response); // Make sure you pass the fetched data
          toast.success("✅ Channel Partner details loaded successfully!");
        } catch (error) {
          console.error("❌ Error fetching channel partner:", error);
          toast.error(`❌ Failed to load channel partner: ${error.message}`);
        }
      }
    };

    fetchChannelPartner();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const validateChannelPartner = (data) => {
    const errors = [];
    const contactRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (data.contact_number && !contactRegex.test(data.contact_number)) {
      errors.push("📞 Contact number must be exactly 10 digits.");
    }

    if (
      data.alternate_contact_number &&
      !contactRegex.test(data.alternate_contact_number)
    ) {
      errors.push("📱 Alternate contact number must be exactly 10 digits.");
    }

    if (data.email_id && !emailRegex.test(data.email_id)) {
      errors.push("📧 Invalid email format.");
    }

    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return false;
    }

    return true;
  };

  const handleSubmitChannelPartner = async () => {
    console.log("Form Data Submitted:", channelPartner);

    if (!validateChannelPartner(channelPartner)) return;

    if (id) {
      try {
        const response = await databaseService.updateChannelPartner(
          id,
          channelPartner
        );
        console.log("✅ ChannelPartner updated:", response);
        toast.success("✅ ChannelPartner updated successfully!");
        navigate("/channel-partners");
        return;
      } catch (error) {
        console.error("❌ Error updating ChannelPartner details:", error);
        toast.error(`❌ Failed to update ChannelPartner: ${error.message}`);
        return;
      }
    }

    try {
      const response = await databaseService.createChannelPartner(
        channelPartner
      );
      console.log("✅ ChannelPartner created:", response);
      toast.success("✅ ChannelPartner created successfully!");
      navigate("/channel-partners");
    } catch (error) {
      console.error("❌ Error creating ChannelPartner:", error);
      toast.error(`❌ Failed to create ChannelPartner: ${error.message}`);
    }
  };

  return (
    <>
      <div className="min-h-screen p-8 pt-3">
        <div className="flex items-center justify-between mb-6 pl-6">
          <div className="flex items-center gap-2">
            <FaArrowLeft
              className="text-[#2F4C92] text-3xl cursor-pointer"
              onClick={handleBack}
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
          disabled={viewOnly ? true : false}
        />
      </div>
    </>
  );
}

export default AddChannelPartner;
