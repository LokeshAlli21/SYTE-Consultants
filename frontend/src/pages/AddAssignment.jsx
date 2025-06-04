import React, { useEffect, useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa6';
import {AssignmentForm} from '../components/index.js'
import { useNavigate, useParams } from 'react-router-dom';
import databaseService from '../backend-services/database/database.js';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import UserProfile from '../components/UserProfile.jsx';

function AddAssignment({viewOnly}) {

  const userData = useSelector((state) => state.auth.userData);

  const {id} = useParams()
  console.log(id);
  
    const navigate = useNavigate()
    const [prevAssignment, setPrevAssignment ] = useState({})
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

      useEffect(() => {
        const fetchAssignment = async () => {
          if (id) {
            try {
              const response = await databaseService.getAssignmentById(id); // Use the appropriate service method
              console.log("✅ Assignment Response:", response);
              setAssignment(response); // Make sure you pass the fetched data
              setPrevAssignment(response); 
              // toast.success("✅ Assignment details loaded successfully!");
            } catch (error) {
              console.error("❌ Error fetching assignment:", error);
              toast.error(`❌ Failed to load assignment: ${error.message}`);
            }
          }
        };
      
        fetchAssignment();
      }, [id]); // Re-run the effect whenever the `id` changes      

      const handleSubmitAssignment = async () => {
        console.log("Form Data Submitted:", assignment);
      
        // Ensure project_id is selected
        if (!assignment.project_id) {
          toast('❌ Please select a project');
          return;
        }
      
        // Check if we are updating an existing assignment (by checking the `id`)
        if (id) {


 let update_action = null;

          const changedFields = [];

          for (const key in assignment) {
            if (assignment[key] !== prevAssignment[key]) {
              changedFields.push(key);
            }
          }  
          if (changedFields.length === 0) {
            toast.info("ℹ️ No changes detected.");
          } else{
            update_action = changedFields.join(', ');
            try {
            const response = await databaseService.updateAssignment(id, {...assignment,updated_by:userData?.id,update_action}); // Assuming you have an updateAssignment method
              console.log("✅ Assignment updated:", response);
              toast.success("✅ Assignment updated successfully!");
              navigate("/assignments"); // Navigate to assignments page or wherever appropriate
              return; // Prevent further execution
            } catch (error) {
              console.error("❌ Error updating Assignment:", error);
              toast.error(`❌ Failed to update Assignment: ${error.message}`);
              return;
            }
          }
        } else {
            try {
    const response = await databaseService.createNewAssignment({
      ...assignment,
      created_by: userData.id,
    });
    console.log("✅ New assignment created:", response);
    toast.success("✅ New assignment created successfully!");
    navigate("/assignments");
  } catch (error) {
    console.error("❌ Error creating new Assignment:", error);
    toast.error(`❌ Failed to create new Assignment: ${error.message}`);
  }
        }
      };
      

      const handleBack = () => {
          navigate(-1);
      };
      console.log(userData);
      
  return (
    <>
    <div className="min-h-screen p-8 pt-3">
          <div className="flex items-center justify-between mb-6 pl-6">
            <div className="flex items-center gap-2">
              <FaArrowLeft className="text-[#2F4C92] text-3xl cursor-pointer" onClick={handleBack} />
              <h1 className="text-[24px] font-bold text-[#2F4C92]">Add New Assignment</h1>
            </div>
    
<UserProfile />
          </div>
    <AssignmentForm
    formData={assignment}
      setFormData={setAssignment}
      handleSubmitAssignment={handleSubmitAssignment}
      disabled={viewOnly? true : false}
    />
    </div>
    </>
    
)
}

export default AddAssignment