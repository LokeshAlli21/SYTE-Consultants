import { supabase } from '../supabase/supabaseClient.js';

export const uploadProjectData = async (req, res) => {
  try {
    const {
      channel_partner,
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
    } = req.body;

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        channel_partner,
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
        registration_date: registration_date || null,
        expiry_date: expiry_date || null,
      }]);

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
      .select('id, project_name, promoter_name, rera_number, district, city, registration_date, expiry_date');

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

export const getAllUnits = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('project_units')
      .select(
        `id, project_id, unit_name, unit_type, carpet_area, unit_status, customer_name,
         agreement_value, total_received, balance_amount, created_at, updated_at`
      );

    if (error) {
      console.error('❌ Error fetching units:', error);
      return res.status(500).json({ error: 'Failed to fetch units', details: error });
    }

    res.status(200).json({ units: data });
  } catch (err) {
    console.error('❌ Unexpected error in getAllUnits:', err);
    res.status(500).json({ error: 'Internal server error' });
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


export const uploadProjectProfessionalData = async (req, res) => {
  try {
    const { project_id, engineer, architect, ca } = req.body;
    // console.log('engineer: ',engineer);
    // console.log('architect: ',architect);
    // console.log('ca: ',ca);
    

    if (!project_id) {
      return res.status(400).json({ message: "Missing project_id" });
    }

    // Insert engineer
    const { data: engineerData, error: engineerError } = await supabase
      .from('engineers')
      .insert([engineer])
      .select()
      .single();

    if (engineerError) {
      console.error('❌ Error inserting engineer:', engineerError);
      return res.status(500).json({ message: 'Failed to insert engineer', error: engineerError });
    }

    // Insert architect
    const { data: architectData, error: architectError } = await supabase
      .from('architects')
      .insert([architect])
      .select()
      .single();

    if (architectError) {
      console.error('❌ Error inserting architect:', architectError);
      return res.status(500).json({ message: 'Failed to insert architect', error: architectError });
    }

    // Insert CA
    const { data: caData, error: caError } = await supabase
      .from('cas')
      .insert([ca])
      .select()
      .single();

    if (caError) {
      console.error('❌ Error inserting CA:', caError);
      return res.status(500).json({ message: 'Failed to insert CA', error: caError });
    }

    // console.log("engineerData.id: ",engineerData.id);
    // console.log("architectData.id: ",architectData.id);
    // console.log("caData.id: ",caData.id);
    // console.log("project_id: ",project_id);
    
    

    // Insert into project_professional_details
    const { data: linkData, error: linkError } = await supabase
    .from('project_professional_details')
    .upsert([
      {
        project_id,
        engineer_id: engineerData.id,
        architect_id: architectData.id,
        ca_id: caData.id,
      }
    ], { onConflict: 'project_id' })
    .select()
    .single(); // 👈 ensure it returns a single row  

    // console.log('linkData: ',linkData);
    
      

    if (linkError) {
      console.error('❌ Error linking professional details to project:', linkError);
      return res.status(500).json({ message: 'Failed to link professional details', error: linkError });
    }

    res.status(201).json({
      message: "✅ Project professional details uploaded successfully",
      data: {
        engineer_id: engineerData.id,
        architect_id: architectData.id,
        ca_id: caData.id,
        project_professional_details_id: linkData[0]?.id
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
    // console.log(unit);
    
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
      "agreement_or_sale_deed_date", "afs_uploaded_url", "sale_deed_uploaded_url"
    ];

    const sanitizedUnit = {};

    // Loop through the unit and sanitize the values
    Object.entries(unit).forEach(([key, value]) => {
      // Skip numerical fields with 0
      if (numFields.includes(key) && Number(value) === 0) return;

      // Skip empty strings
      if (stringFields.includes(key) && value === '') return;

      // Always keep required fields
      sanitizedUnit[key] = value;
    });

    // Perform the upsert operation where 'project_id' is the conflict target
    const { error } = await supabase
      .from('project_units')
      .upsert([sanitizedUnit], { onConflict: ['project_id'] });

    // console.log(error);

    if (error) {
      return res.status(500).json({ message: '❌ Failed to upsert unit data', error });
    }

    res.status(201).json({ message: '✅ Project unit upserted successfully' });
  } catch (error) {
    console.error('❌ Error inserting/updating project unit:', error);
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
    const { project_id, ...documentData } = req.body;
    // console.log(req.body);
    
    if (!project_id) return res.status(400).json({ message: 'Missing project_id' });

    const filtered = {};
    Object.entries(documentData).forEach(([key, value]) => {
      if (!value || value === 'null' || value === 'undefined') return;
      filtered[key] = value;
    });

    const { data, error } = await supabase.from('project_documents').upsert([{ project_id, ...filtered }], { onConflict: 'project_id' });
    // console.log('data: ',data);
    // console.log('error: ',error);
    
    if (error) return res.status(500).json({ message: 'Failed to insert documents', error });

    res.status(201).json({ message: '✅ Project documents uploaded successfully' });
  } catch (error) {
    console.error('❌ Error inserting project documents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const addBuildingProgress = async (req, res) => {
  try {
    const { project_id, ...progressData } = req.body;
    // console.log(req.body);
    
    if (!project_id) return res.status(400).json({ message: 'Missing project_id' });

    const filtered = {};
    Object.entries(progressData).forEach(([key, value]) => {
      if (typeof value === 'number' && value === 0) return;
      filtered[key] = value;
    });

    const { error } = await supabase.from('site_progress').upsert([{ project_id, ...filtered }], { onConflict: 'project_id' });
    // console.log(error);
    
    if (error) return res.status(500).json({ message: 'Failed to insert progress data', error });

    res.status(201).json({ message: '✅ Building progress uploaded successfully' });
  } catch (error) {
    console.error('❌ Error inserting building progress:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const addCommonAreasProgress = async (req, res) => {
  try {
    const { project_id, ...commonData } = req.body;
    if (!project_id) return res.status(400).json({ message: 'Missing project_id' });

    const filtered = {};
    Object.entries(commonData).forEach(([key, value]) => {
      if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) return;
      filtered[key] = value;
    });

    const { error } = await supabase.from('site_progress').upsert([{ project_id, ...filtered }], { onConflict: 'project_id' });
    if (error) return res.status(500).json({ message: 'Failed to insert common areas progress', error });

    res.status(201).json({ message: '✅ Common areas progress uploaded successfully' });
  } catch (error) {
    console.error('❌ Error inserting common area progress:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


