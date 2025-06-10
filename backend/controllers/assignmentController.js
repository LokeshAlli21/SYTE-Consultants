import { query, getClient } from '../aws/awsClient.js';

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

    // Build dynamic query based on available fields
    const fields = ['project_id', 'created_by'];
    const values = [project_id, created_by];
    const placeholders = ['$1', '$2'];
    let paramCount = 2;

    if (assignment_type) {
      fields.push('assignment_type');
      values.push(assignment_type);
      placeholders.push(`$${++paramCount}`);
    }
    if (payment_date) {
      fields.push('payment_date');
      values.push(payment_date);
      placeholders.push(`$${++paramCount}`);
    }
    if (application_number) {
      fields.push('application_number');
      values.push(application_number);
      placeholders.push(`$${++paramCount}`);
    }
    if (typeof consultation_charges === "number" && consultation_charges !== 0) {
      fields.push('consultation_charges');
      values.push(consultation_charges);
      placeholders.push(`$${++paramCount}`);
    }
    if (typeof govt_fees === "number" && govt_fees !== 0) {
      fields.push('govt_fees');
      values.push(govt_fees);
      placeholders.push(`$${++paramCount}`);
    }
    if (typeof ca_fees === "number" && ca_fees !== 0) {
      fields.push('ca_fees');
      values.push(ca_fees);
      placeholders.push(`$${++paramCount}`);
    }
    if (typeof engineer_fees === "number" && engineer_fees !== 0) {
      fields.push('engineer_fees');
      values.push(engineer_fees);
      placeholders.push(`$${++paramCount}`);
    }
    if (typeof arch_fees === "number" && arch_fees !== 0) {
      fields.push('arch_fees');
      values.push(arch_fees);
      placeholders.push(`$${++paramCount}`);
    }
    if (typeof liasioning_fees === "number" && liasioning_fees !== 0) {
      fields.push('liasioning_fees');
      values.push(liasioning_fees);
      placeholders.push(`$${++paramCount}`);
    }
    if (remarks) {
      fields.push('remarks');
      values.push(remarks);
      placeholders.push(`$${++paramCount}`);
    }

    // If only project_id and created_by are present, don't insert
    if (fields.length === 2) {
      return res.status(400).json({ error: "❌ No valid assignment data provided." });
    }

    const insertQuery = `
      INSERT INTO assignments (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING id
    `;

    const result = await query(insertQuery, values);

    res.status(201).json({ 
      message: '✅ Assignment created successfully',
      assignment_id: result.rows[0].id
    });

  } catch (error) {
    console.error('❌ Unexpected error in createNewAssignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllAssignments = async (req, res) => {
  try {
    const selectQuery = `
      SELECT * FROM vw_assignments_with_latest_timeline
      ORDER BY created_at DESC
    `;

    const result = await query(selectQuery);

    res.status(200).json({ assignments: result.rows });
  } catch (err) {
    console.error('❌ Unexpected error in getAllAssignments:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const softDeleteAssignmentById = async (req, res) => {
  const assignmentId = req.params.id;

  try {
    const updateQuery = `
      UPDATE assignments 
      SET status_for_delete = 'inactive'
      WHERE id = $1
    `;

    const result = await query(updateQuery, [assignmentId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
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
    const selectQuery = `
      SELECT * FROM assignment_with_updated_user
      WHERE id = $1
    `;

    const result = await query(selectQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found or inactive' });
    }

    res.status(200).json({ assignment: result.rows[0] });

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

    // Build dynamic update query
    const updateFields = ['project_id = $1', 'updated_by = $2', 'update_action = $3'];
    const values = [project_id, updated_by, update_action];
    let paramCount = 3;

    if (assignment_type) {
      updateFields.push(`assignment_type = $${++paramCount}`);
      values.push(assignment_type);
    }
    if (payment_date) {
      updateFields.push(`payment_date = $${++paramCount}`);
      values.push(payment_date);
    }
    if (application_number) {
      updateFields.push(`application_number = $${++paramCount}`);
      values.push(application_number);
    }
    if (typeof consultation_charges === "number" && consultation_charges !== 0) {
      updateFields.push(`consultation_charges = $${++paramCount}`);
      values.push(consultation_charges);
    }
    if (typeof govt_fees === "number" && govt_fees !== 0) {
      updateFields.push(`govt_fees = $${++paramCount}`);
      values.push(govt_fees);
    }
    if (typeof ca_fees === "number" && ca_fees !== 0) {
      updateFields.push(`ca_fees = $${++paramCount}`);
      values.push(ca_fees);
    }
    if (typeof engineer_fees === "number" && engineer_fees !== 0) {
      updateFields.push(`engineer_fees = $${++paramCount}`);
      values.push(engineer_fees);
    }
    if (typeof arch_fees === "number" && arch_fees !== 0) {
      updateFields.push(`arch_fees = $${++paramCount}`);
      values.push(arch_fees);
    }
    if (typeof liasioning_fees === "number" && liasioning_fees !== 0) {
      updateFields.push(`liasioning_fees = $${++paramCount}`);
      values.push(liasioning_fees);
    }
    if (remarks) {
      updateFields.push(`remarks = $${++paramCount}`);
      values.push(remarks);
    }

    // Add the WHERE clause parameter
    values.push(id);
    const whereClause = `$${++paramCount}`;

    const updateQuery = `
      UPDATE assignments 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = ${whereClause}
      RETURNING *
    `;

    console.log('Update Query:', updateQuery);
    console.log('Values:', values);

    const result = await query(updateQuery, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.status(200).json({ 
      message: '✅ Assignment updated successfully', 
      data: result.rows[0] 
    });
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

    // Call PostgreSQL function directly
    const functionQuery = `SELECT * FROM update_assignment_status_fn($1, $2, $3)`;
    
    const result = await query(functionQuery, [
      parseInt(id),
      assignment_status,
      parseInt(created_by)
    ]);

    console.log('✅ Assignment status updated via SQL function:', result.rows);

    res.status(200).json({
      message: '✅ Assignment status updated successfully (via SQL function)',
      data: result.rows[0]
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

    // Call the PostgreSQL function directly
    const functionQuery = `SELECT * FROM add_assignment_note($1, $2, $3)`;
    
    const result = await query(functionQuery, [
      parseInt(id),
      JSON.stringify(notePayload), // Convert object to JSON string
      created_by
    ]);

    res.status(200).json({ 
      message: '✅ Note added successfully', 
      data: result.rows[0] 
    });
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

    // Call PostgreSQL function directly
    const functionQuery = `SELECT * FROM set_assignment_reminder($1, $2, $3, $4, $5)`;
    
    const result = await query(functionQuery, [
      Number(id),
      date_and_time,
      message,
      status,
      created_by
    ]);

    res.status(200).json({ 
      message: '✅ Reminder set successfully', 
      data: result.rows[0] 
    });
  } catch (err) {
    console.error('❌ Unexpected error in setAssignmentReminder:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssignmentTimeline = async (req, res) => {
  const { id } = req.params;

  try {
    const selectQuery = `
      SELECT * FROM assignment_timeline_view
      WHERE assignment_id = $1
      ORDER BY timeline_created_at ASC
    `;

    const result = await query(selectQuery, [id]);

    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'No timeline events found for this assignment' });
    }

    const data = result.rows;
    const timelineByStatus = [];
    let currentGroup = null;
    let lastSeenStatus = null;

    for (const event of data) {
      // If this event has a new assignment_status (status changed or created)
      if (event.assignment_status) {
        // Always start a new group, even for the same status
        lastSeenStatus = event.assignment_status;
        currentGroup = {
          assignment_status: lastSeenStatus,
          events: []
        };
        timelineByStatus.push(currentGroup);
      }

      // If currentGroup doesn't exist yet, skip (shouldn't happen if data is correct)
      if (!currentGroup && lastSeenStatus) {
        // In case first few entries don't have assignment_status, group them under last seen
        currentGroup = {
          assignment_status: lastSeenStatus,
          events: []
        };
        timelineByStatus.push(currentGroup);
      }

      const eventItem = {
        id: event.timeline_id,
        event_type: event.event_type,
        created_at: event.timeline_created_at,
        note: event.note || event.reminder || null,
        source_type: event.event_type.includes('reminder') ? 'reminder' : 'timeline',
        updated_user: event.updated_user || {}
      };

      if (currentGroup) {
        currentGroup.events.push(eventItem);
      }
    }

    res.status(200).json([
      {
        assignment_id: parseInt(id),
        timeline_by_status: timelineByStatus
      }
    ]);

  } catch (err) {
    console.error('❌ Unexpected error in getAssignmentTimeline:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllPendingReminders = async (req, res) => {
  try {
    const selectQuery = `
      SELECT * FROM assignment_reminders
      WHERE status = 'pending'
      ORDER BY date_and_time ASC
    `;

    const result = await query(selectQuery);

    if (!result.rows || result.rows.length === 0) {
      return res.status(200).json({ error: 'No pending reminders found' });
    }

    return res.status(200).json({ reminders: result.rows });

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

    // Call SQL function directly
    const functionQuery = `SELECT * FROM update_assignment_reminder_status($1, $2)`;
    
    const result = await query(functionQuery, [id, updated_by]);

    return res.status(200).json({
      message: "✅ Reminder status updated successfully",
      updatedReminderId: result.rows[0]?.updated_reminder_id,
      newTimelineEntryId: result.rows[0]?.timeline_id
    });

  } catch (err) {
    console.error("❌ Unexpected error in updateReminderStatus:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};