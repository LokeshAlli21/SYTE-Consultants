import { query } from '../aws/awsClient.js';

export const getBatchDataByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Call the Postgres function
    const selectQuery = `
      SELECT * FROM get_or_create_batch($1);
    `;

    const result = await query(selectQuery, [userId]);

    res.status(200).json({
      batchData: result.rows,
      batchId: result.rows.length > 0 ? result.rows[0].batch_id : null,
    });

  } catch (error) {
    console.error('❌ Unexpected error in getBatchDataByUserId:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTelecallingStatus = async (req, res) => {
  try {
    const { recordId } = req.params; // telecalling_data.id
    const { status } = req.body;     // new status

    console.log(`Updating status for ${recordId} to ${status}`);

    if (!recordId || !status) {
      return res.status(400).json({ error: 'recordId and status are required' });
    }

    // Allowed statuses (you can customize this)
    const allowedStatuses = ['pending', 'in_progress', 'interested', 'not_interested'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Update query
    const updateQuery = `
      UPDATE telecalling_data
      SET status = $1,
          updated_at = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
      WHERE id = $2
      RETURNING *;
    `;

    const result = await query(updateQuery, [status, recordId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.status(200).json({
      message: '✅ Status updated successfully',
      updatedRecord: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Unexpected error in updateTelecallingStatus:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

