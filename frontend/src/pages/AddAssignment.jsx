import React, { useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa6';
import {AssignmentForm} from '../components/index.js'
import { useNavigate } from 'react-router-dom';
import databaseService from '../backend-services/database/database.js';
import { toast } from 'react-toastify';

function AddAssignment() {
    const navigate = useNavigate()
    const [assignment, setAssignment ] = useState({
      id : null,
      
        project_id: null, // Foreign key to projects table
      
        assignment_type: "", // e.g., "Registration", "Compliance"
        payment_date: "", // Format: "YYYY-MM-DD"
        application_number: "",
      
        consultation_charges: 0.00,
        govt_fees: 0.00,
        ca_fees: 0.00,
        engineer_fees: 0.00,
        arch_fees: 0.00,
        liasioning_fees: 0.00,
      
        remarks: "",
      })

      const handleSubmitAssignment = async () => {
        if(!assignment.project_id) {
          toast('please select project')
          return
        }
        console.log("Form Data Submitted:", assignment);
        // setLoading(true);
        try {
          const response = await databaseService.createNewAssignment(assignment);
          console.log("✅ New assignement is created:", response);
          toast.success("✅ New assignement is created successfully!");
          navigate("/assignments"); // 👈 Navigate to projects page or wherever appropriate
        } catch (error) {
          console.error("❌ Error creating New assignement:", error);
          toast.error(`❌ Failed to create New assignement: ${error.message}`);
        } finally {
          // setLoading(false);
        }
      };

      const handleBack = () => {
          navigate(-1);
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
    <AssignmentForm
    formData={assignment}
      setFormData={setAssignment}
      handleSubmitAssignment={handleSubmitAssignment}
    />
    </div>
    </>
    
)
}

export default AddAssignment