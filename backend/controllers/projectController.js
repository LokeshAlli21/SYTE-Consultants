import { supabase } from '../supabase/supabaseClient.js';
import getCurrentISTTimestamp from './timestampt.js'

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
    
    // Build insert object with conditional fields
    const insertData = {
      channel_partner_id,
      promoter_id,
      promoter_name,
      project_name,
      project_type,
      project_address,
      login_id,
      password,
      district,
      city,
      rera_number,
      rera_certificate_uploaded_url,
      registration_date: registration_date || null,
      expiry_date: expiry_date || null,
      created_by:userId,
    };
    
    // Only add project_pincode if it’s not empty (undefined, null, or empty string)
    if (project_pincode) {
      insertData.project_pincode = project_pincode;
    }
    
    const { data, error } = await supabase
      .from('projects')
      .insert([insertData])
      .select();

    if (error) {
      console.error('❌ Error inserting project data:', error);
      return res.status(500).json({ error: 'Failed to insert project data', details: error });
    }

    res.status(201).json({ message: '✅ Project added successfully', data });

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

    console.log(userId, update_action);
    

    const updateData = {
      channel_partner_id,
      promoter_id,
      promoter_name,
      project_name,
      project_type,
      project_address,
      login_id,
      password,
      district,
      city,
      rera_number,
      rera_certificate_uploaded_url,
      registration_date: registration_date || null,
      expiry_date: expiry_date || null,
      updated_at: new Date().toISOString(),
      updated_by:userId,
      update_action,
    };

    if (project_pincode) {
      updateData.project_pincode = project_pincode;
    }

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select();

    if (error) {
      console.error('❌ Error updating project data:', error);
      return res.status(500).json({ error: 'Failed to update project data', details: error });
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({ message: '✅ Project updated successfully', data });

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

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('uploaded-documents')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        console.error(`Error uploading ${fieldName}:`, error);
        return res.status(500).json({ message: `Failed to upload ${fieldName}` });
      }

      const { data: publicUrlData } = supabase.storage
        .from('uploaded-documents')
        .getPublicUrl(filePath);

      uploadedUrls[fieldName] = publicUrlData.publicUrl;
    }

    return res.status(200).json(uploadedUrls);

  } catch (error) {
    console.error('Unexpected error in uploadProjectFiles:', error);
    return res.status(500).json({ message: 'Server error while uploading project files.' });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, project_name, promoter_name, rera_number, district, city, registration_date, expiry_date')
      .eq('status_for_delete','active');

    if (error) {
      console.error('❌ Error fetching projects:', error);
      return res.status(500).json({ error: 'Failed to fetch projects', details: error });
    }

    res.status(200).json({ projects: data });
  } catch (err) {
    console.error('❌ Unexpected error in getAllProjects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const getAllProjectsForQPR = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, project_name, rera_number, district, city,login_id')
      .eq('status_for_delete','active');

    if (error) {
      console.error('❌ Error fetching projects:', error);
      return res.status(500).json({ error: 'Failed to fetch projects', details: error });
    }

    res.status(200).json({ projects: data });
  } catch (err) {
    console.error('❌ Unexpected error in getAllProjects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const getAllProjectsForAA = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id, project_name, rera_number, district, city,login_id')
      .eq('status_for_delete','active');

    if (error) {
      console.error('❌ Error fetching projects:', error);
      return res.status(500).json({ error: 'Failed to fetch projects', details: error });
    }

    res.status(200).json({ projects: data });
  } catch (err) {
    console.error('❌ Unexpected error in getAllProjects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllUnitsForProject = async (req, res) => {
  try {
    const projectId = req.query['project-id'];

    if (!projectId) {
      return res.status(400).json({ error: "Missing project-id in query params" });
    }

    const { data, error } = await supabase
      .from('project_units')
      .select(
        `id, project_id, unit_name, unit_type, carpet_area, unit_status, customer_name,
         agreement_value, total_received, balance_amount, created_at, updated_at`
      )
      .eq('project_id', projectId)
      .eq('status_for_delete', 'active');

    if (error) {
      console.error('❌ Error fetching units:', error);
      return res.status(500).json({ error: 'Failed to fetch units', details: error });
    }

    res.status(200).json({ units: data });
  } catch (err) {
    console.error('❌ Unexpected error in getAllUnitsForProject:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllEngineers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('engineers')
      .select(`
        id, name, contact_number, email_id, office_address,
        licence_number, licence_uploaded_url,
        pan_number, pan_uploaded_url,
        letter_head_uploaded_url, sign_stamp_uploaded_url
      `);

    if (error) {
      console.error('❌ Error fetching engineers:', error);
      return res.status(500).json({ error: 'Failed to fetch engineers', details: error });
    }

    res.status(200).json({ engineers: data });
  } catch (err) {
    console.error('❌ Unexpected error in getAllEngineers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllArchitects = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('architects')
      .select(`
        id, name, contact_number, email_id, office_address,
        licence_number, licence_uploaded_url,
        pan_number, pan_uploaded_url,
        letter_head_uploaded_url, sign_stamp_uploaded_url
      `);

    if (error) {
      console.error('❌ Error fetching architects:', error);
      return res.status(500).json({ error: 'Failed to fetch architects', details: error });
    }

    res.status(200).json({ architects: data });
  } catch (err) {
    console.error('❌ Unexpected error in getAllArchitects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllCAs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('cas')
      .select(`
        id, name, contact_number, email_id, office_address,
        licence_number, licence_uploaded_url,
        pan_number, pan_uploaded_url,
        letter_head_uploaded_url, sign_stamp_uploaded_url
      `);

    if (error) {
      console.error('❌ Error fetching CAs:', error);
      return res.status(500).json({ error: 'Failed to fetch CAs', details: error });
    }

    res.status(200).json({ cas: data });
  } catch (err) {
    console.error('❌ Unexpected error in getAllCAs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectProfessionalData = async (req, res) => {
  try {
    const { id: project_id } = req.params;

    const { data, error } = await supabase
      .from('view_project_professional_details_full')
      .select('*')
      .eq('project_id', project_id)
      .maybeSingle();

    if (error) {
      console.error("❌ Error fetching project professional data:", error);
      return res.status(500).json({ error: "Failed to fetch project professional data", details: error });
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

    const { data, error } = await supabase
      .from('view_site_progress_full')
      .select('*')
      .eq('project_id', project_id)
      .maybeSingle();

    if (error) {
      console.error("❌ Supabase error fetching site progress:", error.message);
      return res.status(500).json({ error: "Failed to fetch site progress." });
    }

    if (!data) {
      return res.status(404).json({ error: "No site progress found for this project." });
    }

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

    const { data, error } = await supabase
      .from('view_project_documents_full')
      .select('*')
      .eq('project_id', project_id)
      .maybeSingle();

    if (error) {
      console.error("❌ Supabase error fetching documents:", error.message);
      return res.status(500).json({
        error: "Failed to fetch documents from the database.",
        details: error.message || "Something went wrong while fetching the documents.",
      });
    }

    if (!data) {
      console.log("⚠️ No documents found for project ID:", project_id);
      return res.status(404).json({
        error: "No documents found for this project.",
      });
    }

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

    const { data, error } = await supabase
      .from('view_projects_with_updated_user') // use view instead of raw table
      .select('*')
      .eq('id', project_id)
      .single(); // use single to get a single row directly

    if (error) {
      console.error("❌ Supabase error fetching project:", error.message);
      return res.status(500).json({ error: "Failed to fetch project." });
    }

    if (!data) {
      return res.status(404).json({ error: "Project not found." });
    }

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

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('uploaded-documents')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        console.error(`Error uploading ${fieldName}:`, error);
        return res.status(500).json({ message: `Failed to upload ${fieldName}` });
      }

      const { data: publicUrlData } = supabase.storage
        .from('uploaded-documents')
        .getPublicUrl(filePath);

      uploadedUrls[fieldName] = publicUrlData.publicUrl;
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
            userId,update_action } = req.body;

    if (!project_id) {
      return res.status(400).json({ message: "Missing project_id" });
    }

    const { data: linkData, error: linkError } = await supabase
      .from('project_professional_details')
      .upsert([
        {
          project_id,
          engineer_id: parseInt(engineer_id),
          architect_id: parseInt(architect_id),
          ca_id: parseInt(ca_id),
          updated_by: userId,
          update_action
        }
      ], { onConflict: 'project_id' })
      .select()
      .single();

    if (linkError) {
      console.error('❌ Error linking professional details to project:', linkError);
      return res.status(500).json({ message: 'Failed to link professional details', error: linkError });
    }

    res.status(201).json({
      message: "✅ Project professional details uploaded successfully",
      data: {
        engineer_id: engineer_id,
        architect_id: architect_id,
        ca_id: ca_id,
        project_professional_details_id: linkData?.id
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
      
      // e.g., afs_uploaded_url
      const filePath = `unit-documents/${field}/${file.originalname}`;

      const { error } = await supabase.storage.from('uploaded-documents').upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });
      if (error) return res.status(500).json({ message: `Upload failed for ${file.originalname}` });

      const { data: publicUrlData } = supabase.storage.from('uploaded-documents').getPublicUrl(filePath);
      uploadedUrls[file.fieldname] = publicUrlData.publicUrl;
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
    // console.log(req.body);
    
    
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
      // Skip numerical fields with 0
      if (numFields.includes(key) && Number(value) === 0 || value === '') return;

      // Skip empty strings
      if (stringFields.includes(key) && value === '') return;

      // Always keep required fields
      sanitizedUnit[key] = value;
    });

    console.log("sanitizedUnit: ",sanitizedUnit);
    

    // Perform the insert operation (not upsert)
    const { error } = await supabase
      .from('project_units')
      .insert([sanitizedUnit]);

    if (error) {
      return res.status(500).json({ message: '❌ Failed to insert unit data', error });
    }

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
    console.log(id);
    console.log(unit);
    
    

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
      if (numFields.includes(key) && Number(value) === 0 || value === '') return;
      if (stringFields.includes(key) && value === '') return;
      sanitizedUnit[key] = value;
    });

    // Perform update operation
    const { error } = await supabase
      .from('project_units')
      .update(sanitizedUnit)
      .eq('id', id);

    if (error) {
      return res.status(500).json({ message: '❌ Failed to update unit data', error });
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

      const { error } = await supabase.storage.from('uploaded-documents').upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });
      if (error) return res.status(500).json({ message: `Upload failed for ${file.originalname}` });

      const { data: publicUrlData } = supabase.storage.from('uploaded-documents').getPublicUrl(filePath);
      console.log(publicUrlData);
      
      uploadedUrls[file.fieldname] = publicUrlData.publicUrl;
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
    // console.log(req.body);
    
    if (!project_id) return res.status(400).json({ message: 'Missing project_id' });

    const filtered = {};
    Object.entries(documentData).forEach(([key, value]) => {
      if (!value || value === 'null' || value === 'undefined') return;
      filtered[key] = value;
    });

    const { data, error } = await supabase.from('project_documents').upsert([{ project_id, ...filtered,updated_by: userId,update_action }], { onConflict: 'project_id' });
    // console.log('data: ',data);
    // console.log('error: ',error);
    
    if (error) return res.status(500).json({ message: 'Failed to insert documents', error });

    res.status(201).json({ message: '✅ Project documents uploaded successfully' });
  } catch (error) {
    console.error('❌ Error inserting project documents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper to get or create site_progress entry and return its id
const getOrCreateSiteProgressId = async (project_id) => {
  // Try to fetch existing entry
  const { data: existing, error: fetchError } = await supabase
    .from('site_progress')
    .select('id')
    .eq('project_id', project_id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

  if (existing) return existing.id;

  // Insert new if not exists
  const { data: inserted, error: insertError } = await supabase
    .from('site_progress')
    .insert({ project_id })
    .select('id')
    .single();

  if (insertError) throw insertError;

  return inserted.id;
};

export const addBuildingProgress = async (req, res) => {
  try {
    const { project_id, ...progressData } = req.body;
    // console.log(req.body);
    

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

    console.log('site_progress_id :',site_progress_id);
    
    const { error } = await supabase
      .from('building_progress')
      .upsert([{ site_progress_id, ...filtered }], {
        onConflict: 'site_progress_id',
      });

      console.log('error :',error);
      

    if (error) {
      return res.status(500).json({ message: 'Failed to save building progress', error });
    }

    res.status(201).json({ message: '✅ Building progress uploaded successfully' });
  } catch (error) {
    console.error('❌ Error in addBuildingProgress:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const addCommonAreasProgress = async (req, res) => {
  try {
    const { project_id, updated_at, updated_by, update_action , ...commonData } = req.body;
    // console.log(req.body);
    

    if (!project_id) {
      return res.status(400).json({ message: 'Missing project_id' });
    }

    const filtered = {};
    Object.entries(commonData).forEach(([key, value]) => {
      if (value && typeof value === 'object' && Object.keys(value).length > 0) {
        filtered[key] = value;
      }
    });

    if (Object.keys(filtered).length === 0) {
      return res.status(400).json({ message: 'No valid common area data provided' });
    }

    const site_progress_id = await getOrCreateSiteProgressId(project_id);
    // console.log(filtered);
    

    const { error } = await supabase
      .from('common_areas_progress')
      .upsert([{ site_progress_id, updated_at, updated_by, update_action, ...filtered }], {
        onConflict: 'site_progress_id',
      });

    if (error) {
      return res.status(500).json({ message: 'Failed to save common areas progress', error });
    }

    res.status(201).json({ message: '✅ Common areas progress uploaded successfully' });
  } catch (error) {
    console.error('❌ Error in addCommonAreasProgress:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
};

export const softDeleteProjectById = async (req, res) => {
  const projectId = req.params.id;

  try {
    const { error } = await supabase
      .from('projects')
      .update({ status_for_delete: 'inactive' })
      .eq('id', projectId);

    if (error) {
      console.error('❌ Error soft deleting project:', error);
      return res.status(500).json({ error: 'Failed to delete project', details: error });
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
    const { error } = await supabase
      .from('project_units')
      .update({ status_for_delete: 'inactive' })
      .eq('id', unitId);

    if (error) {
      console.error('❌ Error soft deleting project unit:', error);
      return res.status(500).json({ error: 'Failed to delete unit', details: error });
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
    const { data, error } = await supabase
      .from('view_unit_with_updated_user')
      .select('*')
      .eq('id', unitId)
      .eq('status_for_delete', 'active')
      .single();

    if (error) {
      console.error("❌ Error fetching unit:", error);
      return res.status(500).json({ message: "Failed to fetch unit", details: error });
    }

    if (!data) {
      return res.status(404).json({ message: "Unit not found" });
    }

    res.status(200).json({ unit: data });
  } catch (err) {
    console.error("❌ Unexpected error in getUnitById:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const addEngineer = async (req, res) => {
  const  engineer  = req.body;

  const hasAnyValue = (obj) =>
    Object.values(obj || {}).some(
      (val) => val && typeof val === 'string' && val.trim() !== ''
    );

  try {
    if (!hasAnyValue(engineer)) {
      return res.status(400).json({ message: 'No valid engineer data provided' });
    }

    const { data, error } = await supabase
      .from('engineers')
      .insert([engineer])
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting engineer:', error);
      return res.status(500).json({ message: 'Failed to insert engineer', error });
    }

    return res.status(200).json({ message: 'Engineer added successfully', id: data.id });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return res.status(500).json({ message: 'Unexpected error occurred', error: err.message });
  }
};


export const addArchitect = async (req, res) => {
  const  architect  = req.body;

  const hasAnyValue = (obj) =>
    Object.values(obj || {}).some(
      (val) => val && typeof val === 'string' && val.trim() !== ''
    );

  try {
    if (!hasAnyValue(architect)) {
      return res.status(400).json({ message: 'No valid architect data provided' });
    }

    const { data, error } = await supabase
      .from('architects')
      .insert([architect])
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting architect:', error);
      return res.status(500).json({ message: 'Failed to insert architect', error });
    }

    return res.status(200).json({ message: 'Architect added successfully', id: data.id });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return res.status(500).json({ message: 'Unexpected error occurred', error: err.message });
  }
};

export const addCA = async (req, res) => {
  const  ca  = req.body;

  const hasAnyValue = (obj) =>
    Object.values(obj || {}).some(
      (val) => val && typeof val === 'string' && val.trim() !== ''
    );

  try {
    if (!hasAnyValue(ca)) {
      return res.status(400).json({ message: 'No valid CA data provided' });
    }

    const { data, error } = await supabase
      .from('cas')
      .insert([ca])
      .select()
      .single();

    if (error) {
      console.error('❌ Error inserting CA:', error);
      return res.status(500).json({ message: 'Failed to insert CA', error });
    }

    return res.status(200).json({ message: 'CA added successfully', id: data.id });
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return res.status(500).json({ message: 'Unexpected error occurred', error: err.message });
  }
};
