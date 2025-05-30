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
        remarks,
        created_by,
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
        .insert([{...assignmentData,created_by}]);
  
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
    const { data: assignmentsWithTimeline, error } = await supabase
      .from('vw_assignments_with_latest_timeline') 
      .select('*');

    if (error) {
      console.error('❌ Error fetching assignments:', error);
      return res.status(500).json({ error: 'Failed to fetch assignments', details: error });
    }

    res.status(200).json({ assignments: assignmentsWithTimeline });
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
        .from('assignment_with_updated_user')
        .select('*')
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
      updated_by,
      update_action,
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
        updated_by,
        update_action,
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
  const { assignment_status, created_by } = req.body;

  console.log('Updating assignment status for ID:', id);
  console.log('New Status:', assignment_status);

  try {
    if (!assignment_status) {
      return res.status(400).json({ error: "❌ assignment_status is required" });
    }
    if (!created_by) {
      return res.status(400).json({ error: "❌ created_by is required" });
    }

    const { data, error } = await supabase.rpc('update_assignment_status_fn', {
      p_assignment_id: parseInt(id), // parse to INT
      p_assignment_status: assignment_status,
      p_created_by: parseInt(created_by) // ensure it's INT
    });

    if (error) {
      console.error('❌ Supabase RPC error:', error);
      return res.status(500).json({ error: 'Failed to update assignment status', details: error });
    }

    console.log('✅ Assignment status updated via SQL function:', data);

    res.status(200).json({
      message: '✅ Assignment status updated successfully (via SQL function)',
      data: data[0]  // assuming the function returns an array with one row
    });
  } catch (err) {
    console.error('❌ Unexpected error in updateAssignmentStatus:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addAssignmentNote = async (req, res) => {
  const { id } = req.params; // assignment_id
  const { created_by, ...notePayload } = req.body;

  try {
    // ✅ Validate: at least one note must be provided
    if (!notePayload || Object.keys(notePayload).length === 0) {
      return res.status(400).json({ error: '❌ At least one note must be provided' });
    }

    // Call the PostgreSQL function via Supabase RPC
    const { data, error } = await supabase.rpc('add_assignment_note', {
      p_assignment_id: parseInt(id),
      p_note: notePayload,
      p_created_by: created_by
    });

    if (error) {
      console.error('❌ Supabase RPC error:', error);
      return res.status(500).json({ error: '❌ Failed to add assignment note', details: error });
    }

    res.status(200).json({ message: '✅ Note added successfully', data });
  } catch (err) {
    console.error('❌ Unexpected error in addAssignmentNote:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const setAssignmentReminder = async (req, res) => {
  const { id } = req.params; // assignment_id
  const { date_and_time, message, status = 'pending', created_by } = req.body;

  try {
    if (!date_and_time || !message || !message.trim()) {
      return res.status(400).json({ error: '❌ date_and_time and message are required' });
    }

    const query = `
      SELECT * FROM set_assignment_reminder($1, $2, $3, $4, $5);
    `;

    // Run raw SQL RPC call
    const { data, error } = await supabase.rpc('set_assignment_reminder', {
      p_assignment_id: Number(id),
      p_date_and_time: date_and_time,
      p_message: message,
      p_status: status,
      p_created_by: created_by
    });

    if (error) {
      console.error('❌ Supabase RPC error:', error);
      return res.status(500).json({ error: '❌ Failed to set assignment reminder', details: error });
    }

    res.status(200).json({ message: '✅ Reminder set successfully', data });
  } catch (err) {
    console.error('❌ Unexpected error in setAssignmentReminder:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssignmentTimeline = async (req, res) => {
  const { id } = req.params;
  // console.log(id);
  

  try {
    const { data, error } = await supabase
      .from('assignment_timeline_view')
      .select('*')
      .eq('assignment_id', id)

    if (error) {
      console.error(`❌ Error fetching timeline for assignment ID ${id}:`, error);
      return res.status(500).json({ error: 'Failed to fetch assignment timeline', details: error });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No timeline events found for this assignment' });
    }

    res.status(200).json({ timeline: data });

  } catch (err) {
    console.error('❌ Unexpected error in getAssignmentTimeline:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllPendingReminders = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('assignment_reminders')
      .select('*')
      .eq('status', 'pending')
      .order('date_and_time', { ascending: true });

    if (error) {
      console.error('❌ Error fetching pending reminders:', error);
      return res.status(500).json({ error: 'Failed to fetch pending reminders', details: error });
    }

    if (!data || data.length === 0) {
      return res.status(200).json({ error: 'No pending reminders found' });
    }

    return res.status(200).json({ reminders: data });

  } catch (err) {
    console.error('❌ Unexpected error in getAllPendingReminders:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateReminderStatus = async (req, res) => {
  try {
    const { id, updated_by } = req.body;

    if (!id || !updated_by) {
      return res.status(400).json({ error: "❌ Missing required fields: 'id' or 'updated_by'" });
    }

    // Call SQL function using Supabase RPC
    const { data, error } = await supabase.rpc('update_assignment_reminder_status', {
      p_reminder_id: id,
      p_updated_by: updated_by
    });

    if (error) {
      console.error("❌ Supabase RPC error:", error);
      return res.status(500).json({ error: "❌ Failed to update reminder status", details: error });
    }

    return res.status(200).json({
      message: "✅ Reminder status updated successfully",
      updatedReminderId: data?.[0]?.updated_reminder_id,
      newTimelineEntryId: data?.[0]?.timeline_id
    });

  } catch (err) {
    console.error("❌ Unexpected error in updateReminderStatus:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};