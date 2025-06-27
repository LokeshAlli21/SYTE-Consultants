import { query, getClient, uploadToS3, getSignedUrl } from '../aws/awsClient.js';
import getCurrentISTTimestamp from './timestampt.js';

export const uploadProjectData = async (req, res) => {
  try {
    const {
      channel_partner_id,
      promoter_id,
      promoter_name,
      project_name,
      project_type,
      project_address,
      project_pincode,
      login_id,
      password,
      district,
      city,
      rera_number,
      rera_certificate_uploaded_url,
      registration_date,
      expiry_date,
      userId,
    } = req.body;
    
    // Build insert query with conditional fields
    let insertQuery = `
      INSERT INTO projects (
        channel_partner_id, promoter_id, promoter_name, project_name, project_type,
        project_address, login_id, password, district, city, rera_number,
        rera_certificate_uploaded_url, registration_date, expiry_date, created_by
        ${project_pincode ? ', project_pincode' : ''}
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        ${project_pincode ? ', $16' : ''}
      ) RETURNING *
    `;
    
    let params = [
      channel_partner_id, promoter_id, promoter_name, project_name, project_type,
      project_address, login_id, password, district, city, rera_number,
      rera_certificate_uploaded_url, registration_date || null, expiry_date || null, userId
    ];
    
    if (project_pincode) {
      params.push(project_pincode);
    }
    
    const result = await query(insertQuery, params);

    res.status(201).json({ message: '✅ Project added successfully', data: result.rows[0] });

  } catch (error) {
    console.error('❌ Unexpected error in uploadProjectData:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProjectData = async (req, res) => {
  try {
    const { projectId } = req.params;

    const {
      channel_partner_id,
      promoter_id,
      promoter_name,
      project_name,
      project_type,
      project_address,
      project_pincode,
      login_id,
      password,
      district,
      city,
      rera_number,
      rera_certificate_uploaded_url,
      registration_date,
      expiry_date,
      userId,
      update_action,
    } = req.body;

    let updateQuery = `
      UPDATE projects SET
        channel_partner_id = $1, promoter_id = $2, promoter_name = $3, project_name = $4,
        project_type = $5, project_address = $6, login_id = $7, password = $8,
        district = $9, city = $10, rera_number = $11, rera_certificate_uploaded_url = $12,
        registration_date = $13, expiry_date = $14, updated_at = NOW(), updated_by = $15,
        update_action = $16
        ${project_pincode ? ', project_pincode = $17' : ''}
      WHERE id = $${project_pincode ? '18' : '17'}
      RETURNING *
    `;

    let params = [
      channel_partner_id, promoter_id, promoter_name, project_name, project_type,
      project_address, login_id, password, district, city, rera_number,
      rera_certificate_uploaded_url, registration_date || null, expiry_date || null,
      userId, update_action
    ];

    if (project_pincode) {
      params.push(project_pincode);
    }
    params.push(projectId);

    const result = await query(updateQuery, params);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({ message: '✅ Project updated successfully', data: result.rows[0] });

  } catch (error) {
    console.error('❌ Unexpected error in updateProjectData:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadProjectFiles = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const uploadedUrls = {};

    for (const file of files) {
      const fieldName = file.fieldname;
      const originalName = file.originalname;

      // Choose folder based on field name
      let folder = "others";
      if (fieldName.includes("rera_certificate")) folder = "rera_certificate";

      const fileExt = originalName.split('.').pop();
      const filePath = `project-files/${folder}/${originalName}`;

      try {
        const s3Url = await uploadToS3(file, filePath);
        uploadedUrls[fieldName] = s3Url;
      } catch (error) {
        console.error(`Error uploading ${fieldName}:`, error);
        return res.status(500).json({ message: `Failed to upload ${fieldName}` });
      }
    }

    return res.status(200).json(uploadedUrls);

  } catch (error) {
    console.error('Unexpected error in uploadProjectFiles:', error);
    return res.status(500).json({ message: 'Server error while uploading project files.' });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const queryText = `
      SELECT id, project_name, promoter_name, rera_number, district, city, registration_date, expiry_date
      FROM projects
      WHERE status_for_delete = 'active'
    `;
    
    const result = await query(queryText);

    res.status(200).json({ projects: result.rows });
  } catch (err) {
    console.error('❌ Unexpected error in getAllProjects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllProjectsForQPR = async (req, res) => {
  try {
    const queryText = `
      SELECT id, project_name, rera_number, district, city, login_id
      FROM projects
      WHERE status_for_delete = 'active'
    `;
    
    const result = await query(queryText);

    res.status(200).json({ projects: result.rows });
  } catch (err) {
    console.error('❌ Unexpected error in getAllProjectsForQPR:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllProjectsForAA = async (req, res) => {
  try {
    const queryText = `
      SELECT id, project_name, rera_number, district, city, login_id
      FROM projects
      WHERE status_for_delete = 'active'
    `;
    
    const result = await query(queryText);

    res.status(200).json({ projects: result.rows });
  } catch (err) {
    console.error('❌ Unexpected error in getAllProjectsForAA:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUnitsForProject = async (req, res) => {
  try {
    const projectId = req.query['project-id'];

    if (!projectId) {
      return res.status(400).json({ error: "Missing project-id in query params" });
    }

    const queryText = `
      SELECT id, project_id, unit_name, unit_type, carpet_area, unit_status, customer_name,
             agreement_value, total_received, balance_amount, created_at, updated_at
      FROM project_units
      WHERE project_id = $1 AND status_for_delete = 'active'
    `;
    
    const result = await query(queryText, [projectId]);

    res.status(200).json({ units: result.rows });
  } catch (err) {
    console.error('❌ Unexpected error in getAllUnitsForProject:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Utility function to sign all *_url fields
export const signUrlFields = async (data) => {
  const signRecursive = async (obj) => {
    for (const key in obj) {
      const value = obj[key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        await signRecursive(value);
      } else if (Array.isArray(value)) {
        for (const item of value) {
          if (typeof item === 'object' && item !== null) {
            await signRecursive(item);
          }
        }
      } else if (typeof value === 'string' && key.endsWith('_url')) {
        obj[key] = await getSignedUrl(value);
      }
    }
  };

  await signRecursive(data);
  return data;
};


export const getAllEngineers = async (req, res) => {
  try {
    const queryText = `
      SELECT id, name, contact_number, email_id, office_address,
             licence_number, licence_uploaded_url,
             pan_number, pan_uploaded_url,
             letter_head_uploaded_url, sign_stamp_uploaded_url
      FROM engineers
    `;

    const result = await query(queryText);
    const signedEngineers = await signUrlFields(result.rows);

    res.status(200).json({ engineers: signedEngineers });
  } catch (err) {
    console.error('❌ Unexpected error in getAllEngineers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllArchitects = async (req, res) => {
  try {
    const queryText = `
      SELECT id, name, contact_number, email_id, office_address,
             licence_number, licence_uploaded_url,
             pan_number, pan_uploaded_url,
             letter_head_uploaded_url, sign_stamp_uploaded_url
      FROM architects
    `;

    const result = await query(queryText);
    const signedArchitects = await signUrlFields(result.rows);

    res.status(200).json({ architects: signedArchitects });
  } catch (err) {
    console.error('❌ Unexpected error in getAllArchitects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllCAs = async (req, res) => {
  try {
    const queryText = `
      SELECT id, name, contact_number, email_id, office_address,
             licence_number, licence_uploaded_url,
             pan_number, pan_uploaded_url,
             letter_head_uploaded_url, sign_stamp_uploaded_url
      FROM cas
    `;

    const result = await query(queryText);
    const signedCAs = await signUrlFields(result.rows);

    res.status(200).json({ cas: signedCAs });
  } catch (err) {
    console.error('❌ Unexpected error in getAllCAs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getProjectProfessionalData = async (req, res) => {
  try {
    const { id: project_id } = req.params;

    const queryText = `
      SELECT * FROM view_project_professional_details_full
      WHERE project_id = $1
    `;
    
    const result = await query(queryText, [project_id]);

    const data = result.rows[0] || null;

    if (data) {
      await signUrlFields(data);
    }

    res.status(200).json({ professionalData: data });
  } catch (err) {
    console.error("❌ Unexpected error in getProjectProfessionalData:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSiteProgress = async (req, res) => {
  try {
    const { id: project_id } = req.params;

    const queryText = `
      SELECT * FROM view_site_progress_full
      WHERE project_id = $1
    `;
    
    const result = await query(queryText, [project_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No site progress found for this project." });
    }

    const data = result.rows[0];

    res.status(200).json({
      siteProgress: {
        id: data.id,
        project_id: data.project_id,
      },
      buildingProgress: data.building_progress || null,
      commonAreasProgress: data.common_areas_progress || null,
    });
  } catch (error) {
    console.error("❌ Unexpected error fetching site progress:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { id: project_id } = req.params;

    const queryText = `
      SELECT * FROM view_project_documents_full
      WHERE project_id = $1
    `;
    
    const result = await query(queryText, [project_id]);

    if (result.rows.length === 0) {
      console.log("⚠️ No documents found for project ID:", project_id);
      return res.status(404).json({
        error: "No documents found for this project.",
      });
    }

    const data = result.rows[0];
    await signUrlFields(data);

    res.status(200).json({ documents: data });
  } catch (error) {
    console.error("❌ Unexpected error fetching documents:", error);
    res.status(500).json({
      error: "Internal server error",
      details: error.message || "An unexpected error occurred.",
    });
  }
};

export const getProject = async (req, res) => {
  try {
    const { id: project_id } = req.params;

    const queryText = `
      SELECT * FROM view_projects_with_updated_user
      WHERE id = $1
    `;
    
    const result = await query(queryText, [project_id]);

    console.log("🔍 Fetching project with ID:", project_id);
    console.log("Query result:", result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found." });
    }

    const data = result.rows[0];
    await signUrlFields(data);

    console.log("📁 Project data fetched successfully:", data);

    res.status(200).json({ project: data });
  } catch (error) {
    console.error("❌ Unexpected error fetching project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const uploadProjectProfessionalFiles = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const uploadedUrls = {};

    for (const file of files) {
      const fieldName = file.fieldname; // e.g., ca.pan_uploaded_url
      const originalName = file.originalname; // already renamed in frontend

      // Extract role and fileType from fieldName
      const [role, rawKey] = fieldName.split('.');
      const fileType = rawKey?.replace('_uploaded_url', '') || 'others';

      const filePath = `project-professionals/${role}/${fileType}/${originalName}`;

      try {
        const s3Url = await uploadToS3(file, filePath);
        uploadedUrls[fieldName] = s3Url;
      } catch (error) {
        console.error(`Error uploading ${fieldName}:`, error);
        return res.status(500).json({ message: `Failed to upload ${fieldName}` });
      }
    }

    return res.status(200).json(uploadedUrls);

  } catch (error) {
    console.error('Unexpected error in uploadProjectProfessionalFiles:', error);
    return res.status(500).json({ message: 'Server error while uploading professional files.' });
  }
};

export const adddProjectProfessionals = async (req, res) => {
  try {
    const { project_id, engineer, architect, ca, engineer_id, architect_id, ca_id,
            userId, update_action } = req.body;

    if (!project_id) {
      return res.status(400).json({ message: "Missing project_id" });
    }

    const upsertQuery = `
      INSERT INTO project_professional_details (
        project_id, engineer_id, architect_id, ca_id, updated_by, update_action
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (project_id) DO UPDATE SET
        engineer_id = EXCLUDED.engineer_id,
        architect_id = EXCLUDED.architect_id,
        ca_id = EXCLUDED.ca_id,
        updated_by = EXCLUDED.updated_by,
        update_action = EXCLUDED.update_action,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await query(upsertQuery, [
      project_id, parseInt(engineer_id), parseInt(architect_id), 
      parseInt(ca_id), userId, update_action
    ]);

    res.status(201).json({
      message: "✅ Project professional details uploaded successfully",
      data: {
        engineer_id: engineer_id,
        architect_id: architect_id,
        ca_id: ca_id,
        project_professional_details_id: result.rows[0]?.id
      }
    });

  } catch (error) {
    console.error('❌ Unexpected error in uploadProjectProfessionalData:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadUnitFiles = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).json({ message: 'No files uploaded.' });

    const uploadedUrls = {};

    for (const file of files) {
      console.log(file.fieldname); // sale_deed_uploaded_url
      const field = file.fieldname.replace('_uploaded_url', '');
      console.log(field); // sale_deed
      
      const filePath = `unit-documents/${field}/${file.originalname}`;

      try {
        const s3Url = await uploadToS3(file, filePath);
        uploadedUrls[file.fieldname] = s3Url;
      } catch (error) {
        return res.status(500).json({ message: `Upload failed for ${file.originalname}` });
      }
    }

    return res.status(200).json(uploadedUrls);
  } catch (error) {
    console.error('❌ Unit file upload error:', error);
    res.status(500).json({ message: 'Error uploading unit files.' });
  }
};

export const uploadProjectUnits = async (req, res) => {
  try {
    const unit = req.body;
    
    if (!unit || !unit.project_id) {
      return res.status(400).json({ message: 'Missing project_id or unit data' });
    }

    // Remove the 'id' field from the unit object (if it exists)
    delete unit.id;

    // Sanitize numerical and empty values
    const numFields = [
      "carpet_area", "agreement_value",
      "received_fy_2018_19", "received_fy_2019_20", "received_fy_2020_21", "received_fy_2021_22",
      "received_fy_2022_23", "received_fy_2023_24", "received_fy_2024_25", "received_fy_2025_26",
      "received_fy_2026_27", "received_fy_2027_28", "received_fy_2028_29", "received_fy_2029_30",
      "total_received", "balance_amount"
    ];

    const stringFields = [
      "agreement_for_sale_date", "sale_deed_date", "afs_uploaded_url", "sale_deed_uploaded_url"
    ];

    const sanitizedUnit = {};

    // Loop through the unit and sanitize the values
    Object.entries(unit).forEach(([key, value]) => {
      // For numerical fields: set to 0 if empty or null, otherwise keep the value
      if (numFields.includes(key)) {
        sanitizedUnit[key] = (value === '' || value === null || value === undefined) ? 0 : Number(value);
        return;
      }

      // Skip empty strings for string fields
      if (stringFields.includes(key) && value === '') return;

      // Always keep other fields (including required fields)
      sanitizedUnit[key] = value;
    });

    const { updated_user, ...dataToUpload } = sanitizedUnit;

    // Build dynamic insert query
    const columns = Object.keys(dataToUpload);
    const values = Object.values(dataToUpload);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');

    const insertQuery = `
      INSERT INTO project_units (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await query(insertQuery, values);

    res.status(201).json({ message: '✅ Project unit inserted successfully' });
  } catch (error) {
    console.error('❌ Error inserting project unit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProjectUnits = async (req, res) => {
  try {
    const unit = req.body;
    const { id } = req.params;

    if (!id || !unit || !unit.project_id) {
      return res.status(400).json({ message: 'Missing id or required unit data' });
    }

    // Sanitize numerical and empty values
    const numFields = [
      "carpet_area", "agreement_value",
      "received_fy_2018_19", "received_fy_2019_20", "received_fy_2020_21", "received_fy_2021_22",
      "received_fy_2022_23", "received_fy_2023_24", "received_fy_2024_25", "received_fy_2025_26",
      "received_fy_2026_27", "received_fy_2027_28", "received_fy_2028_29", "received_fy_2029_30",
      "total_received", "balance_amount"
    ];

    const stringFields = [
      "agreement_for_sale_date", "sale_deed_date", "afs_uploaded_url", "sale_deed_uploaded_url"
    ];

    const sanitizedUnit = {};

    Object.entries(unit).forEach(([key, value]) => {
      // For numerical fields: set to 0 if empty or null, otherwise keep the value
      if (numFields.includes(key)) {
        sanitizedUnit[key] = (value === '' || value === null || value === undefined) ? 0 : Number(value);
        return;
      }

      // Skip empty strings for string fields
      if (stringFields.includes(key) && value === '') return;

      // Always keep other fields
      sanitizedUnit[key] = value;
    });

    const { updated_user, ...dataToUpload } = sanitizedUnit;

    // Build dynamic update query
    const columns = Object.keys(dataToUpload);
    const values = Object.values(dataToUpload);
    const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');

    const updateQuery = `
      UPDATE project_units 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${columns.length + 1}
      RETURNING *
    `;

    const result = await query(updateQuery, [...values, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    res.status(200).json({ message: '✅ Project unit updated successfully' });
  } catch (error) {
    console.error('❌ Error updating project unit:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const uploadDocumentFiles = async (req, res) => {
  try {
    const files = req.files;
    if (!files?.length) return res.status(400).json({ message: 'No files uploaded.' });

    const uploadedUrls = {};

    for (const file of files) {
      const field = file.fieldname.replace('_uploaded_url', '');
      const filePath = `project-documents/${field}/${file.originalname}`;

      try {
        const s3Url = await uploadToS3(file, filePath);
        uploadedUrls[file.fieldname] = s3Url;
      } catch (error) {
        return res.status(500).json({ message: `Upload failed for ${file.originalname}` });
      }
    }

    res.status(200).json(uploadedUrls);
  } catch (error) {
    console.error('❌ Project document upload error:', error);
    res.status(500).json({ message: 'Error uploading project documents.' });
  }
};

export const uploadProjectDocuments = async (req, res) => {
  try {
    const { project_id, userId, update_action, ...documentData } = req.body;
    
    if (!project_id) return res.status(400).json({ message: 'Missing project_id' });

    const filtered = {};
    Object.entries(documentData).forEach(([key, value]) => {
      if (!value || value === 'null' || value === 'undefined') return;
      filtered[key] = value;
    });

    // Add tracking fields
    filtered.updated_by = userId;
    filtered.update_action = update_action;

    // Build dynamic upsert query
    const columns = ['project_id', ...Object.keys(filtered)];
    const values = [project_id, ...Object.values(filtered)];
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    
    const updateColumns = Object.keys(filtered);
    const updateSet = updateColumns.map(col => `${col} = EXCLUDED.${col}`).join(', ');

    const upsertQuery = `
      INSERT INTO project_documents (${columns.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (project_id) DO UPDATE SET
        ${updateSet},
        updated_at = NOW()
      RETURNING *
    `;

    const result = await query(upsertQuery, values);

    res.status(201).json({ message: '✅ Project documents uploaded successfully' });
  } catch (error) {
    console.error('❌ Error inserting project documents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper to get or create site_progress entry and return its id
const getOrCreateSiteProgressId = async (project_id) => {
  // Try to fetch existing entry
  const selectQuery = `SELECT id FROM site_progress WHERE project_id = $1`;
  const selectResult = await query(selectQuery, [project_id]);

  if (selectResult.rows.length > 0) {
    return selectResult.rows[0].id;
  }

  // Insert new if not exists
  const insertQuery = `
    INSERT INTO site_progress (project_id)
    VALUES ($1)
    RETURNING id
  `;
  const insertResult = await query(insertQuery, [project_id]);
  
  return insertResult.rows[0].id;
};

export const addBuildingProgress = async (req, res) => {
  try {
    const { project_id, ...progressData } = req.body;

    if (!project_id) {
      return res.status(400).json({ message: 'Missing project_id' });
    }

    // Clean the input data
    const filtered = {};
    Object.entries(progressData).forEach(([key, value]) => {
      if (value !== null && value !== '' && value !== undefined) {
        filtered[key] = value;
      }
    });

    if (Object.keys(filtered).length === 0) {
      return res.status(400).json({ message: 'No valid building progress data provided' });
    }

    const site_progress_id = await getOrCreateSiteProgressId(project_id);

    // Build dynamic upsert query
    const columns = ['site_progress_id', ...Object.keys(filtered)];
    const values = [site_progress_id, ...Object.values(filtered)];
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    
    const updateColumns = Object.keys(filtered);
    const updateSet = updateColumns.map(col => `${col} = EXCLUDED.${col}`).join(', ');

    const upsertQuery = `
      INSERT INTO building_progress (${columns.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (site_progress_id) DO UPDATE SET
        ${updateSet},
        updated_at = NOW()
      RETURNING *
    `;

    const result = await query(upsertQuery, values);

    res.status(201).json({ message: '✅ Building progress uploaded successfully' });
  } catch (error) {
    console.error('❌ Error in addBuildingProgress:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const addCommonAreasProgress = async (req, res) => {
  try {
    const { project_id, updated_at, updated_by, update_action, ...commonData } = req.body;

    if (!project_id) {
      return res.status(400).json({ message: 'Missing project_id' });
    }

    const filtered = {};
    Object.entries(commonData).forEach(([key, value]) => {
      if (value && typeof value === 'object' && Object.keys(value).length > 0) {
        filtered[key] = JSON.stringify(value); // Store as JSON string
      }
    });

    if (Object.keys(filtered).length === 0) {
      return res.status(400).json({ message: 'No valid common area data provided' });
    }

    const site_progress_id = await getOrCreateSiteProgressId(project_id);

    // Add tracking fields
    filtered.updated_by = updated_by;
    filtered.update_action = update_action;

    // Build dynamic upsert query
    const columns = ['site_progress_id', ...Object.keys(filtered)];
    const values = [site_progress_id, ...Object.values(filtered)];
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    
    const updateColumns = Object.keys(filtered);
    const updateSet = updateColumns.map(col => `${col} = EXCLUDED.${col}`).join(', ');

    const upsertQuery = `
      INSERT INTO common_areas_progress (${columns.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT (site_progress_id) DO UPDATE SET
        ${updateSet},
        updated_at = NOW()
      RETURNING *
    `;

    const result = await query(upsertQuery, values);

    res.status(201).json({ message: '✅ Common areas progress uploaded successfully' });
  } catch (error) {
    console.error('❌ Error in addCommonAreasProgress:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const softDeleteProjectById = async (req, res) => {
  const projectId = req.params.id;

  try {
    const result = await query(
      'UPDATE projects SET status_for_delete = $1 WHERE id = $2',
      ['inactive', projectId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({ message: '✅ Project marked as inactive' });
  } catch (err) {
    console.error('❌ Unexpected error in softDeleteProjectById:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const softDeleteProjectUnitById = async (req, res) => {
  const unitId = req.params.id;

  try {
    const result = await query(
      'UPDATE project_units SET status_for_delete = $1 WHERE id = $2',
      ['inactive', unitId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    res.status(200).json({ message: '✅ Unit marked as inactive' });
  } catch (err) {
    console.error('❌ Unexpected error in softDeleteProjectUnitById:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUnitById = async (req, res) => {
  const unitId = req.params.id;

  try {
    const result = await query(
      'SELECT * FROM view_unit_with_updated_user WHERE id = $1 AND status_for_delete = $2',
      [unitId, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Unit not found" });
    }

    res.status(200).json({ unit: result.rows[0] });
  } catch (err) {
    console.error("❌ Unexpected error in getUnitById:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addEngineer = async (req, res) => {
  const engineer = req.body;

  const hasAnyValue = (obj) =>
    Object.values(obj || {}).some(
      (val) => val && typeof val === 'string' && val.trim() !== ''
    );

  try {
    if (!hasAnyValue(engineer)) {
      return res.status(400).json({ message: 'No valid engineer data provided' });
    }

    // Dynamically build the INSERT query based on the engineer object
    const columns = Object.keys(engineer).filter(key => engineer[key] !== undefined && engineer[key] !== null);
    const values = columns.map(key => engineer[key]);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const columnNames = columns.join(', ');

    const insertQuery = `
      INSERT INTO engineers (${columnNames}) 
      VALUES (${placeholders}) 
      RETURNING id
    `;

    const result = await query(insertQuery, values);

    if (result.rows.length === 0) {
      throw new Error('Failed to insert engineer - no ID returned');
    }

    return res.status(200).json({ 
      message: 'Engineer added successfully', 
      id: result.rows[0].id 
    });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return res.status(500).json({ 
      message: 'Unexpected error occurred', 
      error: err.message 
    });
  }
};

export const addArchitect = async (req, res) => {
  const architect = req.body;

  const hasAnyValue = (obj) =>
    Object.values(obj || {}).some(
      (val) => val && typeof val === 'string' && val.trim() !== ''
    );

  try {
    if (!hasAnyValue(architect)) {
      return res.status(400).json({ message: 'No valid architect data provided' });
    }

    // Dynamically build the INSERT query based on the architect object
    const columns = Object.keys(architect).filter(key => architect[key] !== undefined && architect[key] !== null);
    const values = columns.map(key => architect[key]);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const columnNames = columns.join(', ');

    const insertQuery = `
      INSERT INTO architects (${columnNames}) 
      VALUES (${placeholders}) 
      RETURNING id
    `;

    const result = await query(insertQuery, values);

    if (result.rows.length === 0) {
      throw new Error('Failed to insert architect - no ID returned');
    }

    return res.status(200).json({ 
      message: 'Architect added successfully', 
      id: result.rows[0].id 
    });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return res.status(500).json({ 
      message: 'Unexpected error occurred', 
      error: err.message 
    });
  }
};

export const addCA = async (req, res) => {
  const ca = req.body;

  const hasAnyValue = (obj) =>
    Object.values(obj || {}).some(
      (val) => val && typeof val === 'string' && val.trim() !== ''
    );

  try {
    if (!hasAnyValue(ca)) {
      return res.status(400).json({ message: 'No valid CA data provided' });
    }

    // Dynamically build the INSERT query based on the ca object
    const columns = Object.keys(ca).filter(key => ca[key] !== undefined && ca[key] !== null);
    const values = columns.map(key => ca[key]);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const columnNames = columns.join(', ');

    const insertQuery = `
      INSERT INTO cas (${columnNames}) 
      VALUES (${placeholders}) 
      RETURNING id
    `;

    const result = await query(insertQuery, values);

    if (result.rows.length === 0) {
      throw new Error('Failed to insert CA - no ID returned');
    }

    return res.status(200).json({ 
      message: 'CA added successfully', 
      id: result.rows[0].id 
    });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return res.status(500).json({ 
      message: 'Unexpected error occurred', 
      error: err.message 
    });
  }
};