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

export const getLeadsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 20, search = "" } = req.query;

    const offset = (page - 1) * limit;

    // 1. Check user role
    const roleCheckQuery = `
      SELECT role 
      FROM users 
      WHERE id = $1;
    `;
    const roleResult = await query(roleCheckQuery, [userId]);

    if (roleResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userRole = roleResult.rows[0].role;

    // 2. Build base query
    let baseQuery = `
      FROM leads l
      WHERE 1=1
    `;
    let queryParams = [];
    let paramIndex = 1;

    // Apply role restriction
    if (userRole !== "admin") {
      baseQuery += ` AND l.generated_by = $${paramIndex}`;
      queryParams.push(userId);
      paramIndex++;
    }

    // Apply search filter
    if (search) {
      baseQuery += ` AND (
        l.promoter_name ILIKE $${paramIndex}
        OR l.project_name ILIKE $${paramIndex}
        OR l.profile_mobile_number ILIKE $${paramIndex}
        OR l.registration_mobile_number ILIKE $${paramIndex}
        OR l.profile_email ILIKE $${paramIndex}
        OR l.registration_email ILIKE $${paramIndex}
        OR l.district ILIKE $${paramIndex}
      )`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // 3. Get total count for pagination
    const countQuery = `SELECT COUNT(*) AS total ${baseQuery}`;
    const countResult = await query(countQuery, queryParams);
    const totalRecords = parseInt(countResult.rows[0].total, 10);
    const totalPages = Math.ceil(totalRecords / limit);

    // 4. Fetch paginated leads
    const dataQuery = `
      SELECT l.*
      ${baseQuery}
      ORDER BY l.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;
    queryParams.push(limit, offset);

    const dataResult = await query(dataQuery, queryParams);

    // 5. Return response
    res.status(200).json({
      leads: dataResult.rows,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: parseInt(page, 10),
        limit: parseInt(limit, 10),
      },
    });
  } catch (error) {
    console.error("❌ Unexpected error in getLeadsByUser:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
