import { query, getClient, uploadToS3, getSignedUrl } from '../aws/awsClient.js';

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
      cp_photo_uploaded_url,
    } = req.body;

    const insertQuery = `
      INSERT INTO channel_partners (
        full_name, 
        contact_number, 
        alternate_contact_number, 
        email_id, 
        district, 
        city, 
        created_by,
        cp_photo_uploaded_url
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
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
      cp_photo_uploaded_url || null
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
      cp_photo_uploaded_url
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
        updated_at = CURRENT_TIMESTAMP,
        cp_photo_uploaded_url = $9
      WHERE id = $10
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
      cp_photo_uploaded_url || null,
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

console.log('Channel Partner found:', result.rows[0]);
    const channelPartner = result.rows[0];

    // If cp_photo_uploaded_url exists, generate signed URL
    if (channelPartner.cp_photo_uploaded_url) {
      channelPartner.cp_photo_uploaded_url = getSignedUrl(channelPartner.cp_photo_uploaded_url);
    }

    return res.status(200).json({ channelPartner });

  } catch (error) {
    console.error('❌ Unexpected error in getChannelPartnerById:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadChannelPartnerPhoto = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const uploadedUrls = {};

    // Define folder mapping for channel partner photo
    const folderMap = {
      cp_photo_uploaded_url: 'photo'
    };

    for (const file of files) {
      const fieldName = file.fieldname;
      const originalName = file.originalname;

      // Check if the field is cp_photo_uploaded_url
      if (fieldName !== 'cp_photo_uploaded_url') {
        return res.status(400).json({ 
          message: `Invalid field name: ${fieldName}. Only cp_photo_uploaded_url is allowed.` 
        });
      }

      // Determine folder from map
      const folder = folderMap[fieldName];

      const fileExt = originalName.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${timestamp}-${originalName}`;
      const s3Key = `channel-partner-files/${folder}/${fileName}`;

      try {
        // Upload to AWS S3
        const fileUrl = await uploadToS3(file, s3Key);
        uploadedUrls[fieldName] = fileUrl;
        console.log(`${fieldName} uploaded to ${fileUrl}`);
      } catch (uploadError) {
        console.error(`Error uploading ${fieldName}:`, uploadError);
        return res.status(500).json({ message: `Failed to upload ${fieldName}` });
      }
    }

    return res.status(200).json(uploadedUrls);

  } catch (error) {
    console.error('Unexpected error in uploadChannelPartnerPhoto:', error);
    return res.status(500).json({ message: 'Server error while uploading channel partner photo.' });
  }
};