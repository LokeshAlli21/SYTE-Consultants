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