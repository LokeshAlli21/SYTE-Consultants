import { query, getClient } from '../aws/awsClient.js';

export const createChannelPartner = async (req, res) => {
  try {
    const {
      full_name,
      contact_number,
      alternate_contact_number,
      email_id,
      district,
      city,
      userId,
    } = req.body;

    const insertQuery = `
      INSERT INTO channel_partners (
        full_name, 
        contact_number, 
        alternate_contact_number, 
        email_id, 
        district, 
        city, 
        created_by
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *;
    `;

    const values = [
      full_name,
      contact_number,
      alternate_contact_number || null,
      email_id || null,
      district || null,
      city || null,
      userId
    ];

    const result = await query(insertQuery, values);

    res.status(201).json({ 
      message: '✅ Channel Partner added successfully', 
      data: result.rows[0] 
    });

  } catch (error) {
    console.error('❌ Unexpected error in createChannelPartner:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateChannelPartner = async (req, res) => {
  const { id } = req.params;

  try {
    const {
      full_name,
      contact_number,
      alternate_contact_number,
      email_id,
      district,
      city,
      userId,
      update_action,
    } = req.body;

    const updateQuery = `
      UPDATE channel_partners 
      SET 
        full_name = $1,
        contact_number = $2,
        alternate_contact_number = $3,
        email_id = $4,
        district = $5,
        city = $6,
        updated_by = $7,
        update_action = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *;
    `;

    const values = [
      full_name,
      contact_number,
      alternate_contact_number || null,
      email_id || null,
      district || null,
      city || null,
      userId,
      update_action,
      id
    ];

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Channel Partner not found' });
    }

    res.status(200).json({ 
      message: '✅ Channel Partner updated successfully', 
      data: result.rows[0] 
    });

  } catch (error) {
    console.error('❌ Unexpected error in updateChannelPartner:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllChannelPartners = async (req, res) => {
  try {
    const selectQuery = `
      SELECT * FROM channel_partners 
      WHERE status_for_delete = 'active'
      ORDER BY created_at DESC;
    `;

    const result = await query(selectQuery);

    res.status(200).json({ channelPartners: result.rows });

  } catch (error) {
    console.error('❌ Unexpected error in getAllChannelPartners:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const softDeleteChannelPartnerById = async (req, res) => {
  const partnerId = req.params.id;

  try {
    const updateQuery = `
      UPDATE channel_partners 
      SET status_for_delete = 'inactive', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id;
    `;

    const result = await query(updateQuery, [partnerId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Channel Partner not found' });
    }

    res.status(200).json({ message: '✅ Channel Partner marked as inactive' });

  } catch (error) {
    console.error('❌ Unexpected error in softDeleteChannelPartnerById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getChannelPartnerById = async (req, res) => {
  const { id } = req.params;

  try {
    // First, try to use the view if it exists
    let selectQuery = `
      SELECT * FROM view_channel_partners_with_updated_user 
      WHERE id = $1;
    `;

    let result;
    
    try {
      result = await query(selectQuery, [id]);
    } catch (viewError) {
      // If view doesn't exist, fall back to direct table query with JOIN
      console.log('View not found, using direct query with JOIN');
      selectQuery = `
        SELECT 
          cp.*,
          u1.full_name as created_by_name,
          u2.full_name as updated_by_name
        FROM channel_partners cp
        LEFT JOIN users u1 ON cp.created_by = u1.id
        LEFT JOIN users u2 ON cp.updated_by = u2.id
        WHERE cp.id = $1 AND cp.status_for_delete = 'active';
      `;
      
      result = await query(selectQuery, [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Channel Partner not found or inactive' });
    }

    res.status(200).json({ channelPartner: result.rows[0] });

  } catch (error) {
    console.error('❌ Unexpected error in getChannelPartnerById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};