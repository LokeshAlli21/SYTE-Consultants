// controllers/promoterController.js
import { query, getClient, uploadToS3, deleteFromS3, getSignedUrl } from '../aws/awsClient.js'; // Changed from supabase to awsClient
import getCurrentISTTimestamp from './timestampt.js';

export const uploadPromoterData = async (req, res) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    // Step 1: Extract data from request body
    const {
      promoter_name,
      contact_number,
      email_id,
      district,
      city,
      promoter_type,
      office_address,
      contact_person_name,
      promoter_photo_uploaded_url,
      promoter_details,
      userId,
      username,
      password,
    } = req.body;

    if (!userId) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Step 2: Insert into 'promoters' table
    const promoterInsertQuery = `
      INSERT INTO promoters (
        promoter_name, contact_number, email_id, district, city, 
        promoter_type, created_by, created_at, status_for_delete,
        username, password
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
      RETURNING id
    `;

    const promoterValues = [
      promoter_name,
      contact_number,
      email_id,
      district,
      city,
      promoter_type,
      userId,
      getCurrentISTTimestamp(),
      'active',
      username,
      password
    ];

    const promoterResult = await client.query(promoterInsertQuery, promoterValues);

    if (!promoterResult.rows || promoterResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(500).json({ error: 'No promoter data returned' });
    }

    const promoterId = promoterResult.rows[0].id;

    // Step 3: Build promoter_details object
    const promoterDetails = {
      office_address,
      contact_person_name,
      promoter_id: promoterId,
      promoter_photo_uploaded_url,
    };

    // Step 4: Filter out empty/invalid fields
    const filteredPromoterDetails = {};
    Object.entries(promoterDetails).forEach(([key, value]) => {
      if (value && value !== 'null' && value !== 'undefined' && value !== '') {
        filteredPromoterDetails[key] = value;
      }
    });

    // Step 5: Insert into 'promoter_details' table
    const detailsColumns = Object.keys({ ...filteredPromoterDetails, created_by: userId });
    const detailsValues = Object.values({ ...filteredPromoterDetails, created_by: userId });
    const detailsPlaceholders = detailsValues.map((_, index) => `$${index + 1}`).join(', ');

    const detailsInsertQuery = `
      INSERT INTO promoter_details (${detailsColumns.join(', ')}) 
      VALUES (${detailsPlaceholders}) 
      RETURNING id
    `;

    const detailsResult = await client.query(detailsInsertQuery, detailsValues);

    if (!detailsResult.rows || detailsResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(500).json({ error: 'No details data returned' });
    }

    const promoterDetailsId = detailsResult.rows[0].id;

    // Step 6: Filter promoter_details object
    const filteredAdditionalDetails = {};
    if (promoter_details && typeof promoter_details === 'object') {
      Object.entries(promoter_details).forEach(([key, value]) => {
        if (value && value !== 'null' && value !== 'undefined' && value !== '') {
          filteredAdditionalDetails[key] = value;
        }
      });
    }

    // Step 7: Insert additional details based on promoter_type
    const tableMap = {
      individual: 'individual_promoters',
      hindu_undivided_family: 'huf_promoters',
      proprietor: 'proprietor_promoters',
      company: 'company_promoters',
      partnership: 'partnership_promoters',
      limited_liability_partnership: 'llp_promoters',
      trust: 'trust_promoters',
      society: 'society_promoters',
      public_authority: 'public_authority_promoters',
      aop_boi: 'aop_boi_promoters',
      joint_venture: 'joint_venture_promoters',
    };

    const targetTable = tableMap[promoter_type];

    if (!targetTable) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid promoter type' });
    }

    if (Object.keys(filteredAdditionalDetails).length > 0) {
      const additionalColumns = Object.keys({ promoter_details_id: promoterDetailsId, ...filteredAdditionalDetails });
      const additionalValues = Object.values({ promoter_details_id: promoterDetailsId, ...filteredAdditionalDetails });
      const additionalPlaceholders = additionalValues.map((_, index) => `$${index + 1}`).join(', ');

      const additionalInsertQuery = `
        INSERT INTO ${targetTable} (${additionalColumns.join(', ')}) 
        VALUES (${additionalPlaceholders})
      `;

      await client.query(additionalInsertQuery, additionalValues);
    } else {
      // Insert with just promoter_details_id
      const additionalInsertQuery = `
        INSERT INTO ${targetTable} (promoter_details_id) 
        VALUES ($1)
      `;
      await client.query(additionalInsertQuery, [promoterDetailsId]);
    }

    await client.query('COMMIT');

    // Step 8: Success response
    return res.status(201).json({
      message: '✅ Promoter and details uploaded successfully',
      promoterData: promoterResult.rows[0],
      detailsData: detailsResult.rows[0],
      promoterId,
      promoterDetailsId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Unexpected error in uploadPromoterData:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    client.release();
  }
};

