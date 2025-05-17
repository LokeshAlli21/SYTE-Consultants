import { supabase } from '../supabase/supabaseClient.js';

export const createNewAssignment = async (req, res) => {
    try {
      const {
        project_id,
        assignment_type,
        payment_date,
        application_number,
        consultation_charges,
        govt_fees,
        ca_fees,
        engineer_fees,
        arch_fees,
        liasioning_fees,
        remarks
      } = req.body;
  
      // Ensure project_id exists
      if (!project_id) {
        return res.status(400).json({ error: "❌ project_id is required" });
      }
  
      // Construct sanitized assignment object by including only available (truthy or numeric) values
      const assignmentData = {
        project_id,
        ...(assignment_type && { assignment_type }),
        ...(payment_date && { payment_date }),
        ...(application_number && { application_number }),
        ...(typeof consultation_charges === "number" && consultation_charges !== 0 && { consultation_charges }),
        ...(typeof govt_fees === "number" && govt_fees !== 0 && { govt_fees }),
        ...(typeof ca_fees === "number" && ca_fees !== 0 && { ca_fees }),
        ...(typeof engineer_fees === "number" && engineer_fees !== 0 && { engineer_fees }),
        ...(typeof arch_fees === "number" && arch_fees !== 0 && { arch_fees }),
        ...(typeof liasioning_fees === "number" && liasioning_fees !== 0 && { liasioning_fees }),
        ...(remarks && { remarks }),
      };
  
      // If only project_id is present and no other field, don't insert
      if (Object.keys(assignmentData).length === 1) {
        return res.status(400).json({ error: "❌ No valid assignment data provided." });
      }
  
      const { error } = await supabase
        .from('assignments')
        .insert([assignmentData]);
  
      if (error) {
        console.error('❌ Error inserting assignment:', error);
        return res.status(500).json({ error: 'Failed to insert assignment', details: error });
      }
  
      res.status(201).json({ message: '✅ Assignment created successfully' });
  
    } catch (error) {
      console.error('❌ Unexpected error in createNewAssignment:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  export const getAllAssignments = async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          id,
          project_id,
          assignment_status,
          assignment_type,
          payment_date,
          application_number,
          consultation_charges,
          govt_fees,
          ca_fees,
          engineer_fees,
          arch_fees,
          liasioning_fees,
          remarks,
          created_at,
          updated_at
        `)
        .eq('status_for_delete','active');
  
      if (error) {
        console.error('❌ Error fetching assignments:', error);
        return res.status(500).json({ error: 'Failed to fetch assignments', details: error });
      }
  
      res.status(200).json({ assignments: data });
    } catch (err) {
      console.error('❌ Unexpected error in getAllAssignments:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  export const softDeleteAssignmentById = async (req, res) => {
    const assignmentId = req.params.id;
  
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ status_for_delete: 'inactive' })
        .eq('id', assignmentId);
  
      if (error) {
        console.error('❌ Error soft deleting assignment:', error);
        return res.status(500).json({ error: 'Failed to delete assignment', details: error });
      }
  
      res.status(200).json({ message: '✅ Assignment marked as inactive' });
    } catch (err) {
      console.error('❌ Unexpected error in softDeleteAssignmentById:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  

  export const getAssignmentById = async (req, res) => {
    const { id } = req.params;
  
    try {
      // Fetch assignment data from the database
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          project_id,
          assignment_type,
          assignment_status,
          payment_date,
          application_number,
          consultation_charges,
          govt_fees,
          ca_fees,
          engineer_fees,
          arch_fees,
          liasioning_fees,
          remarks
        `)
        .eq('id', id)
        .single();
  
      if (error) {
        console.error(`❌ Error fetching assignment with ID ${id}:`, error);
        return res.status(500).json({ error: 'Failed to fetch assignment', details: error });
      }
  
      if (!data) {
        return res.status(404).json({ error: 'Assignment not found or inactive' });
      }
  
      res.status(200).json({ assignment: data });
  
    } catch (err) {
      console.error('❌ Unexpected error in getAssignmentById:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  export const updateAssignment = async (req, res) => {
    const { id } = req.params;
    console.log(id);
    
    const {
      project_id,
      assignment_type,
      payment_date,
      application_number,
      consultation_charges,
      govt_fees,
      ca_fees,
      engineer_fees,
      arch_fees,
      liasioning_fees,
      remarks,
    } = req.body;
  
    try {
      // Ensure project_id exists
      if (!project_id) {
        return res.status(400).json({ error: "❌ project_id is required" });
      }
  
      // Construct sanitized assignment object by including only available (truthy or numeric) values
      const assignmentData = {
        project_id,
        ...(assignment_type && { assignment_type }),
        ...(payment_date && { payment_date }),
        ...(application_number && { application_number }),
        ...(typeof consultation_charges === "number" && consultation_charges !== 0 && { consultation_charges }),
        ...(typeof govt_fees === "number" && govt_fees !== 0 && { govt_fees }),
        ...(typeof ca_fees === "number" && ca_fees !== 0 && { ca_fees }),
        ...(typeof engineer_fees === "number" && engineer_fees !== 0 && { engineer_fees }),
        ...(typeof arch_fees === "number" && arch_fees !== 0 && { arch_fees }),
        ...(typeof liasioning_fees === "number" && liasioning_fees !== 0 && { liasioning_fees }),
        ...(remarks && { remarks }),
      };
  
      console.log('Assignment Data:', assignmentData);  // Log assignment data to check for unexpected values
  
      // Perform the update operation
      const { data, error } = await supabase
        .from('assignments')
        .update(assignmentData)
        .eq('id', id)
  
      // Log data and error for debugging
      console.log('Executed Supabase Query');
      console.log('Returned Data:', data);
      console.log('Error:', error);
  
      // Handle any error
      if (error) {
        console.error(`❌ Error updating assignment with ID ${id}:`, error);
        return res.status(500).json({ error: 'Failed to update assignment', details: error });
      }
  
  
      res.status(200).json({ message: '✅ Assignment updated successfully', data });
    } catch (err) {
      console.error('❌ Unexpected error in updateAssignment:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
  export const updateAssignmentStatus = async (req, res) => {
  const { id } = req.params;
  const { assignment_status } = req.body;

  console.log('Updating assignment status for ID:', id);
  console.log('New Status:', assignment_status);

  try {
    // Validate required field
    if (!assignment_status) {
      return res.status(400).json({ error: "❌ assignment_status is required" });
    }

    // Update only the assignment_status field
    const { data, error } = await supabase
      .from('assignments')
      .update({ assignment_status })
      .eq('id', id);

    console.log('Executed Supabase Query');
    console.log('Returned Data:', data);
    console.log('Error:', error);

    if (error) {
      console.error(`❌ Error updating status for assignment ID ${id}:`, error);
      return res.status(500).json({ error: 'Failed to update assignment status', details: error });
    }

    res.status(200).json({ message: '✅ Assignment status updated successfully', data });
  } catch (err) {
    console.error('❌ Unexpected error in updateAssignmentStatus:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

  