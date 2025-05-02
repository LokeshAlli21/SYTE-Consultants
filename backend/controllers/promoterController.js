// controllers/promoterController.js
import { supabase } from '../supabase/supabaseClient.js';

export const uploadPromoterData = async (req, res) => {
  try {
    // Step 1: Extract data from the request body
    const {
      promoter_name,
      contact_number,
      email_id,
      district,
      city,
      promoter_type,
      full_name,
      office_address,
      aadhar_number,
      pan_number,
      dob,
      contact_person_name,
      partnership_pan_number,
      company_pan_number,
      company_incorporation_number,
      aadhar_uploaded_url,
      pan_uploaded_url,
      partnership_pan_uploaded_url,
      company_pan_uploaded_url,
      company_incorporation_uploaded_url,
      promoter_photo_uploaded_url,
    } = req.body;

    // Step 2: Insert promoter basic data into 'Promoters' table
    const response = await supabase
  .from('promoters')
  .insert([{
    promoter_name,
    contact_number,
    email_id,
    district,
    city,
    promoter_type,
  }])
  .select('id');

console.log("🔍 Raw Supabase insert response:", response);
const { data: promoterData, error: promoterError, status, statusText } = response;

if (promoterError) {
  console.error('❌ Error inserting into Promoters:', promoterError);
  console.error('🔎 Supabase insert status:', status, statusText);
  return res.status(500).json({
    error: 'Failed to insert promoter data',
    details: promoterError,
    status,
    statusText
  });
}

    const promoterId = promoterData?.[0]?.id;

    if (!promoterId) {
      return res.status(500).json({ error: 'Failed to retrieve promoter ID after insert' });
    }

    // Step 3: Insert promoter details into 'PromoterDetails' table
    const { data: detailsData, error: detailsError } = await supabase
      .from('promoter_details')
      .insert([{
        full_name,
        office_address,
        aadhar_number,
        aadhar_uploaded_url,
        pan_number,
        pan_uploaded_url,
        dob: dob || null,
        contact_person_name,
        partnership_pan_number,
        partnership_pan_uploaded_url,
        company_pan_number,
        company_pan_uploaded_url,
        company_incorporation_number,
        company_incorporation_uploaded_url,
        promoter_photo_uploaded_url,
        promoter_id: promoterId // Link the promoter details to the promoter
      }]);

    if (detailsError) {
      console.error('Error inserting into PromoterDetails:', detailsError);
      return res.status(500).json({ error: 'Failed to insert promoter details', details: detailsError });
    }

    // Step 4: Return success response
    res.status(201).json({ message: 'Promoter and details uploaded successfully', promoterData, detailsData });

  } catch (error) {
    console.error('Unexpected error in uploadPromoterData:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadPromoterFiles = async (req, res) => {
  try {
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const uploadedUrls = {};

    for (const file of files) {
      const fieldName = file.fieldname;
      const originalName = file.originalname;

      // Extract folder name based on fieldname convention
      let folder = "others";
      if (fieldName.includes("pan")) folder = "pan";
      else if (fieldName.includes("aadhar")) folder = "aadhar";
      else if (fieldName.includes("incorporation")) folder = "incorporation";
      else if (fieldName.includes("partnership")) folder = "partnership";
      else if (fieldName.includes("company")) folder = "company";
      else if (fieldName.includes("address")) folder = "address";
      else if (fieldName.includes("photo")) folder = "photo";

      const fileExt = originalName.split('.').pop();
      const filePath = `promoter-files/${folder}/${originalName}`;

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
      console.log(uploadedUrls);
      
    }

    return res.status(200).json(uploadedUrls);

  } catch (error) {
    console.error('Unexpected error in uploadPromoterFiles:', error);
    return res.status(500).json({ message: 'Server error while uploading promoter files.' });
  }
};

export const getAllPromoters = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('promoters')
      .select('id, promoter_name, contact_number, email_id, district, city')
      .eq('status_for_delete','active');

    if (error) {
      console.error('❌ Error fetching promoters:', error);
      return res.status(500).json({ error: 'Failed to fetch promoters', details: error });
    }

    res.status(200).json({ promoters: data });
  } catch (err) {
    console.error('❌ Unexpected error in getAllPromoters:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const softDeletePromoterById = async (req, res) => {
  const promoterId = req.params.id;

  try {
    const { error } = await supabase
      .from('promoters')
      .update({ status_for_delete: 'inactive' })
      .eq('id', promoterId);

    if (error) {
      console.error('❌ Error soft deleting promoter:', error);
      return res.status(500).json({ error: 'Failed to delete promoter', details: error });
    }

    res.status(200).json({ message: '✅ Promoter marked as inactive' });
  } catch (err) {
    console.error('❌ Unexpected error in softDeletePromoterById:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPromoterById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('promoters')
      .select(`
        id,
        promoter_name,
        contact_number,
        email_id,
        district,
        city,
        promoter_type,
        status_for_delete,
        promoter_details (
          full_name,
          office_address,
          aadhar_number,
          aadhar_uploaded_url,
          pan_number,
          pan_uploaded_url,
          dob,
          contact_person_name,
          partnership_pan_number,
          partnership_pan_uploaded_url,
          company_pan_number,
          company_pan_uploaded_url,
          company_incorporation_number,
          company_incorporation_uploaded_url,
          promoter_photo_uploaded_url
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`❌ Error fetching promoter with ID ${id}:`, error);
      return res.status(500).json({ error: 'Failed to fetch promoter', details: error });
    }

    if (!data) {
      return res.status(404).json({ error: 'Promoter not found or inactive' });
    }

    // Merge promoter and promoterDetails
    const merged = {
      ...data,
      ...(data.PromoterDetails || {})
    };
    delete merged.PromoterDetails;

    res.status(200).json({ promoter: merged });

  } catch (err) {
    console.error('❌ Unexpected error in getPromoterById:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