export const uploadPromoterFiles = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const uploadedUrls = {};

    // Define folder mapping for each specific fieldname
    const folderMap = {
      promoter_photo_uploaded_url: 'photo',
      aadhar_uploaded_url: "individual/aadhar",
      pan_uploaded_url: "individual/pan",
      proprietor_pan_uploaded_url: "proprietor/pan",
      karta_pan_uploaded_url: "huf/karta/pan",
      huf_pan_pan_uploaded_url: "huf/huf/pan",
      company_pan_uploaded_url: "company/pan",
      company_incorporation_uploaded_url: "company/incorporation",
      partnership_pan_uploaded_url: "partnership/pan",
      llp_pan_uploaded_url: "llp/pan",
      trust_pan_uploaded_url: "trust/pan",
      society_pan_uploaded_url: "society/pan",
      public_authority_pan_uploaded_url: "public_authority/pan",
      aop_boi_pan_uploaded_url: "aop_boi/pan",
      aop_boi_deed_of_formation_uploaded_url: "aop_boi/deed_of_formation",
      joint_venture_pan_uploaded_url: "joint_venture/pan",
      joint_venture_deed_of_formation_uploaded_url: "joint_venture/deed_of_formation"
    };

    for (const file of files) {
      const fieldName = file.fieldname;
      const originalName = file.originalname;

      // Determine folder from map or fallback to "others"
      const folder = folderMap[fieldName] || "others";

      const fileExt = originalName.split('.').pop();
      const timestamp = Date.now();
      const fileName = `${timestamp}-${originalName}`;
      const s3Key = `promoter-files/${folder}/${fileName}`;

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
    console.error('Unexpected error in uploadPromoterFiles:', error);
    return res.status(500).json({ message: 'Server error while uploading promoter files.' });
  }
};

export const getAllPromoters = async (req, res) => {
  try {
    const getAllQuery = `
      SELECT id, promoter_name, contact_number, email_id, district, city, 
             created_at, updated_at, promoter_type, created_by, updated_by, 
             update_action, created_at, username, password
      FROM promoters 
      WHERE status_for_delete = 'active'
      ORDER BY created_at DESC
    `;

    const result = await query(getAllQuery);

    res.status(200).json({ promoters: result.rows });
  } catch (err) {
    console.error('❌ Unexpected error in getAllPromoters:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

export const softDeletePromoterById = async (req, res) => {
  const promoterId = req.params.id;

  try {
    const softDeleteQuery = `
      UPDATE promoters 
      SET status_for_delete = 'inactive'
      WHERE id = $2
    `;

    const result = await query(softDeleteQuery, [new Date().toISOString(), promoterId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Promoter not found' });
    }

    res.status(200).json({ message: '✅ Promoter marked as inactive' });
  } catch (err) {
    console.error('❌ Unexpected error in softDeletePromoterById:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

export const getPromoterById = async (req, res) => {
  const { id } = req.params;

  try {
    // First, try to get from view if it exists, otherwise use individual queries
    let promoterData;
    
    try {
      // Try using the view first
      const viewQuery = `SELECT * FROM view_promoter_full WHERE id = $1`;
      const viewResult = await query(viewQuery, [id]);
      
      if (viewResult.rows.length > 0) {
        promoterData = viewResult.rows[0];
      }
    } catch (viewError) {
      console.log('View not available, using individual queries');
    }

    // If view doesn't exist or didn't return data, use individual queries
    if (!promoterData) {
      // Fetch base promoter info
      const promoterQuery = `
        SELECT p.*, pd.office_address, pd.contact_person_name, pd.promoter_photo_uploaded_url
        FROM promoters p
        LEFT JOIN promoter_details pd ON p.id = pd.promoter_id
        WHERE p.id = $1 AND p.status_for_delete = 'active'
      `;

      const promoterResult = await query(promoterQuery, [id]);

      if (!promoterResult.rows || promoterResult.rows.length === 0) {
        return res.status(404).json({ error: 'Promoter not found' });
      }

      promoterData = promoterResult.rows[0];
    }

    // Get promoter_details_id for fetching specific type details
    const detailsQuery = `SELECT id FROM promoter_details WHERE promoter_id = $1`;
    const detailsResult = await query(detailsQuery, [id]);
    
    const promoterDetailsId = detailsResult.rows[0]?.id;
    const promoterType = promoterData.promoter_type;

    let specificDetails = {};

    if (promoterDetailsId) {
      const tableMap = {
        individual: 'individual_promoters',
        hindu_undivided_family: 'huf_promoters',
        proprietor: 'proprietor_promoters',
        company: 'company_promoters',
        partnership: 'partnership_promoters',
        limited_liability_partnership: 'llp_promoters',
        trust: 'trust_promoters',
        society: 'society_promoters',
        public_authority: 'public_authority_promoters',
        aop_boi: 'aop_boi_promoters',
        joint_venture: 'joint_venture_promoters',
      };

      const tableName = tableMap[promoterType?.toLowerCase()];
      
      if (tableName) {
        try {
          const typeQuery = `SELECT * FROM ${tableName} WHERE promoter_details_id = $1`;
          const typeResult = await query(typeQuery, [promoterDetailsId]);
          
          if (typeResult.rows.length > 0) {
            specificDetails = typeResult.rows[0];
            // Convert *_url fields to signed URLs - with null check
            for (const key in specificDetails) {
              if (key.endsWith('_url') && specificDetails[key]) {
                specificDetails[key] = getSignedUrl(specificDetails[key]);
              }
            }
          }
        } catch (typeError) {
          console.error(`❌ Error fetching ${tableName} data:`, typeError);
        }
      }
    }

    const response = {
      ...promoterData,
      promoter_details: {
        office_address: promoterData.office_address,
        contact_person_name: promoterData.contact_person_name,
        // Fix: Check if the URL exists and is not null/undefined before calling getSignedUrl
        promoter_photo_uploaded_url: promoterData.promoter_photo_uploaded_url 
          ? getSignedUrl(promoterData.promoter_photo_uploaded_url) 
          : null,
        [promoterType]: {
          ...specificDetails,
        },
      },
    };

    return res.status(200).json({ promoter: response });
  } catch (err) {
    console.error('❌ Unexpected error in getPromoterById:', err);
    return res.status(500).json({ error: 'Internal server error', details: err.message });
  }
};

export const updatePromoter = async (req, res) => {
  const { id } = req.params;
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const {
      promoter_name,
      contact_number,
      email_id,
      district,
      city,
      promoter_type,
      office_address,
      contact_person_name,
      promoter_photo_uploaded_url,
      promoter_details,
      userId,
      update_action,
      username,
      password,
    } = req.body;

    if (!userId) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Step 1: Update 'promoters' table
    const updatePromoterQuery = `
      UPDATE promoters 
      SET promoter_name = $1, contact_number = $2, email_id = $3, 
          district = $4, city = $5, promoter_type = $6, 
          updated_by = $7, update_action = $8,
          username = $9, password = $10
      WHERE id = $12
      RETURNING id
    `;

    const promoterValues = [
      promoter_name,
      contact_number,
      email_id,
      district,
      city,
      promoter_type,
      userId,
      update_action,
      username,
      password,
      id
    ];

    const promoterResult = await client.query(updatePromoterQuery, promoterValues);

    if (!promoterResult.rows || promoterResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Promoter not found for update' });
    }

    // Step 2: Get promoter_details ID
    const getDetailsIdQuery = `SELECT id FROM promoter_details WHERE promoter_id = $1`;
    const detailsIdResult = await client.query(getDetailsIdQuery, [id]);

    if (!detailsIdResult.rows || detailsIdResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Promoter details not found' });
    }

    const promoterDetailsId = detailsIdResult.rows[0].id;

    // Step 3: Update promoter_details table
    const detailsToUpdate = {
      office_address,
      contact_person_name,
      promoter_photo_uploaded_url,
    };

    const filteredDetails = {};
    Object.entries(detailsToUpdate).forEach(([key, value]) => {
      if (value && value !== 'null' && value !== 'undefined' && value !== '') {
        filteredDetails[key] = value;
      }
    });

    if (Object.keys(filteredDetails).length > 0) {
      const updateColumns = Object.keys(filteredDetails);
      const updateValues = Object.values(filteredDetails);
      const updatePlaceholders = updateColumns.map((col, index) => `${col} = $${index + 1}`).join(', ');

      const updateDetailsQuery = `
        UPDATE promoter_details 
        SET ${updatePlaceholders}, updated_by = $${updateValues.length + 1}, 
            update_action = $${updateValues.length + 2}
        WHERE id = $${updateValues.length + 4}
        RETURNING id
      `;

      const detailsUpdateValues = [...updateValues, userId, update_action, new Date().toISOString(), promoterDetailsId];
      await client.query(updateDetailsQuery, detailsUpdateValues);
    }

    // Step 4: Update additional promoter type table
    const tableMap = {
      individual: 'individual_promoters',
      hindu_undivided_family: 'huf_promoters',
      proprietor: 'proprietor_promoters',
      company: 'company_promoters',
      partnership: 'partnership_promoters',
      limited_liability_partnership: 'llp_promoters',
      trust: 'trust_promoters',
      society: 'society_promoters',
      public_authority: 'public_authority_promoters',
      aop_boi: 'aop_boi_promoters',
      joint_venture: 'joint_venture_promoters',
    };

    const targetTable = tableMap[promoter_type];

    if (!targetTable) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid promoter type' });
    }

    const filteredAdditionalDetails = {};
    if (promoter_details && typeof promoter_details === 'object') {
      Object.entries(promoter_details).forEach(([key, value]) => {
        if (value && value !== 'null' && value !== 'undefined' && value !== '') {
          filteredAdditionalDetails[key] = value;
        }
      });
    }

    // Check if entry exists in the target table
    const checkExistingQuery = `SELECT * FROM ${targetTable} WHERE promoter_details_id = $1`;
    const existingResult = await client.query(checkExistingQuery, [promoterDetailsId]);

    if (existingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `No existing entry found in ${targetTable}` });
    }

    if (Object.keys(filteredAdditionalDetails).length > 0) {
      const additionalColumns = Object.keys(filteredAdditionalDetails);
      const additionalValues = Object.values(filteredAdditionalDetails);
      const additionalPlaceholders = additionalColumns.map((col, index) => `${col} = $${index + 1}`).join(', ');

      const updateAdditionalQuery = `
        UPDATE ${targetTable} 
        SET ${additionalPlaceholders}
        WHERE promoter_details_id = $${additionalValues.length + 1}
      `;

      await client.query(updateAdditionalQuery, [...additionalValues, promoterDetailsId]);
    }

    await client.query('COMMIT');

    // Step 5: Final success response
    return res.status(200).json({
      message: '✅ Promoter and details updated successfully',
      promoterData: promoterResult.rows[0],
      promoterDetailsId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Unexpected error in updatePromoter:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    client.release();
  }
};

export const checkUsernameAvailability = async (req, res) => {
  const { username } = req.params;

  try {
    if (!username) {
      return res.status(400).json({ available: false, message: 'Username is required' });
    }

    const queryText = 'SELECT COUNT(*) FROM promoters WHERE username = $1';
    const result = await query(queryText, [username]);
    const count = parseInt(result.rows[0].count, 10);

    // ✅ Always return same structure
    return res.status(200).json({ 
      available: count === 0, 
      message: count > 0 ? 'Username is already taken' : 'Username is available' 
    });

  } catch (error) {
    console.error('❌ Unexpected error in checkUsernameAvailability:', error);
    return res.status(500).json({ 
      available: false, 
      error: 'Internal server error', 
      details: error.message 
    });
  }
};